import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { User, ShieldCheck, MapPin, Award, Phone, Wifi } from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { workers, l6Activities } = useProject();
  const { t, language } = useLanguage();
  const currentWorker = workers[0]; // Ravi Kumar

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      <div className="pb-2 border-b border-graphite-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-2.5 py-1 rounded-full">
            {language === 'hi' ? 'पर्यवेक्षक / प्रोफ़ाइल' : 'OPERATOR / PROFILE'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight mt-1.5">
          {language === 'hi' ? 'फील्ड इंजीनियर विवरण व साख' : 'Field Engineer Credentials'}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-graphite-200/90 shadow-sm p-6 sm:p-7 space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={currentWorker.avatar}
            alt={currentWorker.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-brand shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-graphite-950">{currentWorker.name}</h2>
              <span className="px-2 py-0.5 bg-graphite-150 text-graphite-700 font-mono text-xs rounded-md font-semibold">
                {currentWorker.badgeId}
              </span>
            </div>
            <div className="text-xs font-bold text-amber-900 mt-0.5">
              {language === 'hi' ? 'साइट पर्यवेक्षक' : currentWorker.role}
            </div>
            <div className="text-xs text-graphite-500 font-medium">{currentWorker.discipline}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-offwhite-50 p-5 rounded-2xl border border-graphite-200 text-xs">
          <div>
            <span className="text-graphite-400 block text-[11px] font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'सक्रिय परियोजना' : 'ACTIVE PROJECT'}
            </span>
            <span className="font-bold text-graphite-900 text-sm mt-0.5 block">PEP-001 (EPC Package 04)</span>
          </div>
          <div>
            <span className="text-graphite-400 block text-[11px] font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'आवंटित स्थान' : 'ASSIGNED LOCATION'}
            </span>
            <span className="font-bold text-graphite-900 text-sm mt-0.5 block">
              {language === 'hi' ? 'असम सेक्टर 04 (KP 10–13)' : 'Assam Sector 04 (KP 10–13)'}
            </span>
          </div>
          <div>
            <span className="text-graphite-400 block text-[11px] font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'सुरक्षा मंजूरी' : 'SAFETY CLEARANCE'}
            </span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
              {language === 'hi' ? 'स्तर 3 सीमित स्थान और हॉट वर्क' : 'Level 3 Confined Space & Hot Work'}
            </span>
          </div>
          <div>
            <span className="text-graphite-400 block text-[11px] font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'टेलीमेट्री स्थिति' : 'TELEMETRY STATUS'}
            </span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
              {language === 'hi' ? 'जीपीएस सिंक · ऑनलाइन' : 'GPS Synced · Online'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
