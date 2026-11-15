import React, { useState } from 'react';
import {
  AlertTriangle,
  Circle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  QrCode,
  Globe,
  Maximize2,
  X,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { Certainty, Level, Locale, PathwayState } from '../lib/types.ts';
import { useI18n } from '../lib/i18n.tsx';
import { GlassCard } from './GlassCard.tsx';
export { GlassCard };

// 0. Brand Mark (3D Specular Emblem + Wordmark)
export const MediBeninLogo: React.FC<{ variant?: 'dark' | 'light' }> = ({
  variant = 'dark',
}) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#0B3B3C]';
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 font-heading font-bold text-base sm:text-lg tracking-tight whitespace-nowrap shrink-0 ${textColor}`}>
      <span className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#14A39A] via-[#0F6B6B] to-[#0B3B3C] p-[1px] shadow-md flex items-center justify-center shrink-0">
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="10" fill="#0B3B3C" />
          <path
            d="M9.5 16C9.5 12.4101 12.4101 9.5 16 9.5C18.613 9.5 20.866 11.042 21.903 13.268"
            stroke="#14A39A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M22.5 16C22.5 19.5899 19.5899 22.5 16 22.5C13.387 22.5 11.134 20.958 10.097 18.732"
            stroke="#D5F2EE"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="22" cy="13" r="2" fill="#14A39A" />
          <circle cx="10" cy="19" r="2" fill="#D5F2EE" />
        </svg>
      </span>
      <span>MediBenin</span>
    </span>
  );
};

// 1. DemoBanner (Ultra-concise translucent bar)
export const DemoBanner: React.FC = () => {
  const { locale } = useI18n();
  const text =
    locale === 'ar'
      ? 'Ø¨ÙŠØ¦Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ© Â· Ø¨ÙŠØ§Ù†Ø§Øª Ø§ØµØ·Ù†Ø§Ø¹ÙŠØ© 100%'
      : locale === 'fr'
      ? 'Environnement de dÃ©monstration Â· donnÃ©es 100 % synthÃ©tiques'
      : 'Demonstration environment Â· 100% synthetic data';

  return (
    <div className="bg-[#041D1E] text-white text-xs py-2 px-3 sm:px-6 flex items-center justify-between gap-2 border-b border-white/15">
      <span className="font-medium leading-relaxed">{text}</span>
      <span className="hidden sm:inline text-white/85 font-mono shrink-0">Challenge 2026</span>
    </div>
  );
};

// 2. LanguageSwitch (Liquid Glass Segmented Control)
export const LanguageSwitch: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const options: Array<{ code: Locale; label: string }> = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'Ø¹Ø±Ø¨ÙŠ' },
  ];

  return (
    <div
      className="inline-flex items-center bg-white/75 backdrop-blur-md border border-[#E2E8F0] rounded-xl p-0.5 text-[11px] sm:text-xs font-medium shrink-0 shadow-2xs"
      role="group"
      aria-label="Language selector"
    >
      <Globe className="hidden sm:inline w-3.5 h-3.5 text-[#64748B] ms-2 me-1 shrink-0" />
      {options.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLocale(opt.code)}
          className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            locale === opt.code
              ? 'bg-[#0B3B3C] text-white font-semibold shadow-xs'
              : 'text-[#64748B] hover:text-[#0B3B3C]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

// 3. LevelBadge (Icon + Short Label)
export const LevelBadge: React.FC<{ level: Level; size?: 'sm' | 'md' }> = ({
  level,
  size = 'md',
}) => {
  const { t } = useI18n();

  const config: Record<
    Level,
    { bg: string; text: string; labelKey: string; Icon: React.FC<{ className?: string }> }
  > = {
    red: {
      bg: 'bg-[#FEF2F2] border border-red-200/80',
      text: 'text-[#B91C1C]',
      labelKey: 'levelRed',
      Icon: AlertTriangle,
    },
    orange: {
      bg: 'bg-[#FFF7ED] border border-orange-200/80',
      text: 'text-[#C2410C]',
      labelKey: 'levelOrange',
      Icon: ({ className }) => <Circle className={`${className} fill-current`} />,
    },
    yellow: {
      bg: 'bg-[#FEFCE8] border border-amber-200/80',
      text: 'text-[#854D0E]',
      labelKey: 'levelYellow',
      Icon: Clock,
    },
    green: {
      bg: 'bg-[#F0FDF4] border border-green-200/80',
      text: 'text-[#15803D]',
      labelKey: 'levelGreen',
      Icon: CheckCircle2,
    },
    grey: {
      bg: 'bg-[#F1F5F9] border border-slate-200/90',
      text: 'text-[#475569]',
      labelKey: 'levelGrey',
      Icon: HelpCircle,
    },
  };

  const item = config[level] || config.grey;
  const IconComp = item.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg whitespace-nowrap shrink-0 shadow-2xs ${item.bg} ${item.text} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
    >
      <IconComp className="w-3.5 h-3.5 shrink-0" />
      <span>{t(item.labelKey)}</span>
    </span>
  );
};

// 4. CertaintyBadge (Minimalist tooltip trigger)
export const CertaintyBadge: React.FC<{ certainty: Certainty; reason?: string }> = ({
  certainty,
  reason,
}) => {
  const { t } = useI18n();

  const map: Record<Certainty, { labelKey: string; tooltipKey: string; tone: string }> = {
    high: {
      labelKey: 'certaintyHigh',
      tooltipKey: 'certaintyHighTooltip',
      tone: 'text-[#0F6B6B]',
    },
    medium: {
      labelKey: 'certaintyMedium',
      tooltipKey: 'certaintyMediumTooltip',
      tone: 'text-[#9A3412]',
    },
    low: {
      labelKey: 'certaintyLow',
      tooltipKey: 'certaintyLowTooltip',
      tone: 'text-[#475569]',
    },
  };

  const c = map[certainty] || map.medium;

  return (
    <span
      title={reason || t(c.tooltipKey)}
      className={`inline-flex items-center gap-1 text-xs font-medium cursor-help whitespace-nowrap shrink-0 ${c.tone}`}
    >
      <Info className="w-3.5 h-3.5 opacity-75 shrink-0" />
      <span>{t(c.labelKey)}</span>
    </span>
  );
};

// 5. StatusChip
export const StatusChip: React.FC<{ state: PathwayState }> = ({ state }) => {
  const { t } = useI18n();

  const map: Record<PathwayState, { key: string; tone: string }> = {
    created: { key: 'stateCreated', tone: 'text-[#334155] bg-[#F1F5F9] border border-[#CBD5E1]' },
    validated: { key: 'stateValidated', tone: 'text-[#1D4ED8] bg-[#EFF6FF] border border-blue-200' },
    invited: { key: 'stateInvited', tone: 'text-[#0F172A] bg-white border border-[#CBD5E1]' },
    scheduled: { key: 'stateScheduled', tone: 'text-[#4338CA] bg-[#EEF2FF] border border-indigo-200' },
    postponed: { key: 'statePostponed', tone: 'text-[#9A3412] bg-[#FFF7ED] border border-orange-200' },
    overdue: { key: 'stateOverdue', tone: 'text-[#B91C1C] bg-[#FEF2F2] border border-red-200' },
    done: { key: 'stateDone', tone: 'text-[#15803D] bg-[#F0FDF4] border border-green-200' },
    refused: { key: 'stateRefused', tone: 'text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0]' },
  };

  const item = map[state] || map.created;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${item.tone}`}>
      {t(item.key)}
    </span>
  );
};


