import { useEffect } from 'react';
import type {
  Language,
  MediaType,
  PortfolioSession,
  StudioProfile,
} from '../types/portfolio';

interface SeoHelmetProps {
  lang: Language;
  activeView: 'home' | 'admin';
  mediaFilter: 'all' | MediaType;
  profile: StudioProfile;
  selectedSession: PortfolioSession | null;
  sessions: PortfolioSession[];
}

const DEFAULT_OG_PATH = '/heba-media/story-1741657867966283-0.jpg';

function resolvePublicImageUrl(candidate: string | undefined, origin: string): string {
  const trimmed = (candidate || '').trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`;
  }
  return `${origin}${DEFAULT_OG_PATH}`;
}

function truncateText(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let script = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function SeoHelmet({
  lang,
  activeView,
  mediaFilter,
  profile,
  selectedSession,
  sessions,
}: SeoHelmetProps) {
  useEffect(() => {
    const origin = window.location.origin;
    const canonicalUrl = `${origin}${window.location.pathname}`;
    const isAr = lang === 'ar';

    const studioName = isAr ? profile.nameAr : profile.nameEn;
    const siteName = `${profile.nameAr} للتصوير | ${profile.nameEn} Photography`;
    const defaultImage = resolvePublicImageUrl(
      sessions.find((s) => s.featured && s.coverImage)?.coverImage || profile.heroImageUrl,
      origin
    );

    let title = isAr
      ? `${profile.nameAr} | تصوير أفراح وبورتريه وعرايس في مصر`
      : `${profile.nameEn} | Wedding & Portrait Photography`;

    let description = isAr
      ? `استوديو ${profile.nameAr} لتصوير حفلات الزفاف، بورتريه العرايس، جلسات الإيديتوريال والريلز السينمائية في ${profile.studioCityAr}. احجزي جلستك الآن.`
      : `${profile.nameEn} Studio crafts warm wedding albums, bridal portraits, editorial sessions & cinema reels across ${profile.studioCityEn}. Book now.`;

    let keywords = isAr
      ? 'تصوير أفراح مصر, مصورة عرايس الإسكندرية, تصوير بورتريه, هبة البسيوني, سيشن خطوبة, ريلز أفراح سينمائية, تصوير فوتوغرافي القاهرة'
      : 'wedding photographer Egypt, bridal portrait photography, Heba El-Basyouni, Alexandria wedding photography, Cairo portrait studio, wedding cinema reels';

    let ogType = 'website';
    let ogImage = defaultImage;
    let ogImageAlt = isAr
      ? `جلسة تصوير زفاف وبورتريه بعدسة ${profile.nameAr}`
      : `Wedding and bridal portrait photography by ${profile.nameEn}`;
    let robots = 'index, follow';

    if (activeView === 'admin') {
      title = isAr
        ? `لوحة إدارة الاستوديو | ${profile.nameAr}`
        : `Studio Admin Panel | ${profile.nameEn}`;
      description = isAr
        ? `إدارة جلسات التصوير والريلز وطلبات الحجز لاستوديو ${profile.nameAr}.`
        : `Manage photo sessions, reels, and booking inquiries for ${profile.nameEn} Studio.`;
      robots = 'noindex, nofollow';
    } else if (selectedSession) {
      const sessionTitle = isAr ? selectedSession.titleAr : selectedSession.titleEn;
      const sessionLocation = isAr ? selectedSession.locationAr : selectedSession.locationEn;
      const sessionStory = isAr ? selectedSession.storyAr : selectedSession.storyEn;

      title = truncateText(`${sessionTitle} | ${studioName}`, 60);
      description = truncateText(
        `${sessionStory} — ${sessionLocation} (${profile.handle})`,
        158
      );
      ogType = selectedSession.mediaType === 'video' ? 'video.other' : 'article';
      ogImage = resolvePublicImageUrl(selectedSession.coverImage, origin);
      ogImageAlt = `${sessionTitle} — ${sessionLocation}`;
    } else if (mediaFilter === 'photo') {
      title = isAr
        ? `ألبومات الأفراح وبورتريه العرايس | ${profile.nameAr}`
        : `Wedding & Bridal Portrait Albums | ${profile.nameEn}`;
      description = isAr
        ? `تصفحي أحدث ألبومات تصوير الزفاف، الخطوبة، وبورتريه العرايس بعدسة ${profile.nameAr} في ${profile.studioCityAr}.`
        : `Explore timeless wedding, engagement, and bridal portrait albums captured by ${profile.nameEn} across ${profile.studioCityEn}.`;
    } else if (mediaFilter === 'video') {
      title = isAr
        ? `الريلز السينمائية وأفلام الزفاف | ${profile.nameAr}`
        : `Cinematic Wedding & Portrait Reels | ${profile.nameEn}`;
      description = isAr
        ? `شاهدي الريلز السينمائية وكواليس جلسات الزفاف والبورتريه بعدسة ${profile.nameAr} (${profile.handle}).`
        : `Watch handcrafted wedding and editorial cinema reels filmed by ${profile.nameEn} (${profile.handle}).`;
    }

    document.title = title;
    upsertCanonical(canonicalUrl);

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', robots);

    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', siteName);
    upsertMeta('property', 'og:locale', isAr ? 'ar_EG' : 'en_US');
    upsertMeta('property', 'og:locale:alternate', isAr ? 'en_US' : 'ar_EG');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:alt', ogImageAlt);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'twitter:image:alt', ogImageAlt);

    const sameAs = [profile.instagramUrl, profile.facebookUrl].filter(Boolean);
    const featuredWorks = sessions
      .filter((s) => s.coverImage)
      .slice(0, 6)
      .map((s) => ({
        '@type': s.mediaType === 'video' ? 'VideoObject' : 'ImageObject',
        name: isAr ? s.titleAr : s.titleEn,
        description: truncateText(isAr ? s.storyAr : s.storyEn, 140),
        contentUrl: resolvePublicImageUrl(s.coverImage, origin),
        thumbnailUrl: resolvePublicImageUrl(s.coverImage, origin),
        contentLocation: isAr ? s.locationAr : s.locationEn,
      }));

    if (selectedSession) {
      upsertJsonLd('studio-jsonld', {
        '@context': 'https://schema.org',
        '@type': selectedSession.mediaType === 'video' ? 'VideoObject' : 'ImageGallery',
        name: isAr ? selectedSession.titleAr : selectedSession.titleEn,
        description: isAr ? selectedSession.storyAr : selectedSession.storyEn,
        thumbnailUrl: ogImage,
        image: ogImage,
        url: canonicalUrl,
        contentLocation: isAr ? selectedSession.locationAr : selectedSession.locationEn,
        datePublished: selectedSession.sessionDate,
        creator: {
          '@type': 'Person',
          name: profile.nameEn,
          alternateName: profile.nameAr,
          sameAs,
        },
      });
    } else {
      upsertJsonLd('studio-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: `${profile.nameEn} Photography`,
        alternateName: `${profile.nameAr} للتصوير`,
        description,
        url: canonicalUrl,
        image: defaultImage,
        telephone: profile.studioPhone
          ? profile.studioPhone.startsWith('+')
            ? profile.studioPhone
            : profile.studioPhone.startsWith('0')
              ? `+2${profile.studioPhone}`
              : `+20${profile.studioPhone}`
          : '+201098993187',
        areaServed: [profile.studioCityEn, 'Alexandria', 'Cairo', 'Egypt'],
        serviceType: [
          'Wedding Photography',
          'Bridal Portrait Photography',
          'Engagement Sessions',
          'Editorial Portraits',
          'Cinematic Wedding Reels',
        ],
        sameAs,
        subjectOf: {
          '@type': 'ImageGallery',
          name: isAr
            ? `معرض أعمال ${profile.nameAr} للزفاف والبورتريه`
            : `${profile.nameEn} Wedding & Portrait Portfolio`,
          associatedMedia: featuredWorks,
        },
      });
    }
  }, [lang, activeView, mediaFilter, profile, selectedSession, sessions]);

  return null;
}
