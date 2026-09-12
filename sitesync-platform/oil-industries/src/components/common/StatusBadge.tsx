import React from 'react';
import { StatusLevel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status: StatusLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const { language } = useLanguage();
  let bg = 'bg-graphite-100 text-graphite-700 border-graphite-300';
  let dotColor = 'bg-graphite-400';
  let label = status.replace('_', ' ');

  const HINDI_MAP: Record<string, string> = {
    'ON_TRACK': 'समय पर',
    'ON TRACK': 'समय पर',
    'COMPLETE': 'पूर्ण',
    'COMPLETED': 'पूर्ण',
    'VERIFIED': 'सत्यापित',
    'ACCEPTED': 'स्वीकृत',
    'AT_RISK': 'जोखिम में',
    'AT RISK': 'जोखिम में',
    'MEDIUM': 'मध्यम',
    'DELAYED': 'विलंबित',
    'CRITICAL': 'गंभीर',
    'REJECTED': 'अस्वीकृत',
    'IN_PROGRESS': 'प्रगति पर',
    'IN PROGRESS': 'प्रगति पर',
    'AI_MATCHED': 'एआई मिलान',
    'PENDING_REVIEW': 'समीक्षा लंबित',
    'PENDING REVIEW': 'समीक्षा लंबित',
    'NOT_STARTED': 'शुरू नहीं हुआ',
    'ACTIVE': 'सक्रिय',
  };

  switch (status) {
    case 'ON_TRACK':
    case 'COMPLETE':
    case 'VERIFIED':
    case 'ACCEPTED':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-300/80';
      dotColor = 'bg-emerald-600';
      label = status === 'ON_TRACK' ? 'ON TRACK' : status === 'COMPLETE' ? 'COMPLETE' : status;
      break;
    case 'AT_RISK':
    case 'MEDIUM':
      bg = 'bg-amber-50 text-amber-900 border-amber-300/80';
      dotColor = 'bg-amber-brand';
      label = status === 'AT_RISK' ? 'AT RISK' : status;
      break;
    case 'DELAYED':
    case 'CRITICAL':
    case 'REJECTED':
      bg = 'bg-rose-50 text-rose-800 border-rose-300/80';
      dotColor = 'bg-rose-600';
      label = status === 'DELAYED' ? 'DELAYED' : status;
      break;
    case 'IN_PROGRESS':
    case 'AI_MATCHED':
    case 'PENDING_REVIEW':
      bg = 'bg-sky-50 text-sky-800 border-sky-300/80';
      dotColor = 'bg-sky-600';
      label = status === 'IN_PROGRESS' ? 'IN PROGRESS' : status === 'PENDING_REVIEW' ? 'PENDING REVIEW' : status;
      break;
    case 'NOT_STARTED':
      bg = 'bg-graphite-100 text-graphite-600 border-graphite-300';
      dotColor = 'bg-graphite-400';
      label = 'NOT STARTED';
      break;
  }

  if (language === 'hi' && HINDI_MAP[status]) {
    label = HINDI_MAP[status];
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border shadow-sm ${bg} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColor} ${
            status === 'AT_RISK' || status === 'PENDING_REVIEW' ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
