import React from 'react';
import { motion } from 'motion/react';

export interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
  glow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  kicker?: string;
  title?: string;
  metric?: string | number;
  description?: string;
  icon?: React.ReactNode;
  ctaLabel?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'light',
  glow = false,
  interactive = true,
  onClick,
  kicker,
  title,
  metric,
  description,
  icon,
  ctaLabel,
}) => {
  const baseSurface =
    variant === 'dark' ? 'liquid-glass-dark text-white' : 'liquid-glass text-[#334155]';
  const glowClass = glow ? 'section-glow' : '';
  const cursorClass = onClick ? 'cursor-pointer group' : 'group';

  return (
    <motion.div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      whileHover={
        interactive
          ? {
              scale: 1.02,
              y: -4,
              rotateX: 1.5,
              rotateY: -1.5,
              boxShadow:
                variant === 'dark'
                  ? '0 26px 52px -12px rgba(4, 29, 30, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.24) inset'
                  : '0 26px 52px -12px rgba(11, 59, 60, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.85) inset',
            }
          : undefined
      }
      whileTap={interactive && onClick ? { scale: 0.99, y: 0 } : undefined}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 24,
        mass: 0.8,
      }}
      className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${baseSurface} ${glowClass} ${cursorClass} ${className}`}
    >
      {(kicker || title || metric !== undefined || description || icon || ctaLabel) && (
        <div className="flex flex-col justify-between h-full gap-3.5 sm:gap-4">
          <div className="space-y-2 sm:space-y-2.5">
            {(kicker || icon) && (
              <div className="flex items-center justify-between gap-2">
                {kicker && (
                  <span
                    className={`text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase ${
                      variant === 'dark' ? 'text-white/90' : 'text-[#0B3B3C]'
                    }`}
                  >
                    {kicker}
                  </span>
                )}
                {icon && (
                  <span
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      variant === 'dark'
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'bg-[#0B3B3C] text-white shadow-xs'
                    }`}
                  >
                    {icon}
                  </span>
                )}
              </div>
            )}

            {metric !== undefined && (
              <p
                className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading tabular-nums tracking-tight ${
                  variant === 'dark' ? 'text-white' : 'text-[#0B3B3C]'
                }`}
              >
                {metric}
              </p>
            )}

            {title && (
              <h3
                className={`text-base font-bold font-heading leading-snug ${
                  variant === 'dark' ? 'text-white' : 'text-[#0B3B3C]'
                }`}
              >
                {title}
              </h3>
            )}

            {description && (
              <p
                className={`text-xs leading-relaxed ${
                  variant === 'dark' ? 'text-white/85' : 'text-[#475569]'
                }`}
              >
                {description}
              </p>
            )}
          </div>

          {ctaLabel && (
            <div
              className={`pt-1 text-xs font-bold inline-flex items-center gap-1.5 ${
                variant === 'dark'
                  ? 'text-white group-hover:underline'
                  : 'text-[#0B3B3C] group-hover:text-[#0F6B6B]'
              }`}
            >
              <span>{ctaLabel}</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                →
              </span>
            </div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default GlassCard;
