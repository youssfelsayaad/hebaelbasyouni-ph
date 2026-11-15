import { useMemo, useState } from 'react';
import {
  Camera,
  ExternalLink,
  Film,
  Instagram,
  Play,
  Plus,
  Search,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { parseSocialEmbedUrl } from '../lib/instagram';
import type {
  Language,
  MediaType,
  PortfolioSession,
  SessionCategory,
} from '../types/portfolio';

interface PortfolioGalleryProps {
  lang: Language;
  sessions: PortfolioSession[];
  instagramUrl: string;
  facebookUrl?: string;
  mediaFilter: 'all' | MediaType;
  onChangeMediaFilter: (filter: 'all' | MediaType) => void;
  onSelectSession: (session: PortfolioSession) => void;
  onOpenAdmin: () => void;
}

const CATEGORY_LABELS: Record<'all' | SessionCategory, { ar: string; en: string }> = {
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
  instagramUrl,
  facebookUrl = 'https://www.facebook.com/heba.elbasyuni',
  mediaFilter,
  onChangeMediaFilter,
  onSelectSession,
  onOpenAdmin,
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
                ? 'أرشيف الأعمال الحقيقي · @hebaelbasyouni1'
                : 'Authentic Instagram & Studio Archive · @hebaelbasyouni1'}
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#FAFAFA] text-balance">
              {lang === 'ar'
                ? 'جلسات التصوير والفيديوهات'
                : 'Photo Sessions & Cinema Reels'}
            </h2>
          </div>

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

        {/* Empty / Official Social Channels OR Live Portfolio Grid */}
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-800 bg-[#0A0A0D] p-8 sm:p-12 text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center gap-4 text-[#E5B84B]">
              <Camera className="w-8 h-8" />
              <Film className="w-8 h-8" />
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#FAFAFA]">
                {lang === 'ar'
                  ? 'معرض أعمال هبة البسيوني'
                  : 'Heba El-Basyouni Portfolio Archive'}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {lang === 'ar'
                  ? 'يمكنك تصفح أحدث الجلسات والريلز مباشرة على صفحات هبة الرسمية في فيسبوك وإنستجرام، أو رفع الصور والفيديوهات وإضافتها للمعرض من لوحة الأدمن.'
                  : 'Browse her latest sessions on Facebook and Instagram, or upload photos and videos directly into the gallery via the Admin panel.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? 'إضافة صور وفيديوهات من لوحة الأدمن'
                    : 'Add Photos & Videos in Admin'}
                </span>
              </button>

              <a
                href={facebookUrl || 'https://www.facebook.com/heba.elbasyuni'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-medium bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl hover:border-[#E5B84B]"
              >
                <span className="font-bold text-[#E5B84B]">f</span>
                <span>{lang === 'ar' ? 'صفحة فيسبوك' : 'Facebook'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-medium bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl hover:border-[#E5B84B]"
              >
                <Instagram className="w-4 h-4 text-[#E5B84B]" />
                <span>{lang === 'ar' ? 'إنستجرام' : 'Instagram'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        ) : filteredSessions.length === 0 ? (
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
                const socialEmbed = parseSocialEmbedUrl(session.instagramPostUrl || session.videoUrl);

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
                    {session.coverImage ? (
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

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-3 border border-[#E5B84B]/0 group-hover:border-[#E5B84B]/35 rounded-xl transition-colors duration-300 pointer-events-none" />

                        {session.mediaType === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-13 h-13 rounded-full bg-[#E5B84B]/90 text-[#050505] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                              <Play className="w-5 h-5 fill-current ms-0.5" />
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300 mb-1.5">
                            <span className="font-mono-tech text-[#E5B84B] inline-flex items-center gap-1">
                              {session.mediaType === 'video' ? (
                                <>
                                  <Film className="w-3 h-3" />
                                  <span>{session.duration || 'Reel'}</span>
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
                    ) : socialEmbed ? (
                      <div className="flex flex-col bg-zinc-950 h-full">
                        <iframe
                          src={socialEmbed.embedUrl}
                          title={session.titleEn}
                          className="w-full h-[460px] border-0 bg-white"
                          loading="lazy"
                          allowFullScreen
                        />
                        <div className="p-4 flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900">
                          <div className="min-w-0">
                            <p className="text-xs font-mono-tech text-[#E5B84B]">
                              {CATEGORY_LABELS[session.category][lang]} · {session.sessionDate}
                            </p>
                            <h3 className="text-sm font-semibold text-[#FAFAFA] truncate mt-0.5">
                              {lang === 'ar' ? session.titleAr : session.titleEn}
                            </h3>
                          </div>
                          <span className="text-xs text-[#E5B84B] shrink-0">
                            {lang === 'ar' ? 'التفاصيل' : 'Details'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between bg-zinc-950 aspect-[4/3] p-6">
                        <div className="flex items-center justify-between text-xs font-mono-tech text-[#E5B84B]">
                          <span>{CATEGORY_LABELS[session.category][lang]}</span>
                          <span>{session.sessionDate}</span>
                        </div>
                        <div className="flex items-center justify-center my-auto">
                          <div className="w-14 h-14 rounded-full bg-[#E5B84B]/15 border border-[#E5B84B]/40 text-[#E5B84B] flex items-center justify-center">
                            {session.mediaType === 'video' ? (
                              <Play className="w-6 h-6 fill-current ms-0.5" />
                            ) : (
                              <Camera className="w-6 h-6" />
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[#FAFAFA] line-clamp-1">
                            {lang === 'ar' ? session.titleAr : session.titleEn}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                            {lang === 'ar' ? session.locationAr : session.locationEn}
                          </p>
                        </div>
                      </div>
                    )}
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
