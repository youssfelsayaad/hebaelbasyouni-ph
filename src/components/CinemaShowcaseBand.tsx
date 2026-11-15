import { ExternalLink, Film, Instagram, Play, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { parseSocialEmbedUrl } from '../lib/instagram';
import type { Language, PortfolioSession } from '../types/portfolio';

interface CinemaShowcaseBandProps {
  lang: Language;
  reels: PortfolioSession[];
  instagramUrl: string;
  facebookUrl?: string;
  onSelectSession: (session: PortfolioSession) => void;
  onViewAllReels: () => void;
  onOpenAdmin: () => void;
}

export function CinemaShowcaseBand({
  lang,
  reels,
  instagramUrl,
  facebookUrl = 'https://www.facebook.com/heba.elbasyuni',
  onSelectSession,
  onViewAllReels,
  onOpenAdmin,
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
                ? 'الريلز والأفلام السينمائية'
                : 'Cinema Reels & Video Works'}
            </h2>
          </div>

          {reels.length > 0 && (
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
          )}
        </div>

        {featuredReels.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-base font-semibold text-[#FAFAFA]">
                {lang === 'ar'
                  ? 'أضيفي الفيديوهات أو روابط الريلز من فيسبوك وإنستجرام لعرضها هنا مباشرة'
                  : 'Add real Reel links from Facebook or Instagram, or video files to showcase here'}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {lang === 'ar'
                  ? 'ارفعِي الفيديوهات أو ألصقي روابط أي فيديو من فيسبوك أو ريل من إنستجرام داخل لوحة الأدمن لعرضه مباشرة في المعرض.'
                  : 'Upload video files or paste Facebook/Instagram video links in the Admin panel to display them live.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إضافة ريلز من الأدمن' : 'Add Reels in Admin'}</span>
              </button>
              <a
                href={facebookUrl || 'https://www.facebook.com/heba.elbasyuni'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-medium border border-zinc-700 text-zinc-200 rounded-xl hover:border-[#E5B84B]"
              >
                <span className="font-bold text-[#E5B84B]">f</span>
                <span>{lang === 'ar' ? 'فيسبوك' : 'Facebook'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-medium border border-zinc-700 text-zinc-200 rounded-xl hover:border-[#E5B84B]"
              >
                <Instagram className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إنستجرام' : 'Instagram'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredReels.map((reel, idx) => {
              const socialEmbed = parseSocialEmbedUrl(reel.instagramPostUrl || reel.videoUrl);
              return (
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
                  className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer flex flex-col"
                >
                  {reel.coverImage ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                      <img
                        src={reel.coverImage}
                        alt={lang === 'ar' ? reel.titleAr : reel.titleEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[#E5B84B]/95 text-[#050505] flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
                          <Play className="w-5 h-5 fill-current ms-0.5" />
                        </div>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono-tech mb-1.5">
                          <span className="text-[#E5B84B]">{reel.duration || 'Reel'}</span>
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
                  ) : socialEmbed ? (
                    <div className="flex flex-col bg-zinc-950">
                      <iframe
                        src={socialEmbed.embedUrl}
                        title={reel.titleEn}
                        className="w-full h-[420px] border-0 bg-white"
                        loading="lazy"
                        allowFullScreen
                      />
                      <div className="p-4 flex items-center justify-between border-t border-zinc-800">
                        <span className="text-xs font-semibold text-[#FAFAFA] truncate">
                          {lang === 'ar' ? reel.titleAr : reel.titleEn}
                        </span>
                        <span className="text-xs text-[#E5B84B] shrink-0">
                          {lang === 'ar' ? 'تكبير' : 'Expand'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between bg-zinc-950 aspect-[16/10] p-6">
                      <div className="flex items-center justify-between text-xs font-mono-tech text-[#E5B84B]">
                        <span>{reel.duration || 'Reel'}</span>
                        <span>{reel.sessionDate}</span>
                      </div>
                      <div className="flex items-center justify-center my-auto">
                        <div className="w-14 h-14 rounded-full bg-[#E5B84B]/15 border border-[#E5B84B]/40 text-[#E5B84B] flex items-center justify-center">
                          <Play className="w-6 h-6 fill-current ms-0.5" />
                        </div>
                      </div>
                      <h3 className="text-base font-semibold text-[#FAFAFA] line-clamp-1">
                        {lang === 'ar' ? reel.titleAr : reel.titleEn}
                      </h3>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
