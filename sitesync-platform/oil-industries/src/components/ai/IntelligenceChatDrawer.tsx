import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Cpu,
  Activity,
  BarChart3,
  Zap,
  X,
  RotateCcw,
  MessageSquare,
  ChevronRight,
  Maximize2,
  Minimize2,
  Globe,
  Radio,
  KeyRound,
  Check,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DEMO_MESSAGES_EN: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: '🔧 **Welcome to SiteSync Intelligence.**\n\nI can assist you with real-time project progress, Primavera/MS Project schedule variance, anomaly detection in field reports, and L5/L6 rollups. How can I help today?',
    timestamp: new Date(Date.now() - 300000),
  },
];

const DEMO_MESSAGES_HI: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: '🔧 **SiteSync इंटेलिजेंस में आपका स्वागत है।**\n\nमैं वास्तविक समय की परियोजना प्रगति, शेड्यूल विचलन, फील्ड रिपोर्ट विसंगति पहचान और L5/L6 रोल-अप में आपकी सहायता कर सकता हूँ। आप क्या जानना चाहेंगे?',
    timestamp: new Date(Date.now() - 300000),
  },
];

const QUICK_PROMPTS_EN = [
  { icon: Activity, text: 'Project progress summary' },
  { icon: BarChart3, text: 'Show schedule variance' },
  { icon: Zap, text: 'Detect anomalies in reports' },
  { icon: Cpu, text: 'AI confidence statistics' },
];

const QUICK_PROMPTS_HI = [
  { icon: Activity, text: 'परियोजना प्रगति सारांश' },
  { icon: BarChart3, text: 'शेड्यूल विचलन दिखाएं' },
  { icon: Zap, text: 'रिपोर्ट में विसंगतियां खोजें' },
  { icon: Cpu, text: 'AI विश्वास सांख्यिकी' },
];

const FALLBACK_RESPONSES_EN = [
  '📊 **Project Progress Status (PEP-001)**\n\n• **Overall Completion**: 68.4% (Planned: 72.1%)\n• **Schedule Variance**: -3.7% (Minor Delay Risk)\n• **Primary Disciplines**: Piping (74%), Civil (89%), Electrical (52%)\n• **Active WBS Tasks**: 14 of 18 in progress\n• **Recommendation**: Reallocate 2 additional welding teams to recovery shifts before the monsoon window.',
  '⚠️ **Schedule Variance & Risk Analysis**\n\n• **Critical Path**: Underground stormwater piping & welding inspection (KP 12–KP 14)\n• **Bottleneck Identified**: NDT inspection turnaround time currently at 36h vs target 12h.\n• **Action Required**: Prioritize weld verification in the AI Review Queue.',
  '🔍 **Anomaly Detection Report**\n\n1. **Report #FR-00472**: KP coordinate variance detected (0.8km offset from assigned L6 zone)\n2. **Report #FR-00471**: Daily pipe consumption exceeds standard forecast by 22%\n\n✅ Both items routed to the **AI Review Queue** for Project Manager verification.',
  '📈 **AI Semantic Matcher Performance**\n\n• **Average Match Confidence**: 91.4%\n• **Auto-Link Rate**: 78% (Confidence > 85%)\n• **Pending Review**: 18%\n• **False Positive Rejection**: 4%\n• **Engine**: Multi-Format SentenceTransformer + RapidFuzz Live.',
];

const FALLBACK_RESPONSES_HI = [
  '📊 **परियोजना प्रगति स्थिति (PEP-001)**\n\n• **कुल पूर्णता**: 68.4% (नियोजित: 72.1%)\n• **अनुसूची विचलन**: -3.7% (मामूली जोखिम)\n• **प्राथमिक अनुशासन**: Piping (74%), Civil (89%), Electrical (52%)\n• **सिफारिश**: मानसून से पहले अतिरिक्त वेल्डिंग क्रू तैनात करें।',
  '⚠️ **अनुसूची विचलन और जोखिम विश्लेषण**\n\n• जोखिम में पहचानी गई गतिविधियां: 2 (KP 12–14 पाइप बिछाने का कार्य)\n• सबसे संवेदनशील खंड: वेल्डिंग और NDT निरीक्षण\n• सिफारिश: समीक्षा कतार में लंबित सत्यापन को तुरंत स्वीकृत करें।',
  '🔍 **विसंगति पहचान रिपोर्ट**\n\n• **रिपोर्ट #FR-00472**: GPS निर्देशांक कार्य क्षेत्र से 0.8km भिन्न\n• **रिपोर्ट #FR-00471**: सामग्री की मात्रा दैनिक सीमा से 22% अधिक\n• स्थिति: समीक्षा कतार (Review Queue) में भेजी गई है।',
  '📈 **AI मैच विश्वसनीयता सांख्यिकी**\n\n• औसत मैच विश्वास: **91.4%**\n• उच्च विश्वसनीयता (High): 78%\n• मध्यम विश्वसनीयता (Medium): 18%\n• मैन्युअल समीक्षा दर: 4%',
];

