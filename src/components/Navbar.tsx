import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import type { Language } from '../types/portfolio';

interface NavbarProps {
  lang: Language;
  brandName: string;
  activeView: 'home' | 'admin';
  onNavigateSection: (sectionId: string) => void;
  onSwitchView: (view: 'home' | 'admin') => void;
}

export function Navbar({
  lang,
  brandName,
  activeView,
  onNavigateSection,
  onSwitchView,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  const navItems =
    lang === 'ar'
      ? [
          { id: 'gallery', label: 'المعرض' },
          { id: 'reels', label: 'الريلز' },
          { id: 'story', label: 'عن هبة' },
          { id: 'admin', label: 'لوحة الأدمن' },
        ]
      : [
          { id: 'gallery', label: 'Gallery' },
          { id: 'reels', label: 'Reels' },
          { id: 'story', label: 'About' },
          { id: 'admin', label: 'Admin' },
        ];

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    if (id === 'admin') {
      onSwitchView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (activeView !== 'home') {
      onSwitchView('home');
      setTimeout(() => onNavigateSection(id), 80);
    } else {
      onNavigateSection(id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSwitchView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-2xl font-semibold tracking-tight text-[#FAFAFA] hover:text-[#E5B84B] transition-colors whitespace-nowrap shrink-0"
        >
          {brandName}
        </a>

        {/* Zone 2: 4 Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          {navItems.map((item) => {
            const isActiveAdmin = item.id === 'admin' && activeView === 'admin';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActiveAdmin
                    ? 'text-[#E5B84B]'
                    : 'hover:text-[#FAFAFA]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-lg hover:bg-[#f0c762] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'ar' ? 'احجز جلستك' : 'Book Session'}
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-zinc-800 text-zinc-200 hover:border-[#E5B84B] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Scroll Progress Hairline */}
      <motion.div
        className="h-[2px] bg-[#E5B84B] origin-left"
        style={{ scaleX }}
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-zinc-800 bg-[#0A0A0C] px-5 py-4 flex flex-col gap-2"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="w-full text-start px-3 py-3 text-sm font-medium text-zinc-200 hover:text-[#E5B84B] rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="mt-2 w-full py-3 text-sm font-semibold bg-[#E5B84B] text-[#050505] rounded-lg cursor-pointer"
            >
              {lang === 'ar' ? 'احجز جلستك الآن' : 'Book Your Session'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
