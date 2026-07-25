import React from 'react';

interface EmpireLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'wordmark';
  className?: string;
}

const sizeMap = {
  sm: { height: 24, iconOnly: 20 },
  md: { height: 32, iconOnly: 28 },
  lg: { height: 40, iconOnly: 36 },
  xl: { height: 56, iconOnly: 48 },
};

export default function EmpireLogo({
  size = 'md',
  variant = 'full',
  className = '',
}: EmpireLogoProps) {
  const dim = sizeMap[size];

  if (variant === 'icon') {
    return (
      <img
        src="/empire1_logo.jpeg"
        alt="Empire-1"
        width={dim.iconOnly}
        height={dim.iconOnly}
        className={`object-contain ${className}`}
        style={{ borderRadius: 4 }}
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <span
        className={`font-heading text-white font-bold tracking-wider ${className}`}
        style={{ fontSize: dim.height * 0.45 }}
      >
        Empire-1
      </span>
    );
  }

  return (
    <a href="/" className={`flex items-center gap-2 ${className}`}>
      <img
        src="/empire1_logo.jpeg"
        alt="Empire-1"
        width={dim.iconOnly}
        height={dim.iconOnly}
        className="object-contain"
        style={{ borderRadius: 4 }}
      />
      <span
        className="font-heading text-white font-bold tracking-wider"
        style={{ fontSize: dim.height * 0.45 }}
      >
        Empire-1
      </span>
    </a>
  );
}