// Formatted Markdown and Table Renderer
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-graphite-950 dark:text-amber-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-graphite-200/80 dark:bg-graphite-800 text-amber-700 dark:text-amber-300 font-mono text-[10px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    // Markdown Table Detection
    if (line.trim().startsWith('|') && line.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .map(c => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const bodyLines = tableLines.slice(2);

        elements.push(
          <div
            key={`table-${i}`}
            className="my-2.5 overflow-x-auto rounded-xl border border-graphite-200 dark:border-graphite-750 bg-white/70 dark:bg-graphite-900/80 shadow-xs"
          >
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-graphite-100/90 dark:bg-graphite-800 border-b border-graphite-200 dark:border-graphite-700">
                  {headerCells.map((cell, cIdx) => (
                    <th key={cIdx} className="px-2.5 py-1.5 font-bold text-graphite-800 dark:text-amber-300 whitespace-nowrap">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800">
                {bodyLines.map((bLine, rIdx) => {
                  const cells = bLine
                    .split('|')
                    .map(c => c.trim())
                    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                  return (
                    <tr key={rIdx} className="hover:bg-amber-500/5 dark:hover:bg-amber-400/5 transition-colors">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-2.5 py-1.5 text-graphite-700 dark:text-graphite-300">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Section Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-3 mb-1.5 flex items-center gap-1.5">
          <span>{line.slice(4)}</span>
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-extrabold text-graphite-950 dark:text-amber-300 mt-3.5 mb-1.5">
          {line.slice(3)}
        </h3>
      );
      i++;
      continue;
    }

    // Bullet / numbered list item
    if (line.trim().startsWith('•') || line.trim().startsWith('- ') || /^\d+\.\s/.test(line.trim())) {
      const matchNumber = line.trim().match(/^(\d+)\.\s/);
      const prefix = matchNumber ? `${matchNumber[1]}.` : '•';
      const cleanContent = line.replace(/^(\s*[•\-\*]|\s*\d+\.)\s*/, '');
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-1.5 pl-1 my-0.5 leading-relaxed">
          <span className="text-amber-brand font-bold shrink-0 mt-0.5 text-[11px]">{prefix}</span>
          <div className="flex-1">{renderInline(cleanContent)}</div>
        </div>
      );
      i++;
      continue;
    }

    // Spacing
    if (!line.trim()) {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
};

export const IntelligenceChatDrawer: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { projects, selectedProjectId, l5Processes, l6Activities, fieldReports, workers } = useProject();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(
    language === 'hi' ? DEMO_MESSAGES_HI : DEMO_MESSAGES_EN
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openAiKey, setOpenAiKey] = useState<string>(() => localStorage.getItem('sitesync_openai_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return language === 'hi' ? DEMO_MESSAGES_HI : DEMO_MESSAGES_EN;
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  const handleSaveKey = () => {
    const trimmed = tempKey.trim();
    setOpenAiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('sitesync_openai_key', trimmed);
    } else {
      localStorage.removeItem('sitesync_openai_key');
    }
    setShowKeyModal(false);
  };

  const clientSmartReply = (query: string, lang: string): string => {
    const q = query.trim().toLowerCase();
    const isHi = lang === 'hi';
    const curProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    // Safe simple math
    try {
      const cleaned = q.replace(/[^0-9\+\-\*\/\.\(\)\s]/g, '').trim();
      if (cleaned && /[\+\-\*\/]/.test(cleaned)) {
        const val = Function(`'use strict'; return (${cleaned})`)();
        if (typeof val === 'number' && !isNaN(val)) {
          return isHi
            ? `🔢 **गणना परिणाम**\n\n• अभिव्यक्ति: \`${query}\`\n• उत्तर: **${val}**\n\nसामग्री उपभोग या निर्माण परिमाण से जुड़ी अन्य गणना के लिए बताएं।`
            : `🔢 **Calculation Result**\n\n• **Expression**: \`${query}\`\n• **Result**: **${val}**\n\nNeed any construction quantity or pipeline capacity estimation? Just let me know!`;
        }
      }
    } catch {}

    // Greetings
    if (['hi', 'hello', 'hey', 'namaste', 'help', 'who are you', 'नमस्ते'].some(g => q.startsWith(g) || q === g)) {
      return isHi
        ? `👋 **नमस्ते! मैं SiteSync इंटेलिजेंस AI हूँ।**\n\nमैं वास्तविक समय में निर्माण अनुसूची (Primavera WBS), अर्न्ड वैल्यू (EVM), फील्ड रिपोर्ट्स और पाइपलाइन मानकों में सहायता करता हूँ। आप परियोजना के मेट्रिक्स, विलंबित गतिविधियाँ, या फील्ड विसंगतियों के बारे में पूछ सकते हैं।`
        : `👋 **Hello! I am SiteSync Intelligence AI.**\n\nI am your live capital project engineering assistant. You can ask for real-time project metrics, Primavera P6 schedule variance, delayed L6 activities, worker headcount, or anomaly inspection. What would you like to examine?`;
    }

    // 1. Metrics / KPI / Status Query
    if (
      [
        'metric',
        'kpi',
        'number',
        'data',
        'status',
        'progress',
        'summary',
        'overview',
        'प्रदर्शन',
        'मेट्रिक्स',
        'प्रगति',
        'स्थिति',
      ].some(w => q.includes(w))
    ) {
      const planned = curProject?.plannedProgress ?? 79.0;
      const actual = curProject?.actualProgress ?? 72.0;
      const variance = (actual - planned).toFixed(1);
      const cpi = curProject?.cpi ?? 1.05;
      const spi = curProject?.spi ?? 0.98;
      const budget = curProject?.budgetTotalCr ? `₹${curProject.budgetTotalCr} Cr` : '₹480.5 Cr';
      const spent = curProject?.spentCr ? `₹${curProject.spentCr} Cr` : '₹341.2 Cr';
      const workersCount = curProject?.totalWorkersOnSite ?? workers.length ?? 248;

      const delayedList = l6Activities
        .filter(a => a.status === 'DELAYED' || a.variance < 0)
        .slice(0, 3)
        .map(
          (a, idx) =>
            `${idx + 1}. **${a.code}** (*${a.name}*): **${a.variance}% Variance** (Planned: ${a.plannedProgress}%, Actual: ${a.actualProgress}%) · Assigned: *${a.assignedWorkerName}*`
        )
        .join('\n');

      const l5Rows = l5Processes
        .map(
          p =>
            `| \`${p.code}\` | **${p.name}** | ${p.weightInProject}% | ${p.plannedProgress}% | ${p.actualProgress}% | **${(p.actualProgress - p.plannedProgress).toFixed(1)}%** | ${p.actualProgress < p.plannedProgress ? '⚠️ AT RISK' : '✅ ON TRACK'} |`
        )
        .join('\n');

      return isHi
        ? `📊 **परियोजना निष्पादन मेट्रिक्स — ${curProject?.code || 'PEP-001'} (${curProject?.name || 'Paradip-Numaligarh Pipeline'})**

### 1. अर्न्ड वैल्यू प्रबंधन (EVM) प्रमुख संकेतक
| संकेतक | आधारभूत नियोजित | वास्तविक भौतिक | विचलन | स्थिति |
|---|---|---|---|---|
| **भौतिक प्रगति** | **${planned}%** | **${actual}%** | **${variance}%** | ${Number(variance) < 0 ? '⚠️ अनुसूची से पीछे' : '✅ समय पर'} |
| **लागत प्रदर्शन सूचकांक (CPI)** | 1.00 | **${cpi}** | +${(cpi - 1).toFixed(2)} | ✅ बजट अनुकूल |
| **अनुसूची प्रदर्शन सूचकांक (SPI)** | 1.00 | **${spi}** | ${(spi - 1).toFixed(2)} | ⚠️ क्रिटिकल पाथ सुधार आवश्यक |
| **कुल बजट** | ${budget} | ${spent} | शेष बजट अनुकूल | ✅ स्वीकृत सीमा के भीतर |
| **कार्यबल (Manpower)** | 250 लक्ष्य | **${workersCount} उपस्थित** | -2 | 👷 4 सुपरवाइजर तैनात |

### 2. लेवल 5 कार्य पैकेज विवरण
| WBS कोड | कार्य पैकेज | भार | नियोजित | वास्तविक | विचलन | स्थिति |
|---|---|---|---|---|---|---|
${l5Rows}

### 3. प्रमुख विलंबित L6 गतिविधियाँ
${delayedList}

### 4. अनुशंसित हस्तक्षेप
1. WBS 01.03 वेल्डिंग कार्य के लिए 2 अतिरिक्त वेल्डिंग दल तैनात करें।
2. समीक्षा कतार (Review Queue) में लंबित विसंगति रिपोर्टों का तुरंत समाधान करें।`
        : `📊 **Project Execution Metrics — ${curProject?.code || 'PEP-001'} (${curProject?.name || 'Paradip-Numaligarh Pipeline Spread-02'})**

### 1. Earned Value Management (EVM) Core KPIs
| Metric | Baseline Planned | Human-Verified Actual | Variance | Performance Status |
|---|---|---|---|---|
| **Physical Progress** | **${planned}%** | **${actual}%** | **${variance}%** | ${Number(variance) < 0 ? `⚠️ Behind Schedule (${variance}%)` : '✅ On Schedule'} |
| **Cost Performance Index (CPI)** | 1.00 | **${cpi}** | +${(cpi - 1).toFixed(2)} | ✅ Cost-Efficient (CPI > 1.0) |
| **Schedule Performance Index (SPI)** | 1.00 | **${spi}** | ${(spi - 1).toFixed(2)} | ⚠️ Critical Path Lag (SPI < 1.0) |
| **Total Project Budget** | ${budget} | ${spent} (Spent) | ₹139.3 Cr Rem. | ✅ Spent Within Budget |
| **Active Workforce** | 250 Target | **${workersCount} on Site** | -2 | 👷 4 Supervisors Deployed |

### 2. Level 5 Work Packages Performance Breakdown
| WBS Code | Work Package Name | Weight | Planned | Actual | Variance | Status |
|---|---|---|---|---|---|---|
${l5Rows}

### 3. Critical Path Bottlenecks & Delayed L6 Activities
${delayedList}

### 4. Immediate Recommended Interventions
1. Mobilize 2 additional secondary welding crews for Section B tie-ins to recover the schedule variance.
2. Verify and resolve pending DPR anomaly reports in the Review Queue to unlock physical progress rollups.`;
    }

    // 2. Delays / Bottlenecks Query
    if (['delay', 'behind', 'bottleneck', 'lag', 'विलंब', 'रुकावट'].some(w => q.includes(w))) {
      const delayedItems = l6Activities
        .filter(a => a.status === 'DELAYED' || a.variance < 0)
        .map(
          (a, i) =>
            `${i + 1}. **${a.code}** (*${a.name}*): **${a.variance}% Variance** | Planned: ${a.plannedProgress}% vs Actual: ${a.actualProgress}% | Assigned: **${a.assignedWorkerName}**`
        )
        .join('\n');

      return isHi
        ? `🚨 **क्रिटिकल पाथ पर विलंबित L6 गतिविधियाँ**:\n\n${delayedItems}\n\n**कार्यवाही**: वेल्डिंग और NDT रेडियोग्राफी में तेजी लाने के लिए फील्ड समीक्षा कतार में सत्यापन प्रक्रिया पूरी करें।`
        : `🚨 **Critical Path Delayed Activities (L6 WBS Breakdown)**:\n\n${delayedItems}\n\n**Recommended Action**: Accelerate NDT radiographic turnaround and approve pending weld verifications in the AI Review Queue.`;
    }

    // 3. Workers / Manpower Query
    if (['worker', 'manpower', 'labour', 'labor', 'crew', 'मजदूर', 'श्रमिक'].some(w => q.includes(w))) {
      return isHi
        ? `👷 **कार्यबल एवं संसाधन स्थिति (PEP-001)**:\n\n• **कुल ऑन-साइट जनशक्ति**: ${curProject?.totalWorkersOnSite || 248} कर्मी (लक्ष्य: 250)\n• **वेल्डिंग और फिटर**: 84 कर्मी\n• **नागरिक / खुदाई दल**: 92 कर्मी\n• **विद्युत एवं उपकरण**: 42 कर्मी\n• **साइट सुपरवाइजर**: 4 पर्यवेक्षक सक्रिय`
        : `👷 **Workforce & Labor Distribution (PEP-001)**:\n\n• **Total Active On-Site**: ${curProject?.totalWorkersOnSite || 248} Personnel (Target: 250)\n• **Welders & Fitters**: 84 personnel (Spread-02 mainline)\n• **Civil / Trenching Crew**: 92 personnel\n• **Electrical & Instrumentation**: 42 personnel\n• **Safety & Field Supervisors**: 4 Supervisors deployed`;
    }

    // Standards / API 1104
    if (q.includes('api 1104') || q.includes('welding') || q.includes('वेल्डिंग')) {
      return isHi
        ? `🛠️ **API 1104 वेल्डिंग मानक**: पाइपलाइन वेल्डिंग प्रक्रिया विनिर्देश (WPS) और गैर-विनाशकारी परीक्षण (NDT) रेडियोग्राफी और अल्ट्रासोनिक स्वीकृति मानदंड का पालन अनिवार्य है।`
        : `🛠️ **API 1104 Pipeline Welding Standard**: Outlines WPS/PQR qualification and radiographic/ultrasonic testing acceptance criteria for cross-country line-pipe joints.`;
    }

    if (q.includes('cpi') || q.includes('spi') || q.includes('evm') || q.includes('variance') || q.includes('विचलन')) {
      return isHi
        ? `📈 **अर्न्ड वैल्यू विश्लेषण (EVM)**:\n• **CPI = EV / AC** (वर्तमान: 1.05 - बजट अनुकूल)\n• **SPI = EV / PV** (वर्तमान: 0.98 - 2% सुधार लक्ष्य)\n• प्रमुख विचलन: KP 12–14 स्टॉर्मवॉटर पाइपिंग खंड।`
        : `📈 **Earned Value Analysis (PEP-001)**:\n• **CPI = EV / AC**: 1.05 (Favorable cost control)\n• **SPI = EV / PV**: 0.98 (Critical path needs 1.5-day schedule recovery)\n• Key Focus: Section B welding inspection turnaround.`;
    }

    // Default conversational reply
    return isHi
      ? `💡 **SiteSync AI विश्लेषण**\n\nआपके प्रश्न: *"${query}"* पर:\nवर्तमान में परियोजना ${curProject?.code || 'PEP-001'} के सभी कार्य पैकेज और फील्ड रिपोर्ट्स सक्रिय रूप से ट्रैक किए जा रहे हैं। क्या आप विशिष्ट WBS गतिविधियों, मेट्रिक्स, या फील्ड विसंगतियों के बारे में जानना चाहते हैं?`
      : `💡 **SiteSync AI Analysis**\n\nRegarding: *"${query}"*\nAll ${curProject?.code || 'PEP-001'} WBS Level 5/6 activities, material consumption logs, and field reports are actively synchronized. Would you like me to inspect specific work packages, variance metrics, or engineering procedures?`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const curProject = projects.find(p => p.id === selectedProjectId) || projects[0];

      const projectContextPayload = {
        project_id: curProject?.id || 'PRJ-001',
        project_name: curProject?.name || 'Paradip-Numaligarh Crude Pipeline Spread-02',
        project_code: curProject?.code || 'PEP-001',
        planned_progress: curProject?.plannedProgress ?? 79.0,
        actual_progress: curProject?.actualProgress ?? 72.0,
        variance: curProject?.variance ?? -7.0,
        cpi: curProject?.cpi ?? 1.05,
        spi: curProject?.spi ?? 0.98,
        budget: curProject?.budgetTotalCr ? `₹${curProject.budgetTotalCr} Cr` : '₹480.5 Cr',
        spent: curProject?.spentCr ? `₹${curProject.spentCr} Cr` : '₹341.2 Cr',
        total_workers: curProject?.totalWorkersOnSite ?? workers.length ?? 248,
        l5_count: l5Processes.length,
        l6_count: l6Activities.length,
        l5_summary: l5Processes.map(p => ({
          name: p.name,
          code: p.code,
          progress: p.actualProgress,
          planned: p.plannedProgress,
          weight: p.weightInProject,
        })),
        delayed_l6: l6Activities
          .filter(a => a.status === 'DELAYED' || a.variance < 0)
          .map(a => ({
            name: a.name,
            code: a.code,
            progress: a.actualProgress,
            planned: a.plannedProgress,
            assigned_to: a.assignedWorkerName,
          })),
        recent_anomalies: fieldReports
          .filter(r => r.status === 'REJECTED' || r.extractedData)
          .slice(0, 5)
          .map(r => ({
            report_number: r.reportNumber || r.id,
            location: r.locationText,
            issue: r.extractedData?.statusDetected || 'Variance detected',
          })),
      };

      const historyPayload = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: language,
          project_id: curProject?.id || 'PRJ-001',
          api_key: openAiKey || undefined,
          history: historyPayload,
          project_context: projectContextPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || data.response || data.message;
        if (replyText) {
          setMessages(prev => [
            ...prev,
            {
              id: String(Date.now() + 1),
              role: 'assistant',
              content: replyText,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
          return;
        }
      }
      throw new Error('API reply unavailable');
    } catch {
      // Contextual client fallback if server unavailable
      setTimeout(() => {
        const fallback = clientSmartReply(query, language);
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'assistant',
            content: fallback,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 350);
    }
  };

  const handleReset = () => {
    setMessages(language === 'hi' ? DEMO_MESSAGES_HI : DEMO_MESSAGES_EN);
  };

  const quickPrompts = language === 'hi' ? QUICK_PROMPTS_HI : QUICK_PROMPTS_EN;

  return (
    <>
      {/* Floating Action Trigger on the Right Side of All Pages */}
      <aside aria-label="SiteSync AI Assistant Trigger" className="fixed right-5 bottom-6 z-40 flex items-center gap-2 group">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-graphite-900/90 text-amber-brand text-xs font-semibold border border-graphite-700 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-auto"
            title={language === 'hi' ? 'एआई सहायक से पूछें' : 'Ask SiteSync AI'}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-brand animate-spin" style={{ animationDuration: '4s' }} />
            <span>{language === 'hi' ? 'एआई इंटेलिजेंस चैट' : 'AI Assistant'}</span>
            <ChevronRight className="w-3 h-3 text-graphite-400" />
          </button>
        )}

        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
            isOpen
              ? 'bg-graphite-900 text-amber-brand border-2 border-amber-brand rotate-90 scale-95'
              : 'bg-gradient-to-tr from-amber-500 via-amber-brand to-yellow-400 text-graphite-950 hover:scale-105 active:scale-95 shadow-amber-500/25 border-2 border-amber-300/40'
          }`}
          title={isOpen ? 'Close AI Chat' : 'Open SiteSync Intelligence Chat'}
          aria-label="Toggle AI Intelligence Chat"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-amber-brand" />
          ) : (
            <>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-600 text-[9px] font-extrabold text-white items-center justify-center font-mono">
                  AI
                </span>
              </span>
              <Cpu className="w-7 h-7 text-graphite-950" />
            </>
          )}
        </button>
      </aside>

      {/* Backdrop for mobile or focused mode */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-45 transition-opacity duration-300 sm:bg-black/20"
          aria-hidden="true"
        />
      )}

      {/* Responsive Slide-Over Bot Chat Drawer on Right Side */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex flex-col bg-white dark:bg-[#11151a] text-graphite-900 dark:text-graphite-100 shadow-2xl border-l border-graphite-200 dark:border-graphite-800 transition-all duration-300 ease-out font-sans ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        } ${
          isExpanded ? 'w-full sm:w-[640px]' : 'w-full sm:w-[440px] md:w-[460px]'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-graphite-200 dark:border-graphite-800 bg-graphite-50 dark:bg-graphite-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-brand flex items-center justify-center text-graphite-950 font-bold shadow-md shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-graphite-950 dark:text-white truncate">
                  SiteSync AI Intelligence
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-graphite-500 dark:text-graphite-400 truncate">
                {language === 'hi' ? 'बहु-प्रारूप निर्माण विश्लेषक' : 'Multi-Format Construction Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* OpenAI API Key Config Toggle */}
            <button
              onClick={() => {
                setShowKeyModal(prev => !prev);
                setTempKey(openAiKey);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                openAiKey
                  ? 'text-amber-brand bg-amber-500/15 border border-amber-brand/40 shadow-xs'
                  : 'text-graphite-500 hover:text-graphite-900 dark:text-graphite-400 dark:hover:text-white hover:bg-graphite-200 dark:hover:bg-graphite-800'
              }`}
              title={openAiKey ? 'OpenAI GPT-4o Key Connected' : 'Connect OpenAI API Key'}
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-700 dark:text-graphite-200 hover:text-amber-brand transition-colors flex items-center gap-1 cursor-pointer"
              title="Switch Language (English / Hindi)"
            >
              <Globe className="w-3 h-3 text-amber-brand" />
              <span>{language === 'en' ? 'HI' : 'EN'}</span>
            </button>

            {/* Reset Chat */}
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-graphite-500 hover:text-graphite-900 dark:text-graphite-400 dark:hover:text-white hover:bg-graphite-200 dark:hover:bg-graphite-800 transition-colors cursor-pointer"
              title={language === 'hi' ? 'बातचीत रीसेट करें' : 'Reset Conversation'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Expand / Minimize Width on Desktop */}
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-graphite-500 hover:text-graphite-900 dark:text-graphite-400 dark:hover:text-white hover:bg-graphite-200 dark:hover:bg-graphite-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Narrow Drawer' : 'Expand Drawer'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-graphite-500 hover:text-rose-600 dark:text-graphite-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OpenAI Key Configuration Strip */}
        {showKeyModal && (
          <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 flex flex-col gap-2 shrink-0 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-graphite-900 dark:text-amber-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-brand" />
                <span>OpenAI API Key (Optional)</span>
              </span>
              <span className="text-[10px] text-graphite-500 font-mono">
                {openAiKey ? 'Active: ••••••••' : 'Not set (Using SiteSync AI)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="sk-proj-..."
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-brand"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 bg-graphite-900 hover:bg-graphite-800 text-amber-brand text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
            <p className="text-[10px] text-graphite-500 dark:text-graphite-400">
              When provided, SiteSync queries OpenAI GPT-4o directly. When omitted, it uses the built-in industrial engineering engine.
            </p>
          </div>
        )}

        {/* Quick Prompts Carousel / Pills */}
        <div className="px-4 py-2.5 bg-graphite-100/70 dark:bg-graphite-900/50 border-b border-graphite-200 dark:border-graphite-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-graphite-400 shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-brand" />
            <span>{language === 'hi' ? 'त्वरित:' : 'Quick:'}</span>
          </span>
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.text)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-graphite-800 border border-graphite-200 dark:border-graphite-700 text-graphite-700 dark:text-graphite-300 hover:border-amber-brand hover:text-amber-brand transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                <Icon className="w-3 h-3 text-amber-brand shrink-0" />
                <span className="whitespace-nowrap">{item.text}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-amber-brand text-graphite-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-3.5 space-y-1.5 ${
                  msg.role === 'user'
                    ? 'max-w-[85%] bg-graphite-900 text-white rounded-tr-none'
                    : 'max-w-[95%] sm:max-w-[92%] bg-graphite-100 dark:bg-graphite-850 text-graphite-900 dark:text-graphite-100 border border-graphite-200 dark:border-graphite-750 rounded-tl-none'
                }`}
              >
                <FormattedMessage content={msg.content} />
                <div
                  className={`text-[10px] text-right font-mono ${
                    msg.role === 'user' ? 'text-graphite-400' : 'text-graphite-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-graphite-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Animation */}
          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-amber-brand text-graphite-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-graphite-100 dark:bg-graphite-850 border border-graphite-200 dark:border-graphite-750 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-brand animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-brand animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-brand animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] text-graphite-500 ml-2 font-medium">Analyzing field records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-graphite-200 dark:border-graphite-800 bg-white dark:bg-graphite-900/90 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'परियोजना प्रगति, जोखिम, विचलन के बारे में पूछें...'
                  : 'Ask about project progress, variance, risks...'
              }
              className="flex-1 px-4 py-3 rounded-xl bg-graphite-50 dark:bg-graphite-800 border border-graphite-300 dark:border-graphite-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-brand dark:text-white"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 rounded-xl bg-amber-brand hover:bg-amber-hover text-graphite-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0 cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-graphite-400 mt-2 px-1">
            <span className="flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
              <span>SentenceTransformer + RapidFuzz Engine</span>
            </span>
            <span>Port 8000 Live</span>
          </div>
        </div>
      </div>
    </>
  );
};
