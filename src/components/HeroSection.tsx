import { useRef } from 'react';
import {
  ArrowDownLeft,
  ArrowDownRight,
  Camera,
  ExternalLink,
  Film,
  Instagram,
  Phone,
  Upload,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { Language, StudioProfile } from '../types/portfolio';

interface HeroSectionProps {
  lang: Language;
  onToggleLang: () => void;
  profile: StudioProfile;
  balanceStats: {
    photos: number;
    videos: number;
    total: number;
    photoPct: number;
    videoPct: number;
  };
  isAdmin: boolean;
  onQuickUploadHero?: (file: File) => void;
  onOpenAdmin: () => void;
  onExploreGallery: () => void;
  onExploreReels: () => void;
}

export function HeroSection({
  lang,
  onToggleLang,
  profile,
  balanceStats,
  isAdmin,
  onQuickUploadHero,
  onOpenAdmin,
  onExploreGallery,
  onExploreReels,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.1]);
  const frameOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.75]);

  const cleanPhone = profile.studioPhone.replace(/[^\d+]/g, '');
  const ArrowIcon = lang === 'ar' ? ArrowDownLeft : ArrowDownRight;

  return (
    <section
      id="top"
      ref={containerRef}
      className="relative overflow-hidden border-b border-zinc-800/80 bg-[#050505]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Typographic Editorial Column */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4"
              >
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-mono-tech text-[#E5B84B]">{profile.handle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{lang === 'ar' ? profile.studioCityAr : profile.studioCityEn}</span>
                </div>

                <div className="inline-flex items-center p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => lang !== 'ar' && onToggleLang()}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      lang === 'ar'
                        ? 'bg-[#E5B84B] text-[#050505]'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    عربي
                  </button>
                  <button
                    type="button"
                    onClick={() => lang !== 'en' && onToggleLang()}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      lang === 'en'
                        ? 'bg-[#E5B84B] text-[#050505]'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </motion.div>

              <div className="overflow-hidden">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[clamp(2.5rem,4.8vw,4.35rem)] font-semibold leading-[1.08] tracking-tight text-[#FAFAFA] text-balance"
                >
                  {lang === 'ar' ? (
                    <>
                      {profile.nameAr}
                      <span className="block text-[#E5B84B] mt-2 text-[clamp(1.65rem,3vw,2.65rem)] font-normal">
                        حكايات بالضوء والحركة السينمائية
                      </span>
                    </>
                  ) : (
                    <>
                      {profile.nameEn}
                      <span className="block text-[#E5B84B] italic mt-2 text-[clamp(1.65rem,3vw,2.65rem)] font-normal">
                        Editorial Stills &amp; Cinema Reels
                      </span>
                    </>
                  )}
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg leading-relaxed text-zinc-300 max-w-xl"
              >
                {lang === 'ar' ? profile.bioAr : profile.bioEn}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreGallery}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>
                    {lang === 'ar'
                      ? balanceStats.total > 0
                        ? `استكشف الأعمال (${balanceStats.total})`
                        : 'معرض الأعمال'
                      : balanceStats.total > 0
                        ? `Explore Works (${balanceStats.total})`
                        : 'View Portfolio'}
                  </span>
                  <ArrowIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onExploreReels}
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl hover:border-[#E5B84B]/60 hover:text-[#E5B84B] transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Film className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'شاهد الريلز' : 'Watch Reels'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2 text-sm text-zinc-400">
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#E5B84B] transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="font-mono-tech text-xs">{profile.handle}</span>
                </a>

                {profile.facebookUrl && (
                  <a
                    href={profile.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-[#E5B84B] transition-colors"
                  >
                    <span className="text-xs font-semibold tracking-wide">FB</span>
                    <span>{lang === 'ar' ? 'فيسبوك' : 'Facebook'}</span>
                  </a>
                )}

                {profile.studioPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="inline-flex items-center gap-2 hover:text-[#E5B84B] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="font-mono-tech text-xs" dir="ltr">
                      {profile.studioPhone}
                    </span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Visual Hero Showcase Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex"
          >
            <motion.div
              style={{ opacity: frameOpacity }}
              className="relative w-full min-h-[440px] lg:min-h-[540px] lg:h-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#0A0A0D] group flex flex-col justify-between"
            >
              {profile.heroImageUrl ? (
                <>
                  <motion.img
                    src={profile.heroImageUrl}
                    alt={lang === 'ar' ? profile.nameAr : profile.nameEn}
                    referrerPolicy="no-referrer"
                    style={{ y: imageY, scale: imageScale }}
                    className="w-full h-full object-cover object-top will-change-transform absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="relative flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    className="w-36 h-36 rounded-full border border-dashed border-[#E5B84B]/35 flex items-center justify-center mb-6"
                  >
                    <div className="w-24 h-24 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900/80">
                      <Camera className="w-9 h-9 text-[#E5B84B]" />
                    </div>
                  </motion.div>

                  <p className="font-display text-2xl sm:text-3xl text-[#FAFAFA] mb-2">
                    {lang === 'ar' ? profile.nameAr : profile.nameEn}
                  </p>
                  <p className="font-mono-tech text-xs text-[#E5B84B] mb-5">
                    {profile.handle}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {isAdmin && onQuickUploadHero ? (
                      <label className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>
                          {lang === 'ar'
                            ? 'رفع صورة هبة الرئيسية الآن'
                            : 'Upload Heba’s Hero Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onQuickUploadHero(file);
                          }}
                        />
                      </label>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenAdmin}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>
                          {lang === 'ar'
                            ? 'رفع الصورة الرئيسية من الأدمن'
                            : 'Upload Hero Photo via Admin'}
                        </span>
                      </button>
                    )}

                    <a
                      href={profile.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border border-zinc-700 text-zinc-200 rounded-xl hover:border-[#E5B84B] transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'حساب إنستجرام' : 'Instagram'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Viewfinder Corner Reticles */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-[#E5B84B]/70 pointer-events-none" />
              <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-[#E5B84B]/70 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-[#E5B84B]/70 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-[#E5B84B]/70 pointer-events-none" />

              {profile.heroImageUrl && (
                <div className="relative mt-auto p-6 flex items-end justify-between gap-4 z-10">
                  <div>
                    <p className="font-mono-tech text-xs text-[#E5B84B] tracking-wider">
                      {profile.handle}
                    </p>
                    <p className="text-sm font-medium text-zinc-100 mt-1">
                      {lang === 'ar' ? profile.taglineAr : profile.taglineEn}
                    </p>
                  </div>

                  {isAdmin && onQuickUploadHero && (
                    <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-zinc-950/90 text-[#E5B84B] border border-[#E5B84B]/40 rounded-lg hover:bg-[#E5B84B] hover:text-[#050505] transition-colors cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'تغيير الصورة' : 'Swap Hero'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onQuickUploadHero(file);
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Full-Width 4-Column Balance & Studio Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 pt-8 border-t border-zinc-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-[#E5B84B] mt-1 shrink-0" />
            <div>
              <p className="font-mono-tech text-2xl font-semibold text-[#FAFAFA] tabular-nums">
                {balanceStats.photos}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'ar' ? 'جلسات تصوير فوتوغرافي' : 'Photo Sessions'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Film className="w-5 h-5 text-[#E5B84B] mt-1 shrink-0" />
            <div>
              <p className="font-mono-tech text-2xl font-semibold text-[#FAFAFA] tabular-nums">
                {balanceStats.videos}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'ar' ? 'ريلز وفيديوهات سينمائية' : 'Cinema Video Reels'}
              </p>
            </div>
          </div>

          <div>
            <p className="font-mono-tech text-2xl font-semibold text-[#FAFAFA] tabular-nums">
              {balanceStats.photoPct}% / {balanceStats.videoPct}%
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lang === 'ar' ? 'توازن الصور والفيديو' : 'Photo & Video Balance'}
            </p>
          </div>

          <div>
            <a
              href={profile.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <p className="font-mono-tech text-lg sm:text-xl font-semibold text-[#E5B84B] group-hover:underline truncate">
                {profile.handle}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'ar' ? 'الأرشيف الرسمي على إنستجرام' : 'Official Instagram Feed'}
              </p>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
