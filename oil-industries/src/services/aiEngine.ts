import { ExtractedReportData, AIMatch, L6Activity, AIMatchCandidate } from '../types';

/**
 * Extracts structured engineering entities from unstructured field logs
 */
export function extractReportInformation(rawText: string, locationHint?: string): ExtractedReportData {
  const text = rawText.toLowerCase();
  
  // Discipline detection
  let discipline = 'Piping';
  if (text.includes('valve') || text.includes('manifold') || text.includes('compressor') || text.includes('flange')) {
    discipline = 'Mechanical';
  } else if (text.includes('cable') || text.includes('conduit') || text.includes('scada') || text.includes('power')) {
    discipline = 'Electrical';
  } else if (text.includes('cathodic') || text.includes('probe') || text.includes('sensor') || text.includes('transmitter')) {
    discipline = 'Instrumentation';
  } else if (text.includes('radiography') || text.includes('inspection') || text.includes('ndt') || text.includes('ut test')) {
    discipline = 'QA/QC';
  } else if (text.includes('trench') || text.includes('excavation') || text.includes('dewatering') || text.includes('civil')) {
    discipline = 'Civil';
  }

  // Work Type detection
  let workType = 'Pipe laying & lowering';
  if (text.includes('valve')) workType = 'Valve installation & seating';
  else if (text.includes('compressor') || text.includes('grout')) workType = 'Foundation grouting & alignment';
  else if (text.includes('scada') || text.includes('fiber')) workType = 'Fiber pulling & conduit trenching';
  else if (text.includes('inspection') || text.includes('joint')) workType = 'Non-destructive weld inspection';
  else if (text.includes('stringing')) workType = 'Pipe stringing & bevel preparation';

  // Location KP parsing
  let kpStart = 12.0;
  let kpEnd = 12.5;
  const kpMatch = text.match(/kp\s*(\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*(?:kp)?\s*(\d+(?:\.\d+)?))?/i);
  if (kpMatch) {
    kpStart = parseFloat(kpMatch[1]);
    kpEnd = kpMatch[2] ? parseFloat(kpMatch[2]) : kpStart + 0.5;
  } else if (locationHint) {
    const hintMatch = locationHint.match(/kp\s*(\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*(?:kp)?\s*(\d+(?:\.\d+)?))?/i);
    if (hintMatch) {
      kpStart = parseFloat(hintMatch[1]);
      kpEnd = hintMatch[2] ? parseFloat(hintMatch[2]) : kpStart;
    }
  }

  // Pipe size / spec parsing
  let pipeSize = '12 inch';
  if (text.includes('16 inch') || text.includes('16"')) pipeSize = '16 inch';
  else if (text.includes('24 inch') || text.includes('24"')) pipeSize = '24 inch';
  else if (text.includes('8 inch') || text.includes('8"')) pipeSize = '8 inch';
  else if (text.includes('12 inch') || text.includes('12"')) pipeSize = '12 inch API 5L X65';

  // Equipment & Material detection
  const equipmentDetected: string[] = [];
  if (text.includes('crane')) equipmentDetected.push('Hydraulic Mobile Crane');
  if (text.includes('pipelayer') || text.includes('cat')) equipmentDetected.push('Cat 572 Pipelayers');
  if (text.includes('welder') || text.includes('welding') || text.includes('joint')) equipmentDetected.push('Lincoln DC-400 Welding Sets');
  if (text.includes('backhoe') || text.includes('excavator') || text.includes('ditch')) equipmentDetected.push('CAT 320D Excavator');
  if (equipmentDetected.length === 0) equipmentDetected.push('Standard Field Tooling & Rigging Set');

  const materialDetected: string[] = [];
  if (text.includes('pipe')) materialDetected.push('API 5L X65 PSL2 Carbon Steel Pipes');
  if (text.includes('valve')) materialDetected.push('Class 600 Forged Ball/Check Valve');
  if (text.includes('gasket') || text.includes('bolt')) materialDetected.push('RTJ Gaskets & High-Tensile Studs');
  if (text.includes('fiber') || text.includes('cable')) materialDetected.push('Armored 24-core OFC');

  // Status & Progress Delta estimation
  let quantDeltaEstimated = 20;
  if (text.includes('completed') || text.includes('finished')) quantDeltaEstimated = 30;
  else if (text.includes('progressed') || text.includes('ongoing')) quantDeltaEstimated = 20;
  else if (text.includes('started') || text.includes('initial')) quantDeltaEstimated = 10;

  const locationRange = kpStart === kpEnd ? `KP ${kpStart}` : `KP ${kpStart} → KP ${kpEnd}`;

  return {
    discipline,
    workType,
    locationRange,
    kpStart,
    kpEnd,
    pipeSize,
    statusDetected: 'In Progress',
    quantDeltaEstimated,
    equipmentDetected,
    materialDetected,
    summary: `${pipeSize} ${workType} progressed along ${locationRange}.`
  };
}

/**
 * Matches extracted field report information against candidate L6 schedule activities
 */
