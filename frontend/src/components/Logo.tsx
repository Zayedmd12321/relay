'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string | null;
}

export default function Logo({ size = 'md', showText = true, href = '/' }: LogoProps) {
  const sizes = {
    sm: { logo: 32, text: 'text-base' },
    md: { logo: 40, text: 'text-xl' },
    lg: { logo: 56, text: 'text-2xl' },
  };

  const content = (
    <div className="inline-flex items-center gap-3">
      <div className="transition-transform hover:scale-105">
        <Image
          src="/logo.png"
          alt="Relay Logo"
          width={sizes[size].logo}
          height={sizes[size].logo}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} tracking-tight text-slate-900 dark:text-white`}>
          Relay
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
