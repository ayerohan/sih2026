import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, Sparkles, User, Cpu, Activity, BarChart3, Zap } from 'lucide-react';

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
    content: '🔧 Welcome to SiteSync Intelligence. I can help you with project insights, progress analysis, anomaly detection, and WBS schedule forecasting. What would you like to know?',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    role: 'user',
    content: 'What is the current progress status of the pipeline laying activities?',
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: '3',
    role: 'assistant',
    content: '📊 **Pipeline Laying Progress Summary (S5-ONGC-2026)**\n\n• **Overall Completion**: 67.3% (planned: 72.1%)\n• **Variance**: -4.8% — flagged as AT RISK\n• **Active L6 Activities**: 12 of 18 in progress\n• **Top Bottleneck**: Welding & NDT inspection at KP-42 to KP-58 segment\n• **Field Reports Filed Today**: 4 (2 pending AI verification)\n\n⚠️ Recommendation: Increase crew allocation at Section B welding stations to recover schedule variance before the monsoon window.',
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: '4',
    role: 'user',
    content: 'Show me the AI match confidence trend for last week',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '5',
    role: 'assistant',
    content: '📈 **AI Match Confidence — Last 7 Days**\n\n| Day | Avg Confidence | Matches | Auto-Accepted |\n|-----|---------------|---------|---------------|\n| Mon | 91.2% | 8 | 6 |\n| Tue | 88.7% | 12 | 9 |\n| Wed | 93.1% | 6 | 5 |\n| Thu | 85.4% | 10 | 7 |\n| Fri | 90.8% | 9 | 7 |\n| Sat | 87.3% | 5 | 3 |\n| Sun | 92.6% | 3 | 3 |\n\n✅ **Average weekly confidence: 89.9%** — within acceptable threshold.\n🔍 Thursday dip correlates with new crew onboarding at Section C.',
    timestamp: new Date(Date.now() - 60000),
  },
];

const DEMO_MESSAGES_HI: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: '🔧 SiteSync इंटेलिजेंस में आपका स्वागत है। मैं परियोजना अंतर्दृष्टि, प्रगति विश्लेषण, विसंगति पहचान और WBS शेड्यूल पूर्वानुमान में आपकी सहायता कर सकता हूँ। आप क्या जानना चाहेंगे?',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    role: 'user',
    content: 'पाइपलाइन बिछाने की गतिविधियों की वर्तमान प्रगति स्थिति क्या है?',
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: '3',
    role: 'assistant',
    content: '📊 **पाइपलाइन बिछाने की प्रगति सारांश (S5-ONGC-2026)**\n\n• **कुल पूर्णता**: 67.3% (योजना: 72.1%)\n• **विचलन**: -4.8% — जोखिम में चिह्नित\n• **सक्रिय L6 गतिविधियाँ**: 18 में से 12 प्रगति पर\n• **मुख्य बाधा**: KP-42 से KP-58 खंड में वेल्डिंग और NDT निरीक्षण\n• **आज दाखिल फील्ड रिपोर्ट**: 4 (2 AI सत्यापन लंबित)\n\n⚠️ सिफारिश: मानसून से पहले शेड्यूल विचलन की भरपाई के लिए खंड B वेल्डिंग स्टेशनों पर क्रू आवंटन बढ़ाएं।',
    timestamp: new Date(Date.now() - 180000),
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

const AI_RESPONSES_EN = [
  '📊 Based on current field data, the overall project health index is at **78.4%**. The primary risk factor is the welding crew availability at Section B, which is operating at 60% capacity. I recommend reallocating 2 additional crews from the completed Section A.\n\n**Key Metrics:**\n• Safety incidents this week: 0 ✅\n• Quality audit pass rate: 94.2%\n• Equipment utilization: 82.7%',
  '🔍 **Anomaly Detection Report**\n\nI detected 3 potential anomalies in recent field submissions:\n\n1. **Report #FR-247**: GPS coordinates differ from assigned work zone by 1.2km — possible data entry error\n2. **Report #FR-251**: Photo timestamp is 4 hours before submission — flagged for review\n3. **Report #FR-253**: Material quantity reported exceeds daily allocation by 35%\n\nRecommendation: Route these to the review queue for manual verification.',
  '⚙️ **Schedule Forecast Analysis**\n\nBased on the current burn rate and crew productivity trends:\n\n• **Expected completion**: 15 Dec 2026 (planned: 30 Nov 2026)\n• **Delay risk**: 15 days behind schedule\n• **Recovery options**:\n  - Adding weekend shifts could recover 8 days\n  - Parallel execution of non-critical path activities could save 5 days\n  - Combined approach: On-time delivery achievable ✅',
];

