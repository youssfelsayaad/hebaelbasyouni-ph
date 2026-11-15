import type { Language } from '../types/portfolio';

interface MarqueeRibbonProps {
  lang: Language;
  handle: string;
}

export function MarqueeRibbon({ lang, handle }: MarqueeRibbonProps) {
  const itemsAr = [
    'جلسات الزفاف والخطوبة',
    'بورتريه العرايس',
    'ريلز سينمائية 4K',
    'إيديتوريال وأزياء',
    'توثيق العائلة',
    handle,
  ];

  const itemsEn = [
    'selected weddings',
    'bridal portraits',
    'cinema reels 4k',
    'fashion editorial',
    'family stories',
    handle,
  ];

  const list = lang === 'ar' ? itemsAr : itemsEn;
  const repeated = [...list, ...list, ...list, ...list];

  return (
    <div
      dir="ltr"
      aria-hidden="true"
      className="relative overflow-hidden border-b border-zinc-800/80 bg-[#09090B] py-4 select-none"
    >
      <div className="flex w-max animate-marquee-slow whitespace-nowrap items-center gap-8">
        {repeated.map((text, idx) => (
          <div key={`top-${idx}`} className="flex items-center gap-8">
            <span className="font-display text-lg sm:text-xl tracking-wide text-zinc-300">
              {text}
            </span>
            <span className="text-[#E5B84B] text-xs">✦</span>
          </div>
        ))}
      </div>
      <div className="flex w-max animate-marquee-reverse whitespace-nowrap items-center gap-8 mt-2 opacity-55">
        {repeated.map((text, idx) => (
          <div key={`bot-${idx}`} className="flex items-center gap-8">
            <span className="font-mono-tech text-xs tracking-widest uppercase text-zinc-400">
              {text}
            </span>
            <span className="text-zinc-600 text-xs">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}
