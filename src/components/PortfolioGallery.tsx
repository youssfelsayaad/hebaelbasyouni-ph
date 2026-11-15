import { useMemo, useState } from 'react';
import { Camera, Film, Play, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  Language,
  MediaType,
  PortfolioSession,
  SessionCategory,
} from '../types/portfolio';

interface PortfolioGalleryProps {
  lang: Language;
  sessions: PortfolioSession[];
  mediaFilter: 'all' | MediaType;
  onChangeMediaFilter: (filter: 'all' | MediaType) => void;
  onSelectSession: (session: PortfolioSession) => void;
}

const CATEGORY_LABELS: Record<
  'all' | SessionCategory,
  { ar: string; en: string }
> = {
  all: { ar: 'كل التصنيفات', en: 'All Categories' },
  weddings: { ar: 'أفراح وخطوبة', en: 'Weddings' },
  bridal: { ar: 'بورتريه عرايس', en: 'Bridal' },
  editorial: { ar: 'أزياء وإيديتوريال', en: 'Editorial' },
  family: { ar: 'عائلي وأمومة', en: 'Family' },
  reels: { ar: 'ريلز سينمائية', en: 'Cinema Reels' },
};

export function PortfolioGallery({
  lang,
  sessions,
  mediaFilter,
  onChangeMediaFilter,
  onSelectSession,
}: PortfolioGalleryProps) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | SessionCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => {
    const photos = sessions.filter((s) => s.mediaType === 'photo').length;
    const videos = sessions.filter((s) => s.mediaType === 'video').length;
    return { total: sessions.length, photos, videos };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter((item) => {
      if (mediaFilter !== 'all' && item.mediaType !== mediaFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (q) {
        const hay =
          `${item.titleAr} ${item.titleEn} ${item.locationAr} ${item.locationEn} ${item.storyAr} ${item.storyEn}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sessions, mediaFilter, categoryFilter, searchQuery]);

  const photoPct = counts.total > 0 ? Math.round((counts.photos / counts.total) * 100) : 50;

  return (
    <section id="gallery" className="border-b border-zinc-800/80 bg-[#050505] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header & Balance Meter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>
            <p className="text-xs font-mono-tech text-[#E5B84B] mb-2">
              {lang === 'ar'
                ? 'أرشيف الأعمال الكامل · Balanced Archive'
                : 'Complete Archive · Balanced Stills & Motion'}
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#FAFAFA] text-balance">
              {lang === 'ar'
                ? 'جلسات التصوير والفيديوهات'
                : 'Photo Sessions & Cinema Reels'}
            </h2>
          </div>

          {/* Photo / Video Balance Indicator */}
          <div className="w-full lg:w-80 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="inline-flex items-center gap-1.5 text-zinc-200 font-medium">
                <Camera className="w-3.5 h-3.5 text-[#E5B84B]" />
                <span className="tabular-nums">
                  {counts.photos} {lang === 'ar' ? 'سيشن صور' : 'Photos'}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-200 font-medium">
                <span className="tabular-nums">
                  {counts.videos} {lang === 'ar' ? 'فيديو' : 'Videos'}
                </span>
                <Film className="w-3.5 h-3.5 text-[#E5B84B]" />
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${photoPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-[#E5B84B]"
              />
            </div>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-800/80">
          {/* Media Type Switch */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
              {(
                [
                  {
                    key: 'all',
                    label: lang === 'ar' ? `الكل (${counts.total})` : `All (${counts.total})`,
                  },
                  {
                    key: 'photo',
                    label:
                      lang === 'ar'
                        ? `سيشن صور (${counts.photos})`
                        : `Photo Sessions (${counts.photos})`,
                  },
                  {
                    key: 'video',
                    label:
                      lang === 'ar'
                        ? `فيديو وريلز (${counts.videos})`
                        : `Video Reels (${counts.videos})`,
                  },
                ] as const
              ).map((tab) => {
                const active = mediaFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChangeMediaFilter(tab.key)}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active ? 'text-[#050505]' : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="mediaFilterActive"
                        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                        className="absolute inset-0 bg-[#E5B84B] rounded-lg"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(CATEGORY_LABELS) as Array<'all' | SessionCategory>).map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-zinc-100 text-[#050505] border-zinc-100'
                      : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat][lang]}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full xl:w-64 shrink-0">
            <Search className="w-4 h-4 text-zinc-500 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث باسم السيشن أو المكان...' : 'Search session or place...'}
              className="w-full ps-10 pe-4 py-2.5 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#E5B84B] transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Bento / Masonry Grid */}
        {filteredSessions.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-400 text-sm mb-4">
              {lang === 'ar'
                ? 'لا توجد جلسات مطابقة لخيارات البحث الحالية.'
                : 'No sessions match the selected filters.'}
            </p>
            <button
              type="button"
              onClick={() => {
                onChangeMediaFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-lg cursor-pointer"
            >
              {lang === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSessions.map((session, index) => {
                const isWideSpan = session.aspectRatio === 'wide' && session.featured;
                const photoCount = Math.max(1, session.galleryImages.length);

                return (
                  <motion.article
                    layout
                    key={session.id}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(index * 0.03, 0.24),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -5 }}
                    onClick={() => onSelectSession(session)}
                    className={`group relative rounded-2xl overflow-hidden border border-zinc-800/90 bg-zinc-900 cursor-pointer flex flex-col ${
                      isWideSpan ? 'md:col-span-2' : ''
                    }`}
                  >
                    {/* Media Container */}
                    <div
                      className={`relative overflow-hidden bg-zinc-950 ${
                        isWideSpan
                          ? 'aspect-[16/9]'
                          : session.aspectRatio === 'portrait'
                            ? 'aspect-[4/5]'
                            : 'aspect-[4/3]'
                      }`}
                    >
                      <img
                        src={session.coverImage}
                        alt={lang === 'ar' ? session.titleAr : session.titleEn}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />

                      {/* Measured Contrast Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                      {/* Viewfinder Hover Crosshair Accent */}
                      <div className="absolute inset-3 border border-[#E5B84B]/0 group-hover:border-[#E5B84B]/35 rounded-xl transition-colors duration-300 pointer-events-none" />

                      {/* Video Play Center Overlay */}
                      {session.mediaType === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-13 h-13 rounded-full bg-[#E5B84B]/90 text-[#050505] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <Play className="w-5 h-5 fill-current ms-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Bottom Metadata & Title (Zero Pill Badges) */}
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300 mb-1.5">
                          <span className="font-mono-tech text-[#E5B84B] inline-flex items-center gap-1">
                            {session.mediaType === 'video' ? (
                              <>
                                <Film className="w-3 h-3" />
                                <span>{session.duration || '01:00'}</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-3 h-3" />
                                <span>
                                  {photoCount} {lang === 'ar' ? 'صور' : 'photos'}
                                </span>
                              </>
                            )}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{CATEGORY_LABELS[session.category][lang]}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tech">{session.sessionDate}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-[#FAFAFA] leading-snug group-hover:text-[#E5B84B] transition-colors line-clamp-1">
                          {lang === 'ar' ? session.titleAr : session.titleEn}
                        </h3>

                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                          {lang === 'ar' ? session.locationAr : session.locationEn}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