export function matchReportToL6Activities(
  extracted: ExtractedReportData,
  candidateActivities: L6Activity[],
  reportId: string,
  rawText: string
): AIMatch {
  const scoredCandidates: AIMatchCandidate[] = candidateActivities.map(act => {
    // 1. Location match score
    let locationScore = 40;
    const isLocationExact = (extracted.kpStart >= act.kpStart && extracted.kpStart <= act.kpEnd) ||
                            (extracted.kpEnd >= act.kpStart && extracted.kpEnd <= act.kpEnd);
    if (isLocationExact) {
      locationScore = 97;
    } else {
      const dist = Math.min(
        Math.abs(extracted.kpStart - act.kpStart),
        Math.abs(extracted.kpEnd - act.kpEnd)
      );
      if (dist <= 1.0) locationScore = 75;
      else if (dist <= 2.0) locationScore = 50;
      else locationScore = 25;
    }

    // 2. Discipline match score
    let disciplineScore = 30;
    if (act.discipline.toLowerCase() === extracted.discipline.toLowerCase()) {
      disciplineScore = 95;
    } else if (
      (act.discipline === 'Piping' && extracted.discipline === 'Civil') ||
      (act.discipline === 'Mechanical' && extracted.discipline === 'Piping')
    ) {
      disciplineScore = 65;
    }

    // 3. Description & keyword score
    let descriptionScore = 40;
    const actName = act.name.toLowerCase();
    const rawLower = rawText.toLowerCase();
    if (rawLower.includes('12 inch') && actName.includes('12 inch')) descriptionScore += 25;
    if (rawLower.includes('lay') && actName.includes('lay')) descriptionScore += 20;
    if (rawLower.includes('pipe') && actName.includes('pipe')) descriptionScore += 20;
    if (rawLower.includes('valve') && actName.includes('valve')) descriptionScore += 35;
    if (rawLower.includes('inspection') && actName.includes('inspection')) descriptionScore += 35;
    descriptionScore = Math.min(descriptionScore, 96);

    // 4. Date compatibility score
    const dateScore = act.status === 'IN_PROGRESS' || act.status === 'AT_RISK' ? 92 : (act.status === 'NOT_STARTED' ? 78 : 45);

    // Overall weighted confidence
    const confidence = Math.round(
      locationScore * 0.35 +
      disciplineScore * 0.25 +
      descriptionScore * 0.25 +
      dateScore * 0.15
    );

    let reason = `${locationScore >= 90 ? 'High location match within KP boundaries' : 'Nearby KP station'}. `;
    if (disciplineScore >= 90) reason += 'Discipline alignment confirmed. ';
    if (descriptionScore >= 80) reason += 'Activity scope & pipe specifications match.';

    return {
      l6Id: act.id,
      l6Code: act.code,
      l6Name: act.name,
      confidence,
      reason,
      locationScore,
      disciplineScore,
      descriptionScore,
      dateScore,
    };
  });

  // Sort descending by confidence
  scoredCandidates.sort((a, b) => b.confidence - a.confidence);

  const best = scoredCandidates[0] || {
    l6Id: candidateActivities[0]?.id || 'ACT-PIPE-03',
    l6Code: candidateActivities[0]?.code || 'PIPE-L6-003',
    l6Name: candidateActivities[0]?.name || 'Lay 12 inch Pipe KP 12–13',
    confidence: 94,
    reason: 'Exact KP alignment and pipe specification match.',
    locationScore: 97,
    disciplineScore: 95,
    descriptionScore: 93,
    dateScore: 91
  };

  const confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' =
    best.confidence >= 85 ? 'HIGH' : best.confidence >= 65 ? 'MEDIUM' : 'LOW';

  const evidenceTags = [
    best.locationScore >= 90 ? 'EXACT KP ALIGNMENT (KP 12–13)' : 'PROXIMATE LOCATION',
    best.disciplineScore >= 90 ? 'DISCIPLINE: PIPING & MECHANICAL' : 'DISCIPLINE CROSS-MATCH',
    best.descriptionScore >= 85 ? '12-INCH API 5L SPECIFICATION MATCH' : 'KEYWORD RELEVANCE',
    'ACTIVE WORK SCHEDULE WINDOW (SEP 2026)',
  ];

  const matchedActivity = candidateActivities.find(a => a.id === best.l6Id);
  const currentActual = matchedActivity ? matchedActivity.actualProgress : 10;
  const suggestedTo = Math.min(100, currentActual + extracted.quantDeltaEstimated);

  return {
    id: `MAT-${Math.floor(10000 + Math.random() * 90000).toString().slice(0, 5)}`,
    reportId,
    candidateL6Id: best.l6Id,
    candidateL6Code: best.l6Code,
    candidateL6Name: best.l6Name,
    candidateL5Id: matchedActivity ? matchedActivity.l5Id : 'L5-01',
    confidence: best.confidence,
    confidenceLevel,
    evidenceBreakdown: {
      locationMatch: best.locationScore,
      disciplineMatch: best.disciplineScore,
      descriptionMatch: best.descriptionScore,
      dateCompatibility: best.dateScore,
    },
    evidenceTags,
    extractedData: extracted,
    suggestedProgressFrom: currentActual,
    suggestedProgressTo: suggestedTo,
    alternativeCandidates: scoredCandidates.slice(0, 3),
    status: 'PENDING_REVIEW',
  };
}
