import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingContactSection } from './components/BookingContactSection';
import { CinemaShowcaseBand } from './components/CinemaShowcaseBand';
import { HeroSection } from './components/HeroSection';
import { InteractiveDeckSection } from './components/InteractiveDeckSection';
import { MarqueeRibbon } from './components/MarqueeRibbon';
import { Navbar } from './components/Navbar';
import { PortfolioGallery } from './components/PortfolioGallery';
import { SeoHelmet } from './components/SeoHelmet';
import { SessionLightbox } from './components/SessionLightbox';
import { usePortfolioStore } from './hooks/usePortfolioStore';
import { compressImageToDataUrl } from './lib/firebase';
import type { Language, MediaType, PortfolioSession } from './types/portfolio';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeView, setActiveView] = useState<'home' | 'admin'>(() =>
    window.location.hash === '#admin' ? 'admin' : 'home'
  );
  const [mediaFilter, setMediaFilter] = useState<'all' | MediaType>('all');
  const [selectedSession, setSelectedSession] = useState<PortfolioSession | null>(null);
  const [showOpeningShutter, setShowOpeningShutter] = useState(true);

  const store = usePortfolioStore();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowOpeningShutter(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveView('admin');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const videoReels = useMemo(
    () => store.sessions.filter((s) => s.mediaType === 'video'),
    [store.sessions]
  );

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSwitchView = (view: 'home' | 'admin') => {
    setActiveView(view);
    if (view === 'admin') {
      window.history.replaceState(null, '', '#admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.replaceState(null, '', '#top');
    }
  };

  const handleQuickUploadHero = async (file: File) => {
    const dataUrl = await compressImageToDataUrl(file, 1400, 0.84);
    await store.saveStudioProfile({
      ...store.profile,
      heroImageUrl: dataUrl,
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex flex-col">
      <SeoHelmet
        lang={lang}
        activeView={activeView}
        mediaFilter={mediaFilter}
        profile={store.profile}
        selectedSession={selectedSession}
        sessions={store.sessions}
      />
      <AnimatePresence>
        {showOpeningShutter && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
            onClick={() => setShowOpeningShutter(false)}
            className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="font-display text-3xl sm:text-5xl font-semibold text-[#FAFAFA] tracking-tight"
            >
              {lang === 'ar' ? store.profile.nameAr : store.profile.nameEn}
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-32 h-[1px] bg-[#E5B84B] mt-3 origin-center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar
        lang={lang}
        brandName={lang === 'ar' ? store.profile.nameAr : store.profile.nameEn}
        activeView={activeView}
        onNavigateSection={handleNavigateSection}
        onSwitchView={handleSwitchView}
      />

      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminDashboard
            lang={lang}
            user={store.user}
            authReady={store.authReady}
            isAdmin={store.isAdmin}
            sessions={store.sessions}
            hasFirestoreSessions={store.hasFirestoreSessions}
            profile={store.profile}
            inquiries={store.inquiries}
            adminEmails={store.adminEmails}
            balanceStats={store.balanceStats}
            syncing={store.syncing}
            onBackToSite={() => handleSwitchView('home')}
            onBulkImportInstagram={store.bulkImportInstagramInput}
            onClearAllSessions={store.clearAllSessions}
            onSaveSession={store.saveSession}
            onDeleteSession={store.deleteSession}
            onSaveProfile={store.saveStudioProfile}
            onUpdateInquiryStatus={store.updateInquiryStatus}
            onDeleteInquiry={store.deleteInquiry}
            onAddAdminEmail={store.addAdminEmail}
            onRemoveAdminEmail={store.removeAdminEmail}
          />
        ) : (
          <>
            <HeroSection
              lang={lang}
              onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
              profile={store.profile}
              balanceStats={store.balanceStats}
              isAdmin={store.isAdmin}
              onQuickUploadHero={handleQuickUploadHero}
              onOpenAdmin={() => handleSwitchView('admin')}
              onExploreGallery={() => {
                setMediaFilter('all');
                handleNavigateSection('gallery');
              }}
              onExploreReels={() => {
                setMediaFilter('video');
                handleNavigateSection('reels');
              }}
            />

            <MarqueeRibbon lang={lang} handle={store.profile.handle} />

            <CinemaShowcaseBand
              lang={lang}
              reels={videoReels}
              instagramUrl={store.profile.instagramUrl}
              facebookUrl={store.profile.facebookUrl}
              onSelectSession={setSelectedSession}
              onViewAllReels={() => {
                setMediaFilter('video');
                handleNavigateSection('gallery');
              }}
              onOpenAdmin={() => handleSwitchView('admin')}
            />

            <PortfolioGallery
              lang={lang}
              sessions={store.sessions}
              instagramUrl={store.profile.instagramUrl}
              facebookUrl={store.profile.facebookUrl}
              mediaFilter={mediaFilter}
              onChangeMediaFilter={setMediaFilter}
              onSelectSession={setSelectedSession}
              onOpenAdmin={() => handleSwitchView('admin')}
            />

            <InteractiveDeckSection
              lang={lang}
              sessions={store.sessions}
              instagramUrl={store.profile.instagramUrl}
              onSelectSession={setSelectedSession}
            />

            <BookingContactSection
              lang={lang}
              profile={store.profile}
              onSubmitInquiry={store.submitBookingInquiry}
            />
          </>
        )}
      </main>

      <footer className="border-t border-zinc-800/80 bg-[#050505] py-8 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="font-display text-base text-zinc-200">
              {lang === 'ar' ? store.profile.nameAr : store.profile.nameEn}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tech">{store.profile.handle}</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={store.profile.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E5B84B] transition-colors"
            >
              Instagram
            </a>
            {store.profile.facebookUrl && (
              <a
                href={store.profile.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E5B84B] transition-colors"
              >
                Facebook
              </a>
            )}
            <button
              type="button"
              onClick={() => handleSwitchView('admin')}
              className="hover:text-[#E5B84B] transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'لوحة الأدمن' : 'Studio Admin'}
            </button>
          </div>
        </div>
      </footer>

      <SessionLightbox
        lang={lang}
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}