const AI_RESPONSES_HI = [
  '📊 वर्तमान फील्ड डेटा के आधार पर, कुल परियोजना स्वास्थ्य सूचकांक **78.4%** पर है। मुख्य जोखिम कारक खंड B में वेल्डिंग क्रू की उपलब्धता है, जो 60% क्षमता पर काम कर रही है।\n\n**मुख्य मेट्रिक्स:**\n• इस सप्ताह सुरक्षा घटनाएं: 0 ✅\n• गुणवत्ता ऑडिट पास दर: 94.2%\n• उपकरण उपयोग: 82.7%',
  '🔍 **विसंगति पहचान रिपोर्ट**\n\nमैंने हाल की फील्ड सबमिशन में 3 संभावित विसंगतियां पाई:\n\n1. **रिपोर्ट #FR-247**: GPS निर्देशांक निर्धारित कार्य क्षेत्र से 1.2km भिन्न\n2. **रिपोर्ट #FR-251**: फोटो टाइमस्टैम्प सबमिशन से 4 घंटे पहले\n3. **रिपोर्ट #FR-253**: सामग्री मात्रा दैनिक आवंटन से 35% अधिक',
];

export const IntelligenceChatPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(
    language === 'hi' ? DEMO_MESSAGES_HI : DEMO_MESSAGES_EN
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseIndexRef = useRef(0);

  useEffect(() => {
    setMessages(language === 'hi' ? DEMO_MESSAGES_HI : DEMO_MESSAGES_EN);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    const responses = language === 'hi' ? AI_RESPONSES_HI : AI_RESPONSES_EN;
    const fallbackText = responses[responseIndexRef.current % responses.length];
    responseIndexRef.current += 1;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          language: language,
          project_id: 'PRJ-001',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages(prev => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: data.reply,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
          return;
        }
      }
    } catch {
      // Backend offline or timeout -> use intelligent fallback
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: fallbackText,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    simulateResponse(trimmed);
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = language === 'hi' ? QUICK_PROMPTS_HI : QUICK_PROMPTS_EN;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-graphite-200 mb-4 shrink-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {language === 'hi' ? 'AI इंटेलिजेंस' : 'AI Intelligence'}
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            {language === 'hi' ? 'इंटरैक्टिव सहायक' : 'Interactive Assistant'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
          {language === 'hi' ? 'SiteSync बुद्धिमत्ता' : 'SiteSync Intelligence'}
        </h1>
        <p className="text-sm text-graphite-600 mt-1">
          {language === 'hi'
            ? 'परियोजना अंतर्दृष्टि, विश्लेषण और पूर्वानुमान के लिए AI-संचालित सहायक।'
            : 'AI-powered assistant for project insights, analysis, and forecasting.'}
        </p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-brand to-amber-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-graphite-900 text-white rounded-br-md'
                  : 'bg-white border border-graphite-200 text-graphite-800 rounded-bl-md shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[10px] mt-2 font-mono ${
                  msg.role === 'user' ? 'text-graphite-400' : 'text-graphite-400'
                }`}
              >
                {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-graphite-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-graphite-300" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-brand to-amber-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-graphite-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-amber-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-amber-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="shrink-0 py-3 border-t border-graphite-200/50">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => {
            const Icon = prompt.icon;
            return (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-graphite-100 hover:bg-amber-brand/10 border border-graphite-200 hover:border-amber-brand/40 rounded-xl text-xs font-medium text-graphite-700 hover:text-amber-brand transition-all cursor-pointer"
              >
                <Icon className="w-3 h-3" />
                {prompt.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 pt-2 pb-2">
        <div className="flex items-center gap-3 bg-white border border-graphite-200 rounded-2xl px-4 py-2 shadow-sm focus-within:border-amber-brand focus-within:ring-2 focus-within:ring-amber-brand/20 transition-all">
          <Sparkles className="w-4 h-4 text-amber-brand shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'hi' ? 'SiteSync AI से कुछ पूछें...' : 'Ask SiteSync AI anything...'}
            className="flex-1 text-sm text-graphite-900 placeholder:text-graphite-400 outline-none bg-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              input.trim() && !isTyping
                ? 'bg-amber-brand hover:bg-amber-600 text-white cursor-pointer shadow-sm'
                : 'bg-graphite-100 text-graphite-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-graphite-400 mt-2 font-mono">
          {language === 'hi'
            ? 'SiteSync AI • डेमो मोड • गलतियाँ हो सकती हैं'
            : 'SiteSync AI • Demo Mode • Responses are simulated'}
        </p>
      </div>
    </div>
  );
};
