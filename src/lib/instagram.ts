export interface ParsedInstagramUrl {
  shortcode: string;
  kind: 'p' | 'reel' | 'tv';
  canonicalUrl: string;
  embedUrl: string;
}

export interface ParsedSocialEmbed {
  platform: 'instagram' | 'facebook-video' | 'facebook-post';
  canonicalUrl: string;
  embedUrl: string;
}

export function parseInstagramPostUrl(rawUrl: string): ParsedInstagramUrl | null {
  const clean = rawUrl.trim();
  if (!clean) return null;

  const match = clean.match(
    /instagram\.com\/(?:[^/\s"']+\/)?(p|reel|tv)\/([A-Za-z0-9_-]+)/i
  );
  if (!match) return null;

  const kind = match[1].toLowerCase() as 'p' | 'reel' | 'tv';
  const shortcode = match[2];
  const canonicalUrl = `https://www.instagram.com/${kind}/${shortcode}/`;
  const embedUrl = `https://www.instagram.com/${kind}/${shortcode}/embed/`;

  return {
    shortcode,
    kind,
    canonicalUrl,
    embedUrl,
  };
}

export function parseSocialEmbedUrl(rawUrl: string): ParsedSocialEmbed | null {
  const clean = rawUrl.trim();
  if (!clean) return null;

  const ig = parseInstagramPostUrl(clean);
  if (ig) {
    return {
      platform: 'instagram',
      canonicalUrl: ig.canonicalUrl,
      embedUrl: ig.embedUrl,
    };
  }

  if (/(?:facebook\.com|fb\.watch)/i.test(clean)) {
    const encoded = encodeURIComponent(clean);
    if (/\/(videos|reel|watch)\b|fb\.watch/i.test(clean)) {
      return {
        platform: 'facebook-video',
        canonicalUrl: clean,
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=560`,
      };
    }
    if (/\/(posts|photos|photo\.php|permalink\.php)/i.test(clean)) {
      return {
        platform: 'facebook-post',
        canonicalUrl: clean,
        embedUrl: `https://www.facebook.com/plugins/post.php?href=${encoded}&show_text=true&width=500`,
      };
    }
  }

  return null;
}
