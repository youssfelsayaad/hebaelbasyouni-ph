import { Film, Play } from 'lucide-react';
import { motion } from 'motion/react';
import type { Language, PortfolioSession } from '../types/portfolio';

interface CinemaShowcaseBandProps {
  lang: Language;
  reels: PortfolioSession[];
  onSelectSession: (session: PortfolioSession) => void;
  onViewAllReels: () => void;
}

export function CinemaShowcaseBand({
  lang,
  reels,
  onSelectSession,
  onViewAllReels,
}: CinemaShowcaseBandProps) {
  const featuredReels = reels.slice(0, 6);

  return (
    <section id="reels" className="border-b border-zinc-800/80 bg-[#08080A] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-mono-tech text-[#E5B84B] mb-2">
              {lang === 'ar' ? 'الحركة والصوت · Cinema Reels' : 'Motion & Sound · Cinema Reels'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FAFAFA] text-balance">
              {lang === 'ar'
                ? 'أحدث الريلز والأفلام القصيرة'
                : 'Selected Cinema Reels & Films'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onViewAllReels}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#E5B84B] border border-zinc-800 rounded-lg hover:border-[#E5B84B] transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            <Film className="w-3.5 h-3.5" />
            <span>
              {lang === 'ar'
                ? `عرض كل الفيديوهات (${reels.length})`
                : `View All Reels (${reels.length})`}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredReels.map((reel, idx) => (
            <motion.article
              key={reel.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: idx * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -6 }}
              onClick={() => onSelectSession(reel)}
              className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                <img
                  src={reel.coverImage}
                  alt={lang === 'ar' ? reel.titleAr : reel.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                {/* Center Animated Play Affordance */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    className="w-14 h-14 rounded-full bg-[#E5B84B]/95 text-[#050505] flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110"
                  >
                    <Play className="w-5 h-5 fill-current ms-0.5" />
                  </motion.div>
                </div>

                {/* Bottom Unboxed Metadata */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono-tech mb-1.5">
                    <span className="text-[#E5B84B]">{reel.duration || '01:00'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{reel.sessionDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lang === 'ar' ? reel.locationAr : reel.locationEn}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#FAFAFA] line-clamp-1 group-hover:text-[#E5B84B] transition-colors">
                    {lang === 'ar' ? reel.titleAr : reel.titleEn}
                  </h3>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
