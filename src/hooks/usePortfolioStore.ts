import { useEffect, useMemo, useState } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { parseSocialEmbedUrl } from '../lib/instagram';
import {
  DEFAULT_STUDIO_PROFILE,
  INITIAL_PORTFOLIO_SESSIONS,
} from '../data/seedPortfolio';
import type {
  AdminUserRecord,
  BookingInquiry,
  InquiryStatus,
  MediaType,
  PortfolioSession,
  SessionCategory,
  StudioProfile,
} from '../types/portfolio';

export function usePortfolioStore() {
  const [sessions, setSessions] = useState<PortfolioSession[]>(INITIAL_PORTFOLIO_SESSIONS);
  const [hasFirestoreSessions, setHasFirestoreSessions] = useState(false);
  const [profile, setProfile] = useState<StudioProfile>(DEFAULT_STUDIO_PROFILE);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inquiries, setInquiries] = useState<BookingInquiry[]>([]);
  const [adminEmails, setAdminEmails] = useState<AdminUserRecord[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Track auth state, token refreshes (e.g. emailVerified), and admin status
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser || !currentUser.emailVerified || !currentUser.email) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      if (currentUser.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      try {
        const emailDoc = await getDoc(
          doc(db, 'adminEmails', currentUser.email.toLowerCase())
        );
        setIsAdmin(emailDoc.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // Public subscription: portfolio sessions
  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('orderIndex', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: PortfolioSession[] = snapshot.docs.map((d) => {
            const data = d.data() as PortfolioSession;
            return { ...data, id: d.id };
          });
          setSessions(list);
          setHasFirestoreSessions(true);
        } else {
          setSessions(INITIAL_PORTFOLIO_SESSIONS);
          setHasFirestoreSessions(false);
        }
      },
      (error) => {
        console.warn('Sessions listener status:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // Public subscription: studio profile
  useEffect(() => {
    const profileRef = doc(db, 'siteSettings', 'profile');
    const unsub = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StudioProfile;
          setProfile({
            ...DEFAULT_STUDIO_PROFILE,
            ...data,
          });
        }
      },
      (error) => {
        console.warn('Profile listener status:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // Admin-only subscriptions: booking inquiries & admin email allowlist
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setInquiries([]);
      setAdminEmails([]);
      return;
    }

    const inquiriesQuery = query(
      collection(db, 'bookingInquiries'),
      orderBy('createdAt', 'desc')
    );
    const unsubInquiries = onSnapshot(
      inquiriesQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({
          ...(d.data() as Omit<BookingInquiry, 'id'>),
          id: d.id,
        }));
        setInquiries(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'bookingInquiries')
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'adminEmails'),
      (snapshot) => {
        const rows = snapshot.docs.map((d) => d.data() as AdminUserRecord);
        setAdminEmails(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'adminEmails')
    );

    return () => {
      unsubInquiries();
      unsubAdmins();
    };
  }, [authReady, isAdmin]);

  const balanceStats = useMemo(() => {
    const photos = sessions.filter((s) => s.mediaType === 'photo').length;
    const videos = sessions.filter((s) => s.mediaType === 'video').length;
    const total = sessions.length;
    const photoPct = total > 0 ? Math.round((photos / total) * 100) : 50;
    const videoPct = total > 0 ? 100 - photoPct : 50;
    return { photos, videos, total, photoPct, videoPct };
  }, [sessions]);

  async function bulkImportInstagramInput(
    rawInput: string,
    defaultCategory: SessionCategory = 'weddings'
  ) {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    const lines = Array.from(
      new Set(
        rawInput
          .split(/\s+/)
          .map((l) => l.trim())
          .filter(Boolean)
      )
    );
    const parsedItems = lines
      .map((line) => parseSocialEmbedUrl(line))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 30);

    if (parsedItems.length === 0) return 0;

    setSyncing(true);
    try {
      const batch = writeBatch(db);
      if (!hasFirestoreSessions) {
        INITIAL_PORTFOLIO_SESSIONS.forEach((seed) => {
          const seedRef = doc(db, 'sessions', seed.id);
          batch.set(seedRef, {
            ...seed,
            galleryImages: seed.galleryImages.slice(0, 10),
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
      }
      const startIndex = sessions.length + 1;

      parsedItems.forEach((item, idx) => {
        const isVideo =
          item.platform === 'facebook-video' || item.canonicalUrl.includes('/reel/');
        const mediaType: MediaType = isVideo ? 'video' : 'photo';
        const id = `social-${Date.now()}-${idx}`;
        const ref = doc(db, 'sessions', id);

        batch.set(ref, {
          id,
          titleAr: isVideo
            ? `فيديو / ريل #${startIndex + idx}`
            : `سيشن تصوير #${startIndex + idx}`,
          titleEn: isVideo
            ? `Video Reel #${startIndex + idx}`
            : `Photo Session #${startIndex + idx}`,
          mediaType,
          category: isVideo ? 'reels' : defaultCategory,
          coverImage: '',
          galleryImages: [],
          videoUrl: isVideo ? item.canonicalUrl : '',
          duration: isVideo ? 'Reel' : '',
          locationAr:
            item.platform.startsWith('facebook')
              ? 'فيسبوك · هبة البسيوني'
              : 'إنستجرام @hebaelbasyouni1',
          locationEn:
            item.platform.startsWith('facebook')
              ? 'Facebook · Heba El-Basyouni'
              : 'Instagram @hebaelbasyouni1',
          sessionDate: new Date().toISOString().slice(0, 7),
          storyAr: 'عمل منشور على حساب هبة البسيوني الرسمي.',
          storyEn: 'Published work from Heba El-Basyouni’s official social profile.',
          cameraSpecs: '@hebaelbasyouni1',
          instagramPostUrl: item.canonicalUrl,
          aspectRatio: isVideo ? 'portrait' : 'landscape',
          featured: idx < 2,
          orderIndex: startIndex + idx,
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      return parsedItems.length;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'sessions');
    } finally {
      setSyncing(false);
    }
  }

  async function clearAllSessions() {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    setSyncing(true);
    try {
      const snap = await getDocs(collection(db, 'sessions'));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'sessions');
    } finally {
      setSyncing(false);
    }
  }

  async function saveSession(
    sessionData: Omit<PortfolioSession, 'authorUid' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    const cleanId = sessionData.id.replace(/[^a-zA-Z0-9_-]/g, '-');
    const docRef = doc(db, 'sessions', cleanId);

    try {
      if (!hasFirestoreSessions) {
        const batch = writeBatch(db);
        INITIAL_PORTFOLIO_SESSIONS.forEach((seed) => {
          const item = seed.id === cleanId ? { ...sessionData, id: cleanId } : seed;
          batch.set(doc(db, 'sessions', seed.id), {
            ...item,
            galleryImages: item.galleryImages.slice(0, 10),
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        if (isNew || !INITIAL_PORTFOLIO_SESSIONS.some((s) => s.id === cleanId)) {
          batch.set(docRef, {
            ...sessionData,
            id: cleanId,
            galleryImages: sessionData.galleryImages.slice(0, 10),
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      } else if (isNew) {
        await setDoc(docRef, {
          ...sessionData,
          id: cleanId,
          galleryImages: sessionData.galleryImages.slice(0, 10),
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(docRef, {
          titleAr: sessionData.titleAr,
          titleEn: sessionData.titleEn,
          mediaType: sessionData.mediaType,
          category: sessionData.category,
          coverImage: sessionData.coverImage,
          galleryImages: sessionData.galleryImages.slice(0, 10),
          videoUrl: sessionData.videoUrl,
          duration: sessionData.duration,
          locationAr: sessionData.locationAr,
          locationEn: sessionData.locationEn,
          sessionDate: sessionData.sessionDate,
          storyAr: sessionData.storyAr,
          storyEn: sessionData.storyEn,
          cameraSpecs: sessionData.cameraSpecs,
          instagramPostUrl: sessionData.instagramPostUrl,
          aspectRatio: sessionData.aspectRatio,
          featured: sessionData.featured,
          orderIndex: sessionData.orderIndex,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        isNew ? OperationType.CREATE : OperationType.UPDATE,
        `sessions/${cleanId}`
      );
    }
  }

  async function deleteSession(sessionId: string) {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    try {
      if (!hasFirestoreSessions) {
        const batch = writeBatch(db);
        INITIAL_PORTFOLIO_SESSIONS.filter((s) => s.id !== sessionId).forEach((seed) => {
          batch.set(doc(db, 'sessions', seed.id), {
            ...seed,
            galleryImages: seed.galleryImages.slice(0, 10),
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      } else {
        await deleteDoc(doc(db, 'sessions', sessionId));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sessions/${sessionId}`);
    }
  }

  async function saveStudioProfile(updated: StudioProfile) {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    const profileRef = doc(db, 'siteSettings', 'profile');
    try {
      await setDoc(profileRef, {
        nameAr: updated.nameAr,
        nameEn: updated.nameEn,
        handle: updated.handle,
        taglineAr: updated.taglineAr,
        taglineEn: updated.taglineEn,
        bioAr: updated.bioAr,
        bioEn: updated.bioEn,
        studioPhone: updated.studioPhone,
        instagramUrl: updated.instagramUrl,
        facebookUrl: updated.facebookUrl,
        studioCityAr: updated.studioCityAr,
        studioCityEn: updated.studioCityEn,
        heroImageUrl: updated.heroImageUrl,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'siteSettings/profile');
    }
  }

  async function submitBookingInquiry(payload: {
    clientName: string;
    clientPhone: string;
    sessionType: string;
    preferredDate: string;
    notes: string;
  }) {
    const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      await setDoc(doc(db, 'bookingInquiries', id), {
        clientName: payload.clientName.slice(0, 100),
        clientPhone: payload.clientPhone.slice(0, 40),
        sessionType: payload.sessionType.slice(0, 60),
        preferredDate: payload.preferredDate.slice(0, 40),
        notes: payload.notes.slice(0, 800),
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `bookingInquiries/${id}`);
    }
  }

  async function updateInquiryStatus(inquiryId: string, status: InquiryStatus) {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    try {
      await updateDoc(doc(db, 'bookingInquiries', inquiryId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookingInquiries/${inquiryId}`);
    }
  }

  async function deleteInquiry(inquiryId: string) {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    try {
      await deleteDoc(doc(db, 'bookingInquiries', inquiryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bookingInquiries/${inquiryId}`);
    }
  }

  async function addAdminEmail(email: string) {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    const cleanEmail = email.trim().toLowerCase();
    try {
      await setDoc(doc(db, 'adminEmails', cleanEmail), {
        email: cleanEmail,
        addedBy: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `adminEmails/${cleanEmail}`);
    }
  }

  async function removeAdminEmail(email: string) {
    if (!user || !isAdmin) throw new Error('Admin authentication required');
    const cleanEmail = email.trim().toLowerCase();
    try {
      await deleteDoc(doc(db, 'adminEmails', cleanEmail));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `adminEmails/${cleanEmail}`);
    }
  }

  return {
    sessions,
    hasFirestoreSessions,
    profile,
    user,
    authReady,
    isAdmin,
    inquiries,
    adminEmails,
    balanceStats,
    syncing,
    bulkImportInstagramInput,
    clearAllSessions,
    saveSession,
    deleteSession,
    saveStudioProfile,
    submitBookingInquiry,
    updateInquiryStatus,
    deleteInquiry,
    addAdminEmail,
    removeAdminEmail,
  };
}
