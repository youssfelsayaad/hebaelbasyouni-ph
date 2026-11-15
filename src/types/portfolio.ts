export type Language = 'ar' | 'en';

export type MediaType = 'photo' | 'video';

export type SessionCategory = 'weddings' | 'bridal' | 'editorial' | 'family' | 'reels';

export type AspectRatio = 'portrait' | 'landscape' | 'wide';

export type InquiryStatus = 'new' | 'contacted' | 'booked' | 'archived';

export interface PortfolioSession {
  id: string;
  titleAr: string;
  titleEn: string;
  mediaType: MediaType;
  category: SessionCategory;
  coverImage: string;
  galleryImages: string[];
  videoUrl: string;
  duration: string;
  locationAr: string;
  locationEn: string;
  sessionDate: string;
  storyAr: string;
  storyEn: string;
  cameraSpecs: string;
  instagramPostUrl: string;
  aspectRatio: AspectRatio;
  featured: boolean;
  orderIndex: number;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface StudioProfile {
  nameAr: string;
  nameEn: string;
  handle: string;
  taglineAr: string;
  taglineEn: string;
  bioAr: string;
  bioEn: string;
  studioPhone: string;
  instagramUrl: string;
  facebookUrl: string;
  studioCityAr: string;
  studioCityEn: string;
  heroImageUrl: string;
  updatedAt?: unknown;
}

export interface AdminUserRecord {
  email: string;
  addedBy: string;
  createdAt?: unknown;
}

export interface BookingInquiry {
  id: string;
  clientName: string;
  clientPhone: string;
  sessionType: string;
  preferredDate: string;
  notes: string;
  status: InquiryStatus;
  createdAt?: unknown;
}