// 7. StatCard (Built on top of GlassCard for key health metrics)
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ title, value, subtitle, icon }) => {
  return (
    <GlassCard
      kicker={title}
      metric={value}
      description={subtitle}
      icon={icon}
      className="p-5"
    />
  );
};

// 7. Ring (Circular Gauge)
export const Ring: React.FC<{ done: number; total: number; label: string }> = ({
  done,
  total,
  label,
}) => {
  const percentDone = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentDone / 100) * circumference;

  return (
    <div className="card-3d p-5 rounded-2xl flex items-center gap-4">
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="transparent"
            stroke="#14A39A"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold text-[#0B3B3C] tabular-nums">
          {done}/{total}
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-[#0B3B3C] font-heading">{label}</p>
        <p className="text-xs text-[#64748B] mt-0.5">
          {percentDone}% completed
        </p>
      </div>
    </div>
  );
};

// 8. PassQrCard (3D Dark Glass Orientation Pass)
export const PassQrCard: React.FC<{ code: string; facilityName: string }> = ({
  code,
  facilityName,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-br from-[#0B3B3C] via-[#0D5253] to-[#041D1E] text-white rounded-2xl p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 shadow-lg border border-white/15">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] font-semibold text-white/85 uppercase tracking-wider truncate">
            Centre Pass Â· {facilityName}
          </p>
          <p className="text-lg sm:text-xl font-mono font-bold tracking-widest text-white tabular-nums">
            {code}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="px-3 sm:px-3.5 py-2 bg-white/12 hover:bg-white/22 backdrop-blur-md text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 border border-white/15 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>QR Pass</span>
        </button>
      </div>

      {expanded && (
        <div className="fixed inset-0 z-50 bg-[#041D1E]/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center relative border border-[#E2E8F0] shadow-2xl">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="absolute top-4 end-4 p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-wider">
              Centre Orientation Pass
            </p>
            <div className="my-5 mx-auto w-36 h-36 sm:w-40 sm:h-40 bg-[#F2FAF8] border border-[#D5F2EE] rounded-2xl flex items-center justify-center p-4 shadow-inner">
              <QrCode className="w-24 h-24 sm:w-28 sm:h-28 text-[#0B3B3C]" />
            </div>
            <p className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-[#0B3B3C] bg-[#F8FAFC] py-2 px-4 rounded-xl border border-[#E2E8F0] tabular-nums">
              {code}
            </p>
            <p className="text-xs text-[#64748B] mt-3">{facilityName}</p>
          </div>
        </div>
      )}
    </>
  );
};

// 9. AiSuggestionPanel
export const AiSuggestionPanel: React.FC<{
  initialText: string;
  onDecision: (decision: 'validated' | 'modified' | 'ignored', finalText: string) => void;
}> = ({ initialText, onDecision }) => {
  const { t } = useI18n();
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'validated' | 'ignored'>('pending');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="liquid-glass rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6B6B]">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{t('aiSuggestionBadge')}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0B3B3C] font-medium"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#334155]"
        />
      ) : (
        <p className="text-xs text-[#334155] leading-relaxed bg-white/90 p-3.5 rounded-xl border border-[#E2E8F0]">
          {text}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setStatus('validated');
              onDecision(isEditing ? 'modified' : 'validated', text);
            }}
            className="px-3 py-1.5 rounded-lg btn-liquid-primary text-xs font-semibold"
          >
            {t('validateBtn')}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#334155] text-xs font-semibold"
          >
            {t('editBtn')}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus('ignored');
              onDecision('ignored', text);
            }}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#B91C1C] text-xs font-semibold"
          >
            {t('ignoreBtn')}
          </button>
        </div>

        {status !== 'pending' && (
          <span className="text-xs font-semibold text-[#0F6B6B]">
            {status === 'validated' ? 'âœ“ Validated' : 'Dismissed'}
          </span>
        )}
      </div>
    </div>
  );
};

// 10. ConsentToggle
export const ConsentToggle: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}> = ({ title, description, checked, onChange }) => {
  return (
    <div className="card-3d flex items-center justify-between gap-3 sm:gap-4 py-3.5 px-4 sm:px-5 rounded-2xl">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-bold text-[#0B3B3C] font-heading">{title}</p>
        <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? 'bg-[#0F6B6B]' : 'bg-[#CBD5E1]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
            checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
