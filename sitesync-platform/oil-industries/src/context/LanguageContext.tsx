import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Top Navbar
    'nav.brand': 'SiteSync',
    'nav.subBrand': 'Project Control & Field Operations',
    'nav.langToggle': 'हिन्दी',

    // Admin Sidebar Groups & Items
    'nav.group.controlCenter': 'CONTROL CENTER',
    'nav.group.operations': 'OPERATIONS',
    'nav.group.intelligence': 'INTELLIGENCE & ADMIN',
    'nav.overview': 'Project Overview',
    'nav.schedule': 'Schedule (WBS)',
    'nav.progress': 'Progress & S-Curve',
    'nav.reports': 'Field Reports',
    'nav.review': 'Review Queue',
    'nav.hierarchy': 'L5 / L6 Hierarchy',
    'nav.analytics': 'AI Monitoring & Stats',
    'nav.audit': 'Audit Trail',
    'nav.supervisors': 'Field Supervisors',
    'nav.projects': 'All Projects',
    'nav.profile': 'Admin Profile',
    'nav.settings': 'Settings',
    'nav.intelligence': 'Intelligence Chat',

    // Supervisor Sidebar & Items
    'nav.group.today': 'TODAY',
    'nav.group.history': 'HISTORY & SYNC',
    'supervisor.dashboard': 'My Work Dashboard',
    'supervisor.tasks': 'Assigned L6 Tasks',
    'supervisor.submit': 'Submit Field Report',
    'supervisor.myReports': 'My Field Reports',
    'supervisor.profile': 'Field Profile & Badges',

    // Common Actions
    'btn.updateProgress': 'Update Progress',
    'btn.submitReport': '+ Submit Field Report',
    'btn.logReport': 'Log Report',
    'btn.details': 'Details',
    'btn.save': 'Save Configuration',
    'btn.cancel': 'Cancel',
    'btn.downloadProgress': 'Download Progress Report',
    'btn.addProject': '+ Add New Project',
    'btn.accept': 'Accept & Roll Up',
    'btn.reject': 'Reject Match',
    'btn.viewTaskDetails': 'View Task Details',
    'btn.viewAllLogs': 'View All Field Logs',
    'btn.toggleSidebar': 'Toggle Sidebar',

    // Status & Metrics
    'status.active': 'ACTIVE',
    'status.completed': 'COMPLETED',
    'status.critical': 'CRITICAL',
    'status.inProgress': 'IN PROGRESS',
    'status.onTrack': 'ON TRACK',
    'status.atRisk': 'AT RISK',
    'status.notStarted': 'NOT STARTED',
    'metric.planned': 'Planned',
    'metric.actual': 'Actual',
    'metric.variance': 'Variance',
    'metric.budget': 'Budget',
    'metric.timeline': 'Timeline',
    'metric.assignedTasks': 'Assigned Tasks',
    'metric.completedToday': 'Completed Today',
    'metric.criticalFocus': 'Critical Focus',

    // Headers & Banners
    'header.projectControl': 'Project Control',
    'header.portfolioOverview': 'Portfolio overview',
    'header.activeProjects': 'active EPC projects',
    'header.siteOps': 'Site Supervisor Portal',
    'header.goodDay': 'Welcome back',
    'header.aiAnalytics': 'AI Intelligence & Verification Analytics',
    'header.sysSettings': 'System Parameters & Thresholds',

    // Dashboard Keys
    'dash.title': 'Project Control',
    'dash.subtitle': 'Portfolio overview · active EPC projects · L5/L6 hierarchical variance intelligence',
    'dash.intelStatus': 'Intelligence Status',
    'dash.realtimeSync': 'Realtime Sync Active',
    'dash.activeProjects': 'Active Projects',
    'dash.allSectors': 'ALL SECTORS',
    'dash.onSchedule': 'On Schedule',
    'dash.onTrack': 'ON TRACK',
    'dash.varianceCritical': 'Variance Critical',
    'dash.scheduleLag': 'SCHEDULE LAG',
    'dash.pendingAI': 'Pending AI Approvals',
    'dash.actionRequired': 'ACTION REQUIRED',
    'dash.corridors': 'Assam & Bengal EPC Corridors',
    'dash.withinTolerance': 'Within ±5% Tolerance',
    'dash.delayedPkg': 'Sector 04 Package Lagging',
    'dash.queuedReports': 'Queued Field Reports',
    'dash.pipelineProjects': 'Active EPC Pipeline Projects',
    'dash.workPackages': 'Sector 04 Hierarchical Work Packages (L5)',
    'dash.liveAudit': 'Live Audit Trail',
    'dash.realtimeEvents': 'Realtime Engine Verification Stream',
    'dash.viewAudit': 'View Complete Audit Trail',
    'dash.exportProgress': 'Download Progress',
    'dash.newProject': '+ Add New Project',

    // Analytics Keys
    'analytics.title': 'AI Intelligence & Verification Analytics',
    'analytics.subtitle': 'Performance metrics for SiteSync AI matching engine, confidence distribution, and discipline accuracy.',
    'analytics.timeSeries': 'Time Series Execution',
    'analytics.throughput': 'Daily AI Parsing & Auto-Accept Trajectory',
    'analytics.qualityTiers': 'Quality Tiers',
    'analytics.distribution': 'Confidence Score Distribution',
    'analytics.engineering': 'Engineering Disciplines',
    'analytics.departments': 'Resolution Throughput by Department',
    'analytics.composition': 'Algorithmic Composition',
    'analytics.multiModal': '4-Dimensional Multi-Modal Weighting & Match Accuracy',
    'analytics.totalLogs': 'Total Logs Ingested',
    'analytics.autoAccepted': 'Auto-Accepted',

    // Review Queue Keys
    'queue.title': 'AI Match Review Queue',
    'queue.subtitle': 'Review AI-suggested L6 activity matches. When verified, progress automatically rolls up to L5 and Project health.',
    'queue.pending': 'Pending Review',
    'queue.verified': 'Verified & Rolled Up',
    'queue.rejected': 'Rejected Matches',
    'queue.total': 'Total Processed',

    // Reports Keys
    'reports.title': 'Field Execution Reports & Worker Files',
    'reports.subtitle': 'Unstructured field logs and enrolled technical files (PDF, Excel, Word) submitted by field site engineers.',
    'reports.total': 'Total Field Reports',
    'reports.files': 'Enrolled Worker Files',
    'reports.verified': 'Verified Reports',
  },
  hi: {
    // Top Navbar
    'nav.brand': 'साइट-सिंक (SiteSync)',
    'nav.subBrand': 'परियोजना नियंत्रण और क्षेत्र संचालन',
    'nav.langToggle': 'English',

    // Admin Sidebar Groups & Items
    'nav.group.controlCenter': 'नियंत्रण केंद्र',
    'nav.group.operations': 'क्षेत्रीय संचालन',
    'nav.group.intelligence': 'खुफिया और प्रशासन',
    'nav.overview': 'परियोजना अवलोकन',
    'nav.schedule': 'कार्य अनुसूची (WBS)',
    'nav.progress': 'प्रगति और एस-वक्र',
    'nav.reports': 'क्षेत्रीय रिपोर्ट',
    'nav.review': 'एआई समीक्षा कतार',
    'nav.hierarchy': 'L5 / L6 पदानुक्रम',
    'nav.analytics': 'एआई निगरानी व विश्लेषण',
    'nav.audit': 'ऑडिट ट्रेल (निरीक्षण)',
    'nav.supervisors': 'क्षेत्र पर्यवेक्षक दल',
    'nav.projects': 'सभी परियोजनाएं',
    'nav.profile': 'प्रशासक प्रोफ़ाइल',
    'nav.settings': 'सिस्टम सेटिंग्स',
    'nav.intelligence': 'बुद्धिमत्ता चैट',

    // Supervisor Sidebar & Items
    'nav.group.today': 'आज का कार्य',
    'nav.group.history': 'इतिहास और सिंक',
    'supervisor.dashboard': 'मेरा कार्य डैशबोर्ड',
    'supervisor.tasks': 'आवंटित L6 कार्य',
    'supervisor.submit': 'क्षेत्र रिपोर्ट दर्ज करें',
    'supervisor.myReports': 'मेरी प्रस्तुत रिपोर्टें',
    'supervisor.profile': 'पर्यवेक्षक प्रोफ़ाइल',

    // Common Actions
    'btn.updateProgress': 'प्रगति अपडेट करें',
    'btn.submitReport': '+ क्षेत्र रिपोर्ट दर्ज करें',
    'btn.logReport': 'रिपोर्ट बनाएं',
    'btn.details': 'विवरण',
    'btn.save': 'कॉन्फ़िगरेशन सहेजें',
    'btn.cancel': 'रद्द करें',
    'btn.downloadProgress': 'प्रगति रिपोर्ट डाउनलोड करें',
    'btn.addProject': '+ नई परियोजना जोड़ें',
    'btn.accept': 'स्वीकार करें और रोल-अप करें',
    'btn.reject': 'अस्वीकार करें',
    'btn.viewTaskDetails': 'कार्य विवरण देखें',
    'btn.viewAllLogs': 'सभी फील्ड लॉग देखें',
    'btn.toggleSidebar': 'साइडबार टॉगल करें',

    // Status & Metrics
    'status.active': 'सक्रिय',
    'status.completed': 'पूर्ण',
    'status.critical': 'गंभीर',
    'status.inProgress': 'प्रगति पर',
    'status.onTrack': 'समय पर',
    'status.atRisk': 'जोखिम में',
    'status.notStarted': 'शुरू नहीं हुआ',
    'metric.planned': 'नियोजित',
    'metric.actual': 'वास्तविक',
    'metric.variance': 'विचलन',
    'metric.budget': 'कुल बजट',
    'metric.timeline': 'समय सीमा',
    'metric.assignedTasks': 'आवंटित कार्य',
    'metric.completedToday': 'आज पूर्ण हुए कार्य',
    'metric.criticalFocus': 'महत्वपूर्ण ध्यान क्षेत्र',

    // Headers & Banners
    'header.projectControl': 'परियोजना नियंत्रण केंद्र',
    'header.portfolioOverview': 'पोर्टफोलियो अवलोकन',
    'header.activeProjects': 'सक्रिय ईपीसी परियोजनाएं',
    'header.siteOps': 'स्थल पर्यवेक्षक पोर्टल',
    'header.goodDay': 'नमस्ते, स्वागत है',
    'header.aiAnalytics': 'एआई विश्लेषण और सत्यापन मेट्रिक्स',
    'header.sysSettings': 'सिस्टम पैरामीटर और सीमाएं',

    // Dashboard Keys (Hindi)
    'dash.title': 'परियोजना नियंत्रण',
    'dash.subtitle': 'पोर्टफोलियो अवलोकन · सक्रिय ईपीसी परियोजनाएं · L5/L6 पदानुक्रमित विचरण बुद्धिमत्ता',
    'dash.intelStatus': 'सिस्टम स्थिति',
    'dash.realtimeSync': 'रीयलटाइम सिंक सक्रिय',
    'dash.activeProjects': 'सक्रिय परियोजनाएं',
    'dash.allSectors': 'सभी क्षेत्र',
    'dash.onSchedule': 'समय पर',
    'dash.onTrack': 'सही दिशा में',
    'dash.varianceCritical': 'गंभीर विचलन',
    'dash.scheduleLag': 'अनुसूची में देरी',
    'dash.pendingAI': 'लंबित एआई अनुमोदन',
    'dash.actionRequired': 'कार्रवाई आवश्यक',
    'dash.corridors': 'असम और बंगाल ईपीसी कॉरिडोर',
    'dash.withinTolerance': '±5% सहनशीलता के भीतर',
    'dash.delayedPkg': 'सेक्टर 04 पैकेज पिछड़ा हुआ',
    'dash.queuedReports': 'कतारबद्ध फील्ड रिपोर्टें',
    'dash.pipelineProjects': 'सक्रिय ईपीसी पाइपलाइन परियोजनाएं',
    'dash.workPackages': 'सेक्टर 04 पदानुक्रमित कार्य पैकेज (L5)',
    'dash.liveAudit': 'लाइव ऑडिट ट्रेल',
    'dash.realtimeEvents': 'रीयलटाइम सत्यापन स्ट्रीम',
    'dash.viewAudit': 'संपूर्ण ऑडिट ट्रेल देखें',
    'dash.exportProgress': 'प्रगति डाउनलोड करें',
    'dash.newProject': '+ नई परियोजना जोड़ें',

    // Analytics Keys (Hindi)
    'analytics.title': 'एआई विश्लेषण और सत्यापन आंकड़े',
    'analytics.subtitle': 'साइट-सिंक एआई मिलान इंजन, विश्वास वितरण और विभाग सटीकता के प्रदर्शन मेट्रिक्स।',
    'analytics.timeSeries': 'समय श्रृंखला निष्पादन',
    'analytics.throughput': 'दैनिक एआई पार्सिंग और स्वतः-स्वीकृति प्रक्षेपवक्र',
    'analytics.qualityTiers': 'गुणवत्ता श्रेणियां',
    'analytics.distribution': 'विश्वास स्कोर वितरण',
    'analytics.engineering': 'इंजीनियरिंग विभाग',
    'analytics.departments': 'विभाग अनुसार समाधान क्षमता',
    'analytics.composition': 'एल्गोरिथम संरचना',
    'analytics.multiModal': '4-आयामी मल्टी-मॉडल वेटिंग और मिलान सटीकता',
    'analytics.totalLogs': 'कुल फील्ड रिपोर्ट',
    'analytics.autoAccepted': 'स्वतः-स्वीकृत',

    // Review Queue Keys (Hindi)
    'queue.title': 'एआई मिलान समीक्षा कतार',
    'queue.subtitle': 'एआई-सुझाए गए L6 गतिविधि मिलानों की समीक्षा करें। सत्यापित होने पर प्रगति स्वतः L5 और परियोजना स्वास्थ्य में रोल-अप होती है।',
    'queue.pending': 'समीक्षा लंबित',
    'queue.verified': 'सत्यापित और रोल-अप',
    'queue.rejected': 'अस्वीकृत मिलान',
    'queue.total': 'कुल संसाधित',

    // Reports Keys (Hindi)
    'reports.title': 'फील्ड निष्पादन रिपोर्ट और फाइलें',
    'reports.subtitle': 'फील्ड साइट इंजीनियरों द्वारा प्रस्तुत अनस्ट्रक्चर्ड फील्ड लॉग और संलग्न तकनीकी फाइलें (PDF, Excel, Word)।',
    'reports.total': 'कुल फील्ड रिपोर्ट',
    'reports.files': 'संलग्न तकनीकी फाइलें',
    'reports.verified': 'सत्यापित रिपोर्ट',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sitesync_language');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sitesync_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    return TRANSLATIONS[language]?.[key] || fallback || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
