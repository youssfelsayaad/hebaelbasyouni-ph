import { useState } from 'react';
import { ArrowLeft, ArrowRight, Instagram } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Language, PortfolioSession } from '../types/portfolio';

interface InteractiveDeckSectionProps {
  lang: Language;
  sessions: PortfolioSession[];
  instagramUrl: string;
  onSelectSession: (session: PortfolioSession) => void;
}

export function InteractiveDeckSection({
  lang,
  sessions,
  instagramUrl,
  onSelectSession,
}: InteractiveDeckSectionProps) {
  const deckItems = sessions.filter((s) => Boolean(s.coverImage)).slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);

  const cycleNext = () => {
    setActiveIndex((prev) => (prev + 1) % Math.max(1, deckItems.length));
  };

  const cyclePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + Math.max(1, deckItems.length)) % Math.max(1, deckItems.length)
    );
  };

  const steps =
    lang === 'ar'
      ? [
          {
            num: '01.',
            title: 'رؤية فنية ومود بورد مخصص',
            desc: 'تحديد أسلوب الإضاءة، الألوان، وأفضل توقيت ذهبي يناسب مكان التصوير.',
          },
          {
            num: '02.',
            title: 'توجيه مريح ولقطات عفوية',
            desc: 'إدارة الجلسة بأسلوب هادئ يبرز المشاعر الحقيقية دون تصنّع أمام الكاميرا.',
          },
          {
            num: '03.',
            title: 'توازن بين الصور الفوتوغرافية والريلز',
            desc: 'تغطية متكاملة تجمع بين كادرات المطبوعات الخالدة ومقاطع الفيديو السينمائية.',
          },
          {
            num: '04.',
            title: 'معالجة لونية دافئة وتسليم سريع',
            desc: 'فرز وتنقيح يدوي دقيق لكل صورة مع مونتاج ريل جاهز للمشاركة.',
          },
        ]
      : [
          {
            num: '01.',
            title: 'Tailored Moodboard & Light Study',
            desc: 'Planning wardrobe tones, architectural framing, and golden-hour timing.',
          },
          {
            num: '02.',
            title: 'Relaxed Direction & Candid Emotion',
            desc: 'Natural guidance so every smile, glance, and movement feels effortless.',
          },
          {
            num: '03.',
            title: 'Balanced Stills & Motion Coverage',
            desc: 'Delivering both editorial fine-art frames and dynamic 4K cinema reels.',
          },
          {
            num: '04.',
            title: 'Editorial Color Grading & Delivery',
            desc: 'Hand-calibrated warm film tones and fast high-resolution gallery access.',
          },
        ];

  const currentItem = deckItems[activeIndex];

  return (
    <section id="story" className="border-b border-zinc-800/80 bg-[#08080A] py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Interactive Draggable Frame Stack (renders real uploaded frames when present) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {deckItems.length > 0 ? (
              <>
                <div className="relative w-full max-w-sm h-[460px]">
                  <AnimatePresence mode="popLayout">
                    {deckItems.map((item, idx) => {
                      const offset = (idx - activeIndex + deckItems.length) % deckItems.length;
                      if (offset > 3) return null;
                      const isFront = offset === 0;

                      return (
                        <motion.div
                          key={item.id}
                          style={{ zIndex: deckItems.length - offset }}
                          initial={{ scale: 0.9, opacity: 0, y: 24 }}
                          animate={{
                            scale: 1 - offset * 0.045,
                            y: offset * 14,
                            x: offset * (lang === 'ar' ? -10 : 10),
                            rotate: offset === 0 ? 0 : offset % 2 === 0 ? -3 : 3,
                            opacity: 1 - offset * 0.22,
                          }}
                          exit={{ x: lang === 'ar' ? 220 : -220, opacity: 0, rotate: -10 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                          drag={isFront ? 'x' : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragEnd={(_, info) => {
                            if (Math.abs(info.offset.x) > 65) {
                              cycleNext();
                            }
                          }}
                          onClick={() => isFront && onSelectSession(item)}
                          className={`absolute inset-0 rounded-2xl overflow-hidden border border-zinc-700/80 bg-zinc-900 shadow-2xl ${
                            isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
                          }`}
                        >
                          <img
                            src={item.coverImage}
                            alt={lang === 'ar' ? item.titleAr : item.titleEn}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-5">
                            <p className="font-mono-tech text-xs text-[#E5B84B] mb-1">
                              {item.cameraSpecs || '@hebaelbasyouni1'}
                            </p>
                            <h3 className="text-lg font-semibold text-[#FAFAFA] line-clamp-1">
                              {lang === 'ar' ? item.titleAr : item.titleEn}
                            </h3>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Previous frame"
                    onClick={cyclePrev}
                    className="w-11 h-11 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-[#E5B84B] hover:text-[#E5B84B] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  </button>
                  <span className="font-mono-tech text-xs text-zinc-400 tabular-nums">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(deckItems.length).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    aria-label="Next frame"
                    onClick={cycleNext}
                    className="w-11 h-11 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-[#E5B84B] hover:text-[#E5B84B] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                  {currentItem && (
                    <button
                      type="button"
                      onClick={() => onSelectSession(currentItem)}
                      className="text-xs font-medium text-[#E5B84B] hover:underline cursor-pointer ms-2"
                    >
                      {lang === 'ar' ? 'فتح الجلسة' : 'Open Session'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-4">
                <Instagram className="w-10 h-10 text-[#E5B84B] mx-auto" />
                <h3 className="font-display text-2xl font-semibold text-[#FAFAFA]">
                  @hebaelbasyouni1
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'بمجرد رفع صور الجلسات من لوحة الأدمن، ستظهر هنا مجموعة مختارة تفاعلية قابلة للسحب.'
                    : 'Once sessions with cover photos are uploaded in Admin, they appear here as an interactive draggable deck.'}
                </p>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-lg"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تصفح إنستجرام' : 'Browse Instagram'}</span>
                </a>
              </div>
            )}
          </div>

          {/* Editorial Process & Approach */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="text-xs font-mono-tech text-[#E5B84B] mb-2">
                {lang === 'ar' ? 'أسلوب العمل · Creative Approach' : 'Behind the Lens · Workflow'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FAFAFA] text-balance">
                {lang === 'ar'
                  ? 'كيف تصنع هبة البسيوني كل جلسة تصوير'
                  : 'How every photoshoot & reel is crafted'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700 transition-colors"
                >
                  <p className="font-mono-tech text-sm font-semibold text-[#E5B84B] mb-2">
                    {step.num}
                  </p>
                  <h3 className="text-base font-semibold text-[#FAFAFA] mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
