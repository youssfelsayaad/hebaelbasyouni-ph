import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  Database,
  Edit3,
  Film,
  LogIn,
  LogOut,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { User } from 'firebase/auth';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  compressImageToDataUrl,
  signInWithGooglePopup,
  signOutAdmin,
} from '../lib/firebase';
import type {
  AdminUserRecord,
  AspectRatio,
  BookingInquiry,
  InquiryStatus,
  Language,
  MediaType,
  PortfolioSession,
  SessionCategory,
  StudioProfile,
} from '../types/portfolio';

interface AdminDashboardProps {
  lang: Language;
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  sessions: PortfolioSession[];
  hasFirestoreSessions: boolean;
  profile: StudioProfile;
  inquiries: BookingInquiry[];
  adminEmails: AdminUserRecord[];
  balanceStats: {
    photos: number;
    videos: number;
    total: number;
    photoPct: number;
    videoPct: number;
  };
  syncing: boolean;
  onBackToSite: () => void;
  onSeedFirestore: () => Promise<void>;
  onSaveSession: (
    data: Omit<PortfolioSession, 'authorUid' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
  onSaveProfile: (profile: StudioProfile) => Promise<void>;
  onUpdateInquiryStatus: (id: string, status: InquiryStatus) => Promise<void>;
  onDeleteInquiry: (id: string) => Promise<void>;
  onAddAdminEmail: (email: string) => Promise<void>;
  onRemoveAdminEmail: (email: string) => Promise<void>;
}

type AdminTab = 'works' | 'profile' | 'inquiries' | 'admins';

function createEmptySession(mediaType: MediaType, orderIndex: number, fallbackCover: string): PortfolioSession {
  return {
    id: `session-${mediaType}-${Date.now()}`,
    titleAr: '',
    titleEn: '',
    mediaType,
    category: mediaType === 'video' ? 'reels' : 'weddings',
    coverImage: fallbackCover,
    galleryImages: [],
    videoUrl: '',
    duration: mediaType === 'video' ? '01:00' : '',
    locationAr: 'القاهرة · مصر',
    locationEn: 'Cairo · Egypt',
    sessionDate: new Date().toISOString().slice(0, 7),
    storyAr: '',
    storyEn: '',
    cameraSpecs: mediaType === 'video' ? 'Sony FX3 · 35mm f/1.4 · 4K' : 'Sony A7R V · 85mm f/1.4',
    instagramPostUrl: 'https://www.instagram.com/hebaelbasyouni1/',
    aspectRatio: mediaType === 'video' ? 'landscape' : 'portrait',
    featured: false,
    orderIndex,
    authorUid: 'admin',
  };
}

export function AdminDashboard({
  lang,
  user,
  authReady,
  isAdmin,
  sessions,
  hasFirestoreSessions,
  profile,
  inquiries,
  adminEmails,
  balanceStats,
  syncing,
  onBackToSite,
  onSeedFirestore,
  onSaveSession,
  onDeleteSession,
  onSaveProfile,
  onUpdateInquiryStatus,
  onDeleteInquiry,
  onAddAdminEmail,
  onRemoveAdminEmail,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('works');
  const [filterType, setFilterType] = useState<'all' | MediaType>('all');
  const [editingSession, setEditingSession] = useState<PortfolioSession | null>(null);
  const [isNewSession, setIsNewSession] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [authError, setAuthError] = useState('');

  const [profileForm, setProfileForm] = useState<StudioProfile>(profile);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleLogin = async () => {
    setAuthError('');
    try {
      await signInWithGooglePopup();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : lang === 'ar'
            ? 'تعذر تسجيل الدخول عبر جوجل.'
            : 'Google Sign-In failed.'
      );
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!editingSession) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 1400, 0.82);
      setEditingSession({ ...editingSession, coverImage: dataUrl });
      showToast(lang === 'ar' ? 'تم ضغط ورفع صورة الغلاف' : 'Cover image ready');
    } catch {
      showToast(lang === 'ar' ? 'حدث خطأ أثناء معالجة الصورة' : 'Image processing failed');
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!editingSession || !files) return;
    const incomingFiles = Array.from(files).slice(0, 10 - editingSession.galleryImages.length);
    const compressed: string[] = [];
    for (const file of incomingFiles) {
      const url = await compressImageToDataUrl(file, 1200, 0.78);
      compressed.push(url);
    }
    setEditingSession({
      ...editingSession,
      galleryImages: [...editingSession.galleryImages, ...compressed].slice(0, 10),
    });
    showToast(
      lang === 'ar'
        ? `تمت إضافة ${compressed.length} صور للألبوم`
        : `Added ${compressed.length} frames to gallery`
    );
  };

  const handleHeroUpload = async (file: File) => {
    try {
      const dataUrl = await compressImageToDataUrl(file, 1400, 0.84);
      const updated = { ...profileForm, heroImageUrl: dataUrl };
      setProfileForm(updated);
      await onSaveProfile(updated);
      showToast(
        lang === 'ar'
          ? 'تم تحديث الصورة الرئيسية وحفظها في قاعدة البيانات'
          : 'Main Hero photo updated & saved!'
      );
    } catch {
      showToast(lang === 'ar' ? 'تعذر حفظ الصورة الرئيسية' : 'Could not update hero image');
    }
  };

  const handleSaveSessionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    setSaving(true);
    try {
      await onSaveSession(
        {
          id: editingSession.id,
          titleAr: editingSession.titleAr.trim() || editingSession.titleEn.trim(),
          titleEn: editingSession.titleEn.trim() || editingSession.titleAr.trim(),
          mediaType: editingSession.mediaType,
          category: editingSession.category,
          coverImage: editingSession.coverImage,
          galleryImages: editingSession.galleryImages,
          videoUrl: editingSession.videoUrl.trim(),
          duration: editingSession.duration.trim(),
          locationAr: editingSession.locationAr.trim() || 'القاهرة',
          locationEn: editingSession.locationEn.trim() || 'Cairo',
          sessionDate: editingSession.sessionDate.trim() || '2026-11',
          storyAr: editingSession.storyAr.trim() || editingSession.titleAr.trim(),
          storyEn: editingSession.storyEn.trim() || editingSession.titleEn.trim(),
          cameraSpecs: editingSession.cameraSpecs.trim(),
          instagramPostUrl: editingSession.instagramPostUrl.trim(),
          aspectRatio: editingSession.aspectRatio,
          featured: editingSession.featured,
          orderIndex: Number(editingSession.orderIndex) || 1,
        },
        isNewSession
      );
      setEditingSession(null);
      showToast(lang === 'ar' ? 'تم حفظ العمل بنجاح' : 'Session saved successfully');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile(profileForm);
      showToast(
        lang === 'ar'
          ? 'تم حفظ بيانات الاستوديو والروابط بنجاح'
          : 'Studio profile & links saved!'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    try {
      await onAddAdminEmail(newAdminEmail);
      setNewAdminEmail('');
      showToast(lang === 'ar' ? 'تمت إضافة بريد الأدمن بنجاح' : 'Co-admin added');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add admin');
    }
  };

  const visibleSessions = sessions.filter((s) =>
    filterType === 'all' ? true : s.mediaType === filterType
  );

  // Auth Gate UI
  if (!authReady || !user || !isAdmin) {
    return (
      <section className="min-h-[82vh] bg-[#050505] py-16 px-5 sm:px-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-[#0A0A0C] border border-zinc-800 rounded-2xl p-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-8 h-8 text-[#E5B84B]" />
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              <span>{lang === 'ar' ? 'العودة للموقع' : 'Back to Portfolio'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h1 className="font-display text-3xl font-semibold text-[#FAFAFA]">
              {lang === 'ar' ? 'لوحة تحكم الاستوديو — هبة البسيوني' : 'Studio Admin Panel'}
            </h1>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              {lang === 'ar'
                ? 'سجّلي الدخول بحساب جوجل المصرّح له لإضافة جلسات تصوير جديدة، رفع الفيديوهات، تعديل الصورة الرئيسية، وتحديث رقم الهاتف وروابط السوشيال.'
                : 'Sign in with an authorized Google account to add photo sessions, publish video reels, swap the hero photo, and manage inquiries.'}
            </p>
          </div>

          {user && !isAdmin ? (
            <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-3">
              <p className="text-xs text-amber-300 font-medium">
                {lang === 'ar'
                  ? `الحساب المسجل حالياً (${user.email}) غير مضاف في قائمة الأدمن بعد.`
                  : `Signed-in account (${user.email}) is not yet in the Admin allowlist.`}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {lang === 'ar'
                  ? `يمكن لمدير المشروع (${BOOTSTRAPPED_ADMIN_EMAIL}) تسجيل الدخول وإضافة بريدك من تبويب "صلاحيات الأدمن".`
                  : `Ask the owner (${BOOTSTRAPPED_ADMIN_EMAIL}) to add your email under Admin Access.`}
              </p>
              <button
                type="button"
                onClick={signOutAdmin}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 text-sm font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {lang === 'ar' ? 'تسجيل الدخول عبر Google' : 'Sign In with Google'}
              </span>
            </button>
          )}

          {authError && <p className="text-xs text-rose-400">{authError}</p>}
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#050505] py-10 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Banner */}
        {toast && (
          <div className="fixed bottom-6 end-6 z-50 px-5 py-3 rounded-xl bg-[#E5B84B] text-[#050505] text-xs font-semibold shadow-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <p className="font-mono-tech text-xs text-[#E5B84B]">
              {user.email} · Verified Studio Admin
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#FAFAFA] mt-1">
              {lang === 'ar' ? 'إدارة بورتفوليو هبة البسيوني' : 'Heba El-Basyouni Studio CMS'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToSite}
              className="px-4 py-2 text-xs font-medium border border-zinc-700 text-zinc-200 rounded-lg hover:border-[#E5B84B] transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'معاينة الموقع' : 'View Live Site'}
            </button>
            <button
              type="button"
              onClick={signOutAdmin}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:text-rose-400 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'خروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Cloud Seed Banner when Firestore is still empty */}
        {!hasFirestoreSessions && (
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-[#E5B84B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#FAFAFA]">
                {lang === 'ar'
                  ? 'حفظ الأعمال الـ 24 الافتراضية في قاعدة البيانات السحابية'
                  : 'Sync Initial 24 Balanced Works to Cloud Database'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'ar'
                  ? 'اضغطي مرة واحدة لنقل الـ 12 سيشن تصوير و12 فيديو ريل إلى Firestore لتتمكني من تعديلها أو حذفها في أي وقت.'
                  : 'Push the balanced 12 photo sessions & 12 video reels into Firestore so you can edit or delete any item permanently.'}
              </p>
            </div>
            <button
              type="button"
              disabled={syncing}
              onClick={async () => {
                await onSeedFirestore();
                showToast(lang === 'ar' ? 'تم حفظ 24 عمل في قاعدة البيانات!' : '24 works synced!');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] shrink-0 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>
                {syncing
                  ? lang === 'ar'
                    ? 'جاري الحفظ...'
                    : 'Syncing...'
                  : lang === 'ar'
                    ? 'مزامنة الـ 24 عمل الآن'
                    : 'Sync 24 Works Now'}
              </span>
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
          {(
            [
              { id: 'works', label: lang === 'ar' ? `السيشنات والفيديوهات (${balanceStats.total})` : `Sessions & Reels (${balanceStats.total})` },
              { id: 'profile', label: lang === 'ar' ? 'الصورة الرئيسية وبيانات التواصل' : 'Hero Photo & Contact Links' },
              { id: 'inquiries', label: lang === 'ar' ? `طلبات الحجز (${inquiries.length})` : `Inquiries (${inquiries.length})` },
              { id: 'admins', label: lang === 'ar' ? 'صلاحيات الأدمن' : 'Admin Access' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#E5B84B] text-[#050505]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SESSIONS & VIDEO REELS */}
        {activeTab === 'works' && (
          <div className="space-y-6">
            {/* Balance Summary + Add Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium">
                    {lang === 'ar' ? 'توازن المحتوى الحالي' : 'Current Content Balance'}
                  </span>
                  <span className="font-mono-tech text-[#E5B84B]">
                    {balanceStats.photos} Photos ({balanceStats.photoPct}%) · {balanceStats.videos} Videos ({balanceStats.videoPct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-[#E5B84B] transition-all duration-300"
                    style={{ width: `${balanceStats.photoPct}%` }}
                  />
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-wrap lg:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewSession(true);
                    setEditingSession(
                      createEmptySession('photo', sessions.length + 1, profile.heroImageUrl)
                    );
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إضافة سيشن صور' : 'Add Photo Session'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsNewSession(true);
                    setEditingSession(
                      createEmptySession('video', sessions.length + 1, profile.heroImageUrl)
                    );
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-zinc-100 text-[#050505] rounded-xl hover:bg-white cursor-pointer"
                >
                  <Film className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إضافة فيديو / ريل' : 'Add Video Reel'}</span>
                </button>
              </div>
            </div>

            {/* Session Editor Form Modal/Panel */}
            {editingSession && (
              <form
                onSubmit={handleSaveSessionSubmit}
                className="bg-[#0C0C0F] border border-[#E5B84B]/50 rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-lg font-semibold text-[#FAFAFA]">
                    {isNewSession
                      ? lang === 'ar'
                        ? 'إضافة عمل جديد للمعرض'
                        : 'Add New Portfolio Work'
                      : lang === 'ar'
                        ? 'تعديل العمل'
                        : 'Edit Portfolio Work'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingSession(null)}
                    className="text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'النوع' : 'Media Type'}
                    </label>
                    <select
                      value={editingSession.mediaType}
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          mediaType: e.target.value as MediaType,
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    >
                      <option value="photo">{lang === 'ar' ? 'سيشن صور (Photo)' : 'Photo Session'}</option>
                      <option value="video">{lang === 'ar' ? 'فيديو / ريل (Video)' : 'Video Reel'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'التصنيف' : 'Category'}
                    </label>
                    <select
                      value={editingSession.category}
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          category: e.target.value as SessionCategory,
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    >
                      <option value="weddings">{lang === 'ar' ? 'أفراح وخطوبة' : 'Weddings'}</option>
                      <option value="bridal">{lang === 'ar' ? 'بورتريه عرايس' : 'Bridal'}</option>
                      <option value="editorial">{lang === 'ar' ? 'أزياء وإيديتوريال' : 'Editorial'}</option>
                      <option value="family">{lang === 'ar' ? 'عائلي وأمومة' : 'Family'}</option>
                      <option value="reels">{lang === 'ar' ? 'ريلز سينمائية' : 'Cinema Reels'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'نسبة العرض' : 'Aspect Ratio'}
                    </label>
                    <select
                      value={editingSession.aspectRatio}
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          aspectRatio: e.target.value as AspectRatio,
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    >
                      <option value="portrait">{lang === 'ar' ? 'طولي (Portrait)' : 'Portrait'}</option>
                      <option value="landscape">{lang === 'ar' ? 'عرضي (Landscape)' : 'Landscape'}</option>
                      <option value="wide">{lang === 'ar' ? 'عريض مميز (Wide 2-col)' : 'Wide Feature'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'عنوان العمل (عربي) *' : 'Title (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={140}
                      value={editingSession.titleAr}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, titleAr: e.target.value })
                      }
                      placeholder="مثال: سيشن زفاف فرح ومصطفى"
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'عنوان العمل (إنجليزي)' : 'Title (English)'}
                    </label>
                    <input
                      type="text"
                      maxLength={140}
                      value={editingSession.titleEn}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, titleEn: e.target.value })
                      }
                      placeholder="e.g. Farah & Mostafa Wedding"
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    />
                  </div>
                </div>

                {/* Cover Upload or URL */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="lg:col-span-3">
                    <img
                      src={editingSession.coverImage}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded-lg border border-zinc-700"
                    />
                  </div>
                  <div className="lg:col-span-9 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-lg cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'رفع صورة غلاف من الجهاز' : 'Upload Cover Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleCoverUpload(f);
                          }}
                        />
                      </label>
                      <span className="text-xs text-zinc-500">
                        {lang === 'ar' ? 'أو الصقي رابط الصورة مباشرة:' : 'Or paste direct image URL:'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editingSession.coverImage}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, coverImage: e.target.value })
                      }
                      dir="ltr"
                      className="w-full px-3 py-2 text-xs font-mono-tech bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300"
                    />
                  </div>
                </div>

                {/* Video Fields OR Multi-Photo Gallery Upload */}
                {editingSession.mediaType === 'video' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-zinc-400 mb-1.5">
                        {lang === 'ar'
                          ? 'رابط الفيديو (MP4 / YouTube / Vimeo / Instagram Reel)'
                          : 'Video URL (MP4 / YouTube / Vimeo / Instagram Reel)'}
                      </label>
                      <input
                        type="text"
                        maxLength={1000}
                        dir="ltr"
                        value={editingSession.videoUrl}
                        onChange={(e) =>
                          setEditingSession({ ...editingSession, videoUrl: e.target.value })
                        }
                        placeholder="https://www.instagram.com/reel/... or https://.../video.mp4"
                        className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">
                        {lang === 'ar' ? 'المدة' : 'Duration'}
                      </label>
                      <input
                        type="text"
                        maxLength={24}
                        dir="ltr"
                        value={editingSession.duration}
                        onChange={(e) =>
                          setEditingSession({ ...editingSession, duration: e.target.value })
                        }
                        placeholder="01:15"
                        className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-medium text-zinc-300">
                        {lang === 'ar'
                          ? `صور إضافية داخل الألبوم (${editingSession.galleryImages.length}/10)`
                          : `Gallery Frames (${editingSession.galleryImages.length}/10)`}
                      </span>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'إضافة صور للألبوم' : 'Upload Gallery Photos'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => void handleGalleryUpload(e.target.files)}
                        />
                      </label>
                    </div>
                    {editingSession.galleryImages.length > 0 && (
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {editingSession.galleryImages.map((img, i) => (
                          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setEditingSession({
                                  ...editingSession,
                                  galleryImages: editingSession.galleryImages.filter((_, idx) => idx !== i),
                                })
                              }
                              className="absolute inset-0 bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'المكان (عربي)' : 'Location (Arabic)'}
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={editingSession.locationAr}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, locationAr: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'التاريخ' : 'Date'}
                    </label>
                    <input
                      type="text"
                      maxLength={32}
                      dir="ltr"
                      value={editingSession.sessionDate}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, sessionDate: e.target.value })
                      }
                      placeholder="2026-11"
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'رابط البوست على إنستجرام' : 'Instagram Post URL'}
                    </label>
                    <input
                      type="url"
                      maxLength={400}
                      dir="ltr"
                      value={editingSession.instagramPostUrl}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, instagramPostUrl: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'قصة السيشن (عربي)' : 'Story / Caption (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      maxLength={1000}
                      value={editingSession.storyAr}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, storyAr: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'إعدادات الكاميرا / EXIF' : 'Camera / Lens Specs'}
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      dir="ltr"
                      value={editingSession.cameraSpecs}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, cameraSpecs: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSession.featured}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, featured: e.target.checked })
                      }
                      className="accent-[#E5B84B] w-4 h-4"
                    />
                    <span>{lang === 'ar' ? 'تمييز العمل في الواجهة' : 'Mark as Featured'}</span>
                  </label>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] cursor-pointer"
                  >
                    {saving
                      ? lang === 'ar'
                        ? 'جاري الحفظ...'
                        : 'Saving...'
                      : lang === 'ar'
                        ? 'حفظ في قاعدة البيانات'
                        : 'Save to Firestore'}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Filter in Admin */}
            <div className="flex items-center gap-2">
              {(['all', 'photo', 'video'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                    filterType === t
                      ? 'bg-zinc-100 text-[#050505] border-zinc-100'
                      : 'text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {t === 'all'
                    ? lang === 'ar'
                      ? 'الكل'
                      : 'All'
                    : t === 'photo'
                      ? lang === 'ar'
                        ? 'الصور'
                        : 'Photos'
                      : lang === 'ar'
                        ? 'الفيديوهات'
                        : 'Videos'}
                </button>
              ))}
            </div>

            {/* Works Table / List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleSessions.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex gap-4 items-center"
                >
                  <img
                    src={item.coverImage}
                    alt={item.titleEn}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-mono-tech text-[#E5B84B]">
                      {item.mediaType === 'video' ? (
                        <Film className="w-3.5 h-3.5" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>{item.mediaType === 'video' ? item.duration || 'Reel' : 'Photo'}</span>
                      {item.featured && <Star className="w-3 h-3 fill-current" />}
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-100 truncate mt-1">
                      {lang === 'ar' ? item.titleAr : item.titleEn}
                    </h4>
                    <p className="text-xs text-zinc-500 truncate">
                      {lang === 'ar' ? item.locationAr : item.locationEn}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewSession(false);
                          setEditingSession(item);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-zinc-800 text-zinc-200 rounded hover:text-[#E5B84B] cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeleteSession(item.id);
                          showToast(lang === 'ar' ? 'تم حذف العمل' : 'Session deleted');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-zinc-800 text-rose-400 rounded hover:bg-rose-950 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{lang === 'ar' ? 'حذف' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE, HERO PHOTO & SOCIAL LINKS */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveProfileSubmit}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Hero Photo Upload Block */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-800">
              <img
                src={profileForm.heroImageUrl}
                alt="Hero Preview"
                className="w-36 h-44 object-cover rounded-xl border border-zinc-700 shrink-0"
              />
              <div className="space-y-3 flex-1">
                <h2 className="text-lg font-semibold text-[#FAFAFA]">
                  {lang === 'ar' ? 'الصورة الرئيسية لواجهة الموقع (Hero Photo)' : 'Main Hero Portrait'}
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'ارفعي صورة هبة الشخصية مباشرة من جهازك ليتم ضغطها وحفظها في واجهة البورتفوليو فوراً.'
                    : 'Upload Heba’s portrait from your device to immediately update the main hero frame.'}
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'رفع وتعيين الصورة الرئيسية' : 'Upload & Set Hero Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleHeroUpload(f);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {lang === 'ar' ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  maxLength={40}
                  value={profileForm.studioPhone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, studioPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {lang === 'ar' ? 'رابط إنستجرام' : 'Instagram URL'}
                </label>
                <input
                  type="url"
                  dir="ltr"
                  maxLength={300}
                  value={profileForm.instagramUrl}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, instagramUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {lang === 'ar' ? 'رابط فيسبوك' : 'Facebook URL'}
                </label>
                <input
                  type="url"
                  dir="ltr"
                  maxLength={300}
                  value={profileForm.facebookUrl}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, facebookUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {lang === 'ar' ? 'نبذة عن هبة (عربي)' : 'Bio (Arabic)'}
                </label>
                <textarea
                  rows={3}
                  maxLength={1200}
                  value={profileForm.bioAr}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bioAr: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {lang === 'ar' ? 'نبذة عن هبة (إنجليزي)' : 'Bio (English)'}
                </label>
                <textarea
                  rows={3}
                  maxLength={1200}
                  value={profileForm.bioEn}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bioEn: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] cursor-pointer"
            >
              {saving
                ? lang === 'ar'
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : lang === 'ar'
                  ? 'حفظ التغييرات'
                  : 'Save Profile Changes'}
            </button>
          </form>
        )}

        {/* TAB 3: BOOKING INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl text-sm text-zinc-400">
                {lang === 'ar'
                  ? 'لا توجد طلبات حجز مسجلة بعد.'
                  : 'No booking inquiries submitted yet.'}
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="text-sm font-semibold text-zinc-100">{inq.clientName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tech text-[#E5B84B]" dir="ltr">
                        {inq.clientPhone}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{inq.sessionType}</span>
                    </div>
                    {inq.preferredDate && (
                      <p className="font-mono-tech text-xs text-zinc-400">
                        Date: {inq.preferredDate}
                      </p>
                    )}
                    {inq.notes && <p className="text-xs text-zinc-300">{inq.notes}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inq.status}
                      onChange={(e) =>
                        void onUpdateInquiryStatus(inq.id, e.target.value as InquiryStatus)
                      }
                      className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200"
                    >
                      <option value="new">{lang === 'ar' ? 'جديد' : 'New'}</option>
                      <option value="contacted">{lang === 'ar' ? 'تم التواصل' : 'Contacted'}</option>
                      <option value="booked">{lang === 'ar' ? 'تم الحجز' : 'Booked'}</option>
                      <option value="archived">{lang === 'ar' ? 'مؤرشف' : 'Archived'}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void onDeleteInquiry(inq.id)}
                      className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: ADMIN ACCESS ALLOWLIST */}
        {activeTab === 'admins' && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6 max-w-2xl">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[#E5B84B] mt-0.5" />
              <div>
                <h2 className="text-base font-semibold text-[#FAFAFA]">
                  {lang === 'ar'
                    ? 'إضافة بريد هبة البسيوني لصلاحيات الأدمن'
                    : 'Grant Admin Access by Google Email'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {lang === 'ar'
                    ? 'أضف البريد الإلكتروني لحساب جوجل الخاص بهبة لتتمكن من الدخول مباشرة وإضافة الصور والفيديوهات بنفسها.'
                    : 'Add Heba’s Gmail address so she can sign in directly and manage sessions & videos.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                dir="ltr"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="heba.elbasyouni@gmail.com"
                className="flex-1 px-4 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-xl cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إضافة أدمن' : 'Add Admin'}</span>
              </button>
            </form>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-mono-tech text-xs text-zinc-200">
                  {BOOTSTRAPPED_ADMIN_EMAIL}
                </span>
                <span className="text-xs text-[#E5B84B]">Primary Owner</span>
              </div>
              {adminEmails.map((adm) => (
                <div
                  key={adm.email}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800"
                >
                  <span className="font-mono-tech text-xs text-zinc-200">{adm.email}</span>
                  <button
                    type="button"
                    onClick={() => void onRemoveAdminEmail(adm.email)}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    {lang === 'ar' ? 'إزالة' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
