import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Settings, Sliders, Shield, Database, RotateCcw, Sun, Moon, Languages } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { systemSettings, updateSystemSettings, resetToDemoScenario } = useProject();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(systemSettings.confidenceThreshold);
  const [varianceTolerance, setVarianceTolerance] = useState<number>(systemSettings.varianceTolerance);

  useEffect(() => {
    setConfidenceThreshold(systemSettings.confidenceThreshold);
    setVarianceTolerance(systemSettings.varianceTolerance);
  }, [systemSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      confidenceThreshold,
      varianceTolerance,
    });
    toast.success(language === 'hi' ? 'सेटिंग्स सफलतापूर्वक सहेजी गईं' : 'SiteSync intelligence parameters updated & persisted successfully');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      <div className="pb-5 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
            {language === 'hi' ? 'कॉन्फ़िगरेशन' : 'Configuration'}
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            {language === 'hi' ? 'सिस्टम पैरामीटर और नियम' : 'System Parameters & AI Rules'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
          {language === 'hi' ? 'सिस्टम सेटिंग्स' : 'System Settings'}
        </h1>
        <p className="text-sm text-graphite-600 mt-1">
          {language === 'hi'
            ? 'थीम, भाषा, AI मैच थ्रेसहोल्ड और विचलन अलर्ट ट्रिगर कॉन्फ़िगर करें।'
            : 'Configure theme, language, AI match thresholds, and variance alert triggers.'}
        </p>
      </div>

      {/* Appearance & Language Section */}
      <div className="bg-white p-7 sm:p-9 rounded-2xl border border-graphite-200/90 shadow-sm space-y-7">
        <h2 className="text-sm font-bold text-graphite-900 uppercase tracking-wider border-b border-graphite-150 pb-2">
          {language === 'hi' ? 'प्रकटन और भाषा' : 'Appearance & Language'}
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between bg-offwhite-50 p-5 rounded-xl border border-graphite-200">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-brand" />
            )}
            <div>
              <div className="text-sm font-semibold text-graphite-800">
                {language === 'hi' ? 'थीम' : 'Theme'}
              </div>
              <div className="text-xs text-graphite-500">
                {language === 'hi'
                  ? (isDark ? 'डार्क मोड सक्रिय' : 'लाइट मोड सक्रिय')
                  : (isDark ? 'Dark mode is active' : 'Light mode is active')}
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-brand/40 cursor-pointer"
            style={{ backgroundColor: isDark ? '#d99a24' : '#d5d8da' }}
            aria-label="Toggle theme"
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ${
                isDark ? 'left-9' : 'left-1'
              }`}
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-graphite-700" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-brand" />
              )}
            </div>
            <span className={`absolute top-1.5 text-[10px] font-bold ${isDark ? 'left-2 text-graphite-900' : 'right-2 text-graphite-500'}`}>
              {isDark ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-between bg-offwhite-50 p-5 rounded-xl border border-graphite-200">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-amber-brand" />
            <div>
              <div className="text-sm font-semibold text-graphite-800">
                {language === 'hi' ? 'भाषा' : 'Language'}
              </div>
              <div className="text-xs text-graphite-500">
                {language === 'hi' ? 'हिन्दी सक्रिय है' : 'English is active'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="relative w-20 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-brand/40 cursor-pointer"
            style={{ backgroundColor: language === 'hi' ? '#d99a24' : '#d5d8da' }}
            aria-label="Toggle language"
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ${
                language === 'hi' ? 'left-[52px]' : 'left-1'
              }`}
            >
              <span className="text-[10px] font-extrabold text-graphite-700">
                {language === 'hi' ? 'हि' : 'EN'}
              </span>
            </div>
            <span className={`absolute top-1.5 text-[10px] font-bold ${language === 'hi' ? 'left-2 text-graphite-900' : 'right-2 text-graphite-500'}`}>
              {language === 'hi' ? 'हिन्दी' : 'EN'}
            </span>
          </button>
        </div>
      </div>

      {/* AI Threshold Settings */}
      <form onSubmit={handleSave} className="bg-white p-7 sm:p-9 rounded-2xl border border-graphite-200/90 shadow-sm space-y-7">
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-graphite-900 uppercase tracking-wider border-b border-graphite-150 pb-2">
            {language === 'hi' ? 'AI सत्यापन इंजन थ्रेसहोल्ड' : 'AI Verification Engine Thresholds'}
          </h2>

          <div className="space-y-3 bg-offwhite-50 p-5 rounded-xl border border-graphite-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-graphite-800 uppercase tracking-wider">
                {language === 'hi' ? 'उच्च विश्वास थ्रेसहोल्ड (1-क्लिक स्वीकृति):' : 'High Confidence Threshold (1-Click Accept):'}
              </label>
              <span className="font-extrabold text-amber-brand text-base">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="95"
              value={confidenceThreshold}
              onChange={e => setConfidenceThreshold(Number(e.target.value))}
              className="w-full h-2.5 bg-graphite-200 rounded-lg accent-amber-brand cursor-pointer"
            />
            <p className="text-xs text-graphite-500 leading-relaxed">
              {language === 'hi'
                ? `${confidenceThreshold}% से ऊपर के मैच उच्च विश्वास के रूप में वर्गीकृत हैं।`
                : `Matches above ${confidenceThreshold}% are classified as High Confidence. Lower scores trigger multi-candidate selection.`}
            </p>
          </div>

          <div className="space-y-3 bg-offwhite-50 p-5 rounded-xl border border-graphite-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-graphite-800 uppercase tracking-wider">
                {language === 'hi' ? 'शेड्यूल विचलन अलर्ट सहनशीलता:' : 'Schedule Variance Alert Tolerance:'}
              </label>
              <span className="font-extrabold text-rose-700 text-base">-{varianceTolerance}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              value={varianceTolerance}
              onChange={e => setVarianceTolerance(Number(e.target.value))}
              className="w-full h-2.5 bg-graphite-200 rounded-lg accent-rose-600 cursor-pointer"
            />
            <p className="text-xs text-graphite-500 leading-relaxed">
              {language === 'hi'
                ? `-${varianceTolerance}% से खराब विचलन वाली L5 प्रक्रियाओं को जोखिम में चिह्नित किया जाता है।`
                : `L5 processes with variance worse than -${varianceTolerance}% are flagged as AT RISK / DELAYED.`}
            </p>
          </div>
        </div>

        <div className="pt-5 border-t border-graphite-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              resetToDemoScenario();
              toast.info(language === 'hi' ? 'डेमो डेटा रीसेट हो गया' : 'Demo state reset to initial baseline values');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-graphite-100 hover:bg-graphite-200 text-graphite-700 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'डेमो डेटा रीसेट करें' : 'Reset Demo Data'}</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-brand hover:bg-amber-hover text-graphite-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            {language === 'hi' ? 'कॉन्फ़िगरेशन सहेजें' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
