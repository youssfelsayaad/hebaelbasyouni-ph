import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Instagram,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { parseSocialEmbedUrl } from '../lib/instagram';
import type { Language, PortfolioSession } from '../types/portfolio';

interface SessionLightboxProps {
  lang: Language;
  session: PortfolioSession | null;
  onClose: () => void;
}

function getVideoSource(
  url: string
): { type: 'mp4' | 'youtube' | 'vimeo' | 'social' | 'none'; src: string } {
  const clean = url.trim();
  if (!clean) return { type: 'none', src: '' };

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(clean) || clean.startsWith('data:video/')) {
    return { type: 'mp4', src: clean };
  }

  const ytMatch = clean.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/
  );
  if (ytMatch) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  }

  const vimeoMatch = clean.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }

  const social = parseSocialEmbedUrl(clean);
  if (social) {
    return { type: 'social', src: social.embedUrl };
  }

  return { type: 'none', src: '' };
}

export function SessionLightbox({ lang, session, onClose }: SessionLightboxProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlayingReel, setIsPlayingReel] = useState(true);
  const [reelProgress, setReelProgress] = useState(0);

  const images = useMemo(() => {
    if (!session) return [];
    const list = [session.coverImage, ...(session.galleryImages || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [session]);

  useEffect(() => {
    setSlideIndex(0);
    setIsPlayingReel(true);
    setReelProgress(0);
  }, [session?.id]);

  useEffect(() => {
    if (!session) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && images.length > 1) {
        setSlideIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setSlideIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [session, images.length, onClose]);

  const videoInfo = useMemo(
    () => getVideoSource(session?.videoUrl || session?.instagramPostUrl || ''),
    [session?.videoUrl, session?.instagramPostUrl]
  );

  useEffect(() => {
    if (!session || session.mediaType !== 'video' || !isPlayingReel) return;
    if (videoInfo.type !== 'none') return;

    const timer = window.setInterval(() => {
      setReelProgress((prev) => {
        if (prev >= 100) {
          if (images.length > 1) {
            setSlideIndex((idx) => (idx + 1) % images.length);
          }
          return 0;
        }
        return prev + 1.6;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [session, isPlayingReel, videoInfo.type, images.length]);

  if (!session) return null;

  const socialPostEmbed = parseSocialEmbedUrl(session.instagramPostUrl);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl bg-[#0B0B0D] border border-zinc-800 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[92vh]"
        >
          <button
            type="button"
            aria-label="Close lightbox"
            onClick={onClose}
            className="absolute top-4 end-4 z-30 w-10 h-10 rounded-full bg-zinc-950/90 border border-zinc-700 text-zinc-100 hover:border-[#E5B84B] hover:text-[#E5B84B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Media Stage */}
          <div className="lg:col-span-8 relative bg-black flex flex-col justify-center min-h-[360px] sm:min-h-[500px] lg:min-h-[600px] overflow-hidden">
            {session.mediaType === 'video' && videoInfo.type === 'mp4' ? (
              <video
                src={videoInfo.src}
                poster={session.coverImage || undefined}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[75vh] object-contain"
              />
            ) : session.mediaType === 'video' &&
              (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') ? (
              <iframe
                src={videoInfo.src}
                title={session.titleEn}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video max-h-[75vh] border-0"
              />
            ) : (!images.length && socialPostEmbed) ||
              (session.mediaType === 'video' && videoInfo.type === 'social') ? (
              <iframe
                src={(socialPostEmbed || { embedUrl: videoInfo.src }).embedUrl}
                title={session.titleEn}
                className="w-full h-full min-h-[520px] border-0 bg-white"
              />
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[slideIndex]}
                    src={images[slideIndex]}
                    alt={lang === 'ar' ? session.titleAr : session.titleEn}
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0.35, scale: 1.02 }}
                    animate={
                      session.mediaType === 'video' && isPlayingReel
                        ? { opacity: 1, scale: 1.09 }
                        : { opacity: 1, scale: 1 }
                    }
                    exit={{ opacity: 0.25 }}
                    transition={
                      session.mediaType === 'video' && isPlayingReel
                        ? { duration: 6.2, ease: 'linear' }
                        : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
                    }
                    className="w-full h-full max-h-[70vh] object-contain mx-auto"
                  />
                </AnimatePresence>

                {session.mediaType === 'video' && (
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlayingReel((p) => !p)}
                      className="w-9 h-9 rounded-full bg-[#E5B84B] text-[#050505] flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      {isPlayingReel ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ms-0.5" />
                      )}
                    </button>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E5B84B] transition-all duration-100"
                        style={{ width: `${reelProgress}%` }}
                      />
                    </div>
                    <span className="font-mono-tech text-xs text-zinc-200 shrink-0">
                      {session.duration || 'Reel'}
                    </span>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() =>
                        setSlideIndex((prev) => (prev - 1 + images.length) % images.length)
                      }
                      className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-zinc-700 text-white hover:border-[#E5B84B] flex items-center justify-center cursor-pointer"
                    >
                      {lang === 'ar' ? (
                        <ChevronRight className="w-5 h-5" />
                      ) : (
                        <ChevronLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setSlideIndex((prev) => (prev + 1) % images.length)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-zinc-700 text-white hover:border-[#E5B84B] flex items-center justify-center cursor-pointer"
                    >
                      {lang === 'ar' ? (
                        <ChevronLeft className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Editorial Credits & Story Sidebar */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between gap-6 overflow-y-auto border-t lg:border-t-0 lg:border-s border-zinc-800">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="font-mono-tech text-[#E5B84B]">
                  {session.mediaType === 'video'
                    ? lang === 'ar'
                      ? 'فيديو / ريل سينمائي'
                      : 'Cinema Reel'
                    : lang === 'ar'
                      ? 'جلسة تصوير'
                      : 'Photo Session'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tech">{session.sessionDate}</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#FAFAFA] leading-tight">
                {lang === 'ar' ? session.titleAr : session.titleEn}
              </h3>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {lang === 'ar' ? session.storyAr : session.storyEn}
              </p>

              <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500">{lang === 'ar' ? 'المكان' : 'Location'}</span>
                  <span className="text-zinc-200 text-end">
                    {lang === 'ar' ? session.locationAr : session.locationEn}
                  </span>
                </div>
                {session.cameraSpecs && (
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-500">{lang === 'ar' ? 'العدسة والإعدادات' : 'EXIF / Gear'}</span>
                    <span className="font-mono-tech text-zinc-300 text-end">{session.cameraSpecs}</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-400 mb-2.5">
                    {lang === 'ar'
                      ? `لقطات الجلسة (${images.length})`
                      : `Session Frames (${images.length})`}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((imgUrl, idx) => (
                      <button
                        key={`${imgUrl}-${idx}`}
                        type="button"
                        onClick={() => setSlideIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                          slideIndex === idx
                            ? 'border-[#E5B84B] scale-[1.03]'
                            : 'border-zinc-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {session.instagramPostUrl && (
              <a
                href={session.instagramPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] transition-colors"
              >
                {session.instagramPostUrl.includes('facebook.com') ? (
                  <>
                    <span className="font-bold text-sm leading-none">f</span>
                    <span>
                      {lang === 'ar' ? 'فتح البوست على فيسبوك' : 'Open Post on Facebook'}
                    </span>
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4" />
                    <span>
                      {lang === 'ar' ? 'فتح البوست على إنستجرام' : 'Open Post on Instagram'}
                    </span>
                  </>
                )}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
