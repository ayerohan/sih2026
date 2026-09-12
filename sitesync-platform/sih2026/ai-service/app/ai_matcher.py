"""
AI-powered schedule activity matcher.

Matches extracted field events to Primavera/P6 L5/L6 schedule activities
using semantic similarity, entities, discipline, keywords and construction phase.
"""

import re
from typing import Any

import numpy as np
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"

# Confidence thresholds
AUTO_MATCH_THRESHOLD = 0.75
REVIEW_THRESHOLD = 0.50


class AIActivityMatcher:
    """
    Matches field execution events against planned schedule activities.
    """

    def __init__(self) -> None:
        print(f"Loading embedding model: {MODEL_NAME}")
        self.model = SentenceTransformer(MODEL_NAME)
        self.activity_embeddings = None
        self.activities = []

    # ---------------------------------------------------------
    # Text helpers
    # ---------------------------------------------------------

    @staticmethod
    def _get(obj: Any, field: str, default: Any = None) -> Any:
        """Read a field from either a Pydantic model or dictionary."""
        if isinstance(obj, dict):
            return obj.get(field, default)

        return getattr(obj, field, default)

    @classmethod
    def _activity_text(cls, activity: Any) -> str:
        """Create a rich searchable representation of a schedule activity."""

        parts = [
            str(cls._get(activity, "activity_code", "")),
            str(cls._get(activity, "activity_name", "")),
            str(cls._get(activity, "discipline", "")),
            str(cls._get(activity, "location", "")),
            str(cls._get(activity, "wbs_name", "")),
            str(cls._get(activity, "level", "")),
        ]

        return " ".join(
            part.strip()
            for part in parts
            if part and part.strip() and part.strip() != "None"
        )

    @classmethod
    def _event_text(cls, event: Any) -> str:
        """
        Convert an extracted event into searchable text.

        Works with different versions of ExtractedEvent because it
        reads available fields dynamically.
        """

        if isinstance(event, dict):
            values = event.values()
        else:
            try:
                values = event.model_dump().values()
            except AttributeError:
                values = vars(event).values()

        text_parts = []

        for value in values:
            if value is None:
                continue

            if isinstance(value, (str, int, float)):
                text_parts.append(str(value))

        return " ".join(text_parts)

    # ---------------------------------------------------------
    # Entity extraction
    # ---------------------------------------------------------

    @staticmethod
    def extract_entities(text: str) -> dict:
        text_lower = text.lower()

        # Line numbers such as L24, Line 24, line-24
        lines = re.findall(
            r"\b(?:l(?:ine)?[\s\-]?)(\d{1,4})\b",
            text_lower,
        )

        # Equipment numbers such as P101, E-101, TK-101
        equipment = re.findall(
            r"\b[A-Z]{1,4}[\-\s]?\d{2,5}\b",
            text.upper(),
        )

        # Percentages
        percentages = re.findall(
            r"\b\d{1,3}(?:\.\d+)?\s*%",
            text,
        )

        status = None

        if any(word in text_lower for word in [
            "completed",
            "complete",
            "finished",
            "done",
        ]):
            status = "completed"

        elif any(word in text_lower for word in [
            "started",
            "start",
            "began",
            "commenced",
        ]):
            status = "started"

        elif any(word in text_lower for word in [
            "progressing",
            "ongoing",
            "underway",
            "in progress",
        ]):
            status = "in_progress"

        return {
            "lines": set(lines),
            "equipment": set(equipment),
            "percentages": percentages,
            "status": status,
        }

    # ---------------------------------------------------------
    # Discipline
    # ---------------------------------------------------------

    @staticmethod
    def discipline_score(
        report_discipline: str | None,
        activity_discipline: str | None,
    ) -> float:

        if not report_discipline or not activity_discipline:
            return 0.5

        a = report_discipline.lower().strip()
        b = activity_discipline.lower().strip()

        if a == b:
            return 1.0

        # Common variations
        aliases = {
            "instrumentation": "instrumentation",
            "instrument": "instrumentation",
            "inst": "instrumentation",
            "mechanical": "mechanical",
            "mech": "mechanical",
            "structural": "structural",
            "structure": "structural",
            "civil": "civil",
            "piping": "piping",
            "pipe": "piping",
            "electrical": "electrical",
            "elect": "electrical",
            "painting": "painting",
            "paint": "painting",
            "insulation": "insulation",
            "insul": "insulation",
        }

        if aliases.get(a, a) == aliases.get(b, b):
            return 1.0

        return 0.0

    # ---------------------------------------------------------
    # Keyword matching
    # ---------------------------------------------------------

    @staticmethod
    def keyword_score(
        report_text: str,
        activity_text: str,
    ) -> float:

        keywords = {
            "erection",
            "erect",
            "installation",
            "install",
            "excavation",
            "excavate",
            "foundation",
            "concrete",
            "welding",
            "weld",
            "fabrication",
            "fabricate",
            "painting",
            "paint",
            "coating",
            "insulation",
            "insulate",
            "cable",
            "tray",
            "instrument",
            "instrumentation",
            "testing",
            "test",
            "commissioning",
            "commission",
            "grouting",
            "bolting",
            "support",
            "supports",
            "spool",
            "valve",
            "pipeline",
            "piping",
        }

        report_words = {
            word
            for word in re.findall(r"[a-zA-Z]+", report_text.lower())
            if word in keywords
        }

        activity_words = {
            word
            for word in re.findall(r"[a-zA-Z]+", activity_text.lower())
            if word in keywords
        }

        if not report_words:
            return 0.5

        overlap = report_words.intersection(activity_words)

        return min(
            1.0,
            len(overlap) / max(1, len(report_words)),
        )

    # ---------------------------------------------------------
    # Entity score
    # ---------------------------------------------------------

    @staticmethod
    def entity_score(
        entities: dict,
        activity_text: str,
    ) -> float:

        activity_upper = activity_text.upper()

        scores = []

        for line in entities.get("lines", set()):
            if re.search(rf"\b(?:L(?:INE)?[\s\-]?){re.escape(line)}\b",
                         activity_upper):
                scores.append(1.0)

        for equipment in entities.get("equipment", set()):
            if equipment in activity_upper:
                scores.append(1.0)

        if not scores:
            return 0.5

        return max(scores)

    # ---------------------------------------------------------
    # Fuzzy similarity
    # ---------------------------------------------------------

    @staticmethod
    def fuzzy_score(
        event_text: str,
        activity_text: str,
    ) -> float:

        score = fuzz.token_set_ratio(
            event_text.lower(),
            activity_text.lower(),
        )

        return score / 100.0

    # ---------------------------------------------------------
    # Candidate preparation
    # ---------------------------------------------------------

    def prepare_schedule(self, activities: list[Any]) -> None:
        """
        Prepare embeddings for schedule activities.

        Call this once before matching multiple field reports.
        """

        self.activities = list(activities)

        if not self.activities:
            self.activity_embeddings = np.empty((0, 384))
            return

        texts = [
            self._activity_text(activity)
            for activity in self.activities
        ]

        self.activity_embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

    # ---------------------------------------------------------
    # Main matching function
    # ---------------------------------------------------------

    def match(
        self,
        event: Any,
        activities: list[Any] | None = None,
    ) -> dict:

        if activities is not None:
            self.prepare_schedule(activities)

        if not self.activities:
            return {
                "matched_activity_id": None,
                "match_confidence": 0.0,
                "match_status": "NO_CANDIDATES",
                "explanation": "No schedule activities were provided.",
            }

        event_text = self._event_text(event)

        if not event_text.strip():
            return {
                "matched_activity_id": None,
                "match_confidence": 0.0,
                "match_status": "REVIEW",
                "explanation": "The extracted event contains no searchable text.",
            }

        # Get report discipline if available
        report_discipline = self._get(
            event,
            "discipline",
            None,
        )

        # Extract entities from the complete event text
        entities = self.extract_entities(event_text)

        # Event embedding
        event_embedding = self.model.encode(
            [event_text],
            normalize_embeddings=True,
            show_progress_bar=False,
        )[0]

        # Semantic similarity
        semantic_scores = np.dot(
            self.activity_embeddings,
            event_embedding,
        )

        candidates = []

        for index, activity in enumerate(self.activities):

            activity_text = self._activity_text(activity)

            semantic_score = float(
                max(0.0, min(1.0, semantic_scores[index]))
            )

            activity_discipline = self._get(
                activity,
                "discipline",
                None,
            )

            discipline = self.discipline_score(
                report_discipline,
                activity_discipline,
            )

            keyword = self.keyword_score(
                event_text,
                activity_text,
            )

            entity = self.entity_score(
                entities,
                activity_text,
            )

            fuzzy = self.fuzzy_score(
                event_text,
                activity_text,
            )

            # Main score
            base_score = (
                0.55 * semantic_score
                + 0.15 * discipline
                + 0.15 * keyword
                + 0.10 * entity
                + 0.05 * fuzzy
            )

            # Strong entity agreement gives a useful boost.
            if entity == 1.0:
                base_score += 0.05

            final_score = min(1.0, base_score)

            candidates.append({
                "index": index,
                "activity": activity,
                "score": final_score,
                "semantic_score": semantic_score,
                "discipline_score": discipline,
                "keyword_score": keyword,
                "entity_score": entity,
                "fuzzy_score": fuzzy,
            })

        # Sort best → worst
        candidates.sort(
            key=lambda item: item["score"],
            reverse=True,
        )

        best = candidates[0]

        confidence = float(best["score"])

        activity = best["activity"]

        activity_id = self._get(activity, "id")

        if confidence >= AUTO_MATCH_THRESHOLD:
            status = "AUTO_MATCH"

        elif confidence >= REVIEW_THRESHOLD:
            status = "REVIEW"

        else:
            status = "UNMATCHED"
            activity_id = None

        explanation_parts = []

        if best["discipline_score"] == 1.0:
            explanation_parts.append("same discipline")

        if best["entity_score"] == 1.0:
            explanation_parts.append("matching line/equipment entity")

        if best["keyword_score"] >= 0.5:
            explanation_parts.append("matching construction keywords")

        if best["semantic_score"] >= 0.70:
            explanation_parts.append("strong semantic similarity")

        explanation = (
            "Matched using "
            + ", ".join(explanation_parts)
            if explanation_parts
            else "Match based primarily on semantic similarity"
        )

        return {
            "matched_activity_id": activity_id,
            "match_confidence": round(confidence, 4),
            "match_status": status,
            "explanation": explanation,
            "top_candidates": [
                {
                    "activity_id": self._get(
                        candidate["activity"],
                        "id",
                    ),
                    "activity_name": self._get(
                        candidate["activity"],
                        "activity_name",
                    ),
                    "score": round(
                        candidate["score"],
                        4,
                    ),
                }
                for candidate in candidates[:3]
            ],
        }


# -------------------------------------------------------------
# Singleton
# -------------------------------------------------------------

_matcher: AIActivityMatcher | None = None


def get_matcher() -> AIActivityMatcher:
    """
    Lazily create the matcher so the embedding model is loaded
    only when the AI matching functionality is actually used.
    """

    global _matcher

    if _matcher is None:
        _matcher = AIActivityMatcher()

    return _matcher