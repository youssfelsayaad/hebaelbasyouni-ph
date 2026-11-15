import { useState, type FormEvent } from 'react';
import { CheckCircle2, ExternalLink, Instagram, MessageCircle, Phone, Send } from 'lucide-react';
import { motion } from 'motion/react';
import type { Language, StudioProfile } from '../types/portfolio';

interface BookingContactSectionProps {
  lang: Language;
  profile: StudioProfile;
  onSubmitInquiry: (payload: {
    clientName: string;
    clientPhone: string;
    sessionType: string;
    preferredDate: string;
    notes: string;
  }) => Promise<void>;
}

export function BookingContactSection({
  lang,
  profile,
  onSubmitInquiry,
}: BookingContactSectionProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [sessionType, setSessionType] = useState('wedding');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cleanPhoneDigits = profile.studioPhone.replace(/[^\d]/g, '');
  const hasPhone = cleanPhoneDigits.length >= 6;
  const whatsappUrl = hasPhone
    ? `https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(
        lang === 'ar'
          ? `مرحباً هبة، أرغب في حجز جلسة تصوير (${sessionType})`
          : `Hi Heba, I would like to inquire about booking a ${sessionType} session.`
      )}`
    : '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!clientName.trim() || clientPhone.trim().length < 4) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى كتابة الاسم ورقم الهاتف للتواصل.'
          : 'Please enter your name and phone number.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitInquiry({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        sessionType,
        preferredDate: preferredDate.trim(),
        notes: notes.trim(),
      });
      setSubmitted(true);
      setClientName('');
      setClientPhone('');
      setPreferredDate('');
      setNotes('');
    } catch {
      setErrorMsg(
        lang === 'ar'
          ? 'تعذر حفظ الطلب حالياً، يمكنك التواصل مباشرة عبر إنستجرام.'
          : 'Could not save inquiry right now. Please message directly on Instagram.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-[#050505] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Social Channels & Direct Contact */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            <div>
              <p className="text-xs font-mono-tech text-[#E5B84B] mb-2">
                {lang === 'ar' ? 'الحجز والتواصل · Contact' : 'Bookings & Inquiries · Contact'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FAFAFA] text-balance">
                {lang === 'ar'
                  ? 'احجزي جلستك القادمة مع هبة البسيوني'
                  : 'Book Your Next Session With Heba'}
              </h2>
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                {lang === 'ar'
                  ? 'متاح الحجز لجلسات الزفاف، الخطوبة، العرايس، الإيديتوريال، والفيديو ريلز.'
                  : 'Available for weddings, bridal portraits, fashion editorials, and cinema reels.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-[#E5B84B] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-[#E5B84B]" />
                  <div>
                    <p className="text-xs text-zinc-400">
                      {lang === 'ar' ? 'إنستجرام الرسمي' : 'Official Instagram'}
                    </p>
                    <p className="font-mono-tech text-sm font-semibold text-[#FAFAFA] group-hover:text-[#E5B84B] transition-colors">
                      {profile.handle}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-[#E5B84B]" />
              </a>

              {profile.facebookUrl && (
                <a
                  href={profile.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-[#E5B84B] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded bg-zinc-800 text-[#E5B84B] flex items-center justify-center text-xs font-bold">
                      f
                    </span>
                    <div>
                      <p className="text-xs text-zinc-400">
                        {lang === 'ar' ? 'صفحة فيسبوك' : 'Facebook Page'}
                      </p>
                      <p className="text-sm font-semibold text-[#FAFAFA] group-hover:text-[#E5B84B] transition-colors">
                        {lang === 'ar' ? profile.nameAr : profile.nameEn}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-[#E5B84B]" />
                </a>
              )}

              {hasPhone && (
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#E5B84B]" />
                    <div>
                      <p className="text-xs text-zinc-400">
                        {lang === 'ar' ? 'رقم الهاتف وواتساب' : 'Phone & WhatsApp'}
                      </p>
                      <p className="font-mono-tech text-sm font-semibold text-[#FAFAFA]" dir="ltr">
                        {profile.studioPhone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${profile.studioPhone.replace(/[^\d+]/g, '')}`}
                      className="px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      {lang === 'ar' ? 'اتصال' : 'Call'}
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-lg hover:bg-[#f0c762] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 bg-[#0A0A0C] border border-zinc-800 rounded-2xl p-6 sm:p-8"
          >
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#E5B84B] mx-auto" />
                <h3 className="text-xl font-semibold text-[#FAFAFA]">
                  {lang === 'ar' ? 'تم استلام طلب الحجز بنجاح' : 'Booking Request Received'}
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  {lang === 'ar'
                    ? 'تم حفظ بياناتك في نظام الاستوديو وسنتواصل معك قريباً.'
                    : 'Your details are saved and we will reach out shortly.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 text-xs font-medium border border-zinc-700 rounded-lg text-zinc-200 hover:border-[#E5B84B] cursor-pointer"
                  >
                    {lang === 'ar' ? 'إرسال طلب آخر' : 'Send Another'}
                  </button>
                  {hasPhone && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-[#E5B84B] text-[#050505] rounded-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'متابعة على واتساب' : 'Continue on WhatsApp'}</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: سارة أحمد' : 'e.g. Sara Ahmed'}
                      className="w-full px-4 py-3 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#E5B84B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={40}
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+20 10..."
                      dir="ltr"
                      className="w-full px-4 py-3 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#E5B84B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'نوع الجلسة' : 'Session Type'}
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#E5B84B]"
                    >
                      <option value="wedding">{lang === 'ar' ? 'زفاف / كتب كتاب + ريل' : 'Wedding & Cinema Reel'}</option>
                      <option value="engagement">{lang === 'ar' ? 'جلسة خطوبة' : 'Engagement Session'}</option>
                      <option value="bridal">{lang === 'ar' ? 'بورتريه عروس' : 'Bridal Portrait'}</option>
                      <option value="editorial">{lang === 'ar' ? 'أزياء وإيديتوريال' : 'Fashion & Editorial'}</option>
                      <option value="family">{lang === 'ar' ? 'عائلي / أمومة' : 'Family & Maternity'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {lang === 'ar' ? 'التاريخ المفضل' : 'Preferred Date'}
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#E5B84B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {lang === 'ar' ? 'تفاصيل المكان أو الفكرة' : 'Location & Vision Notes'}
                  </label>
                  <textarea
                    rows={3}
                    maxLength={800}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'اكتبي تفاصيل المكان أو الباقة المطلوبة (صور + فيديو ريل)...'
                        : 'Share your venue, timing, or whether you want photos + cinema reel...'
                    }
                    className="w-full px-4 py-3 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#E5B84B]"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#E5B84B] text-[#050505] rounded-xl hover:bg-[#f0c762] disabled:opacity-60 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {submitting
                        ? lang === 'ar'
                          ? 'جاري الإرسال...'
                          : 'Sending...'
                        : lang === 'ar'
                          ? 'تأكيد طلب الحجز'
                          : 'Submit Booking Request'}
                    </span>
                  </button>

                  {hasPhone && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-xl hover:border-[#E5B84B] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#E5B84B]" />
                      <span>{lang === 'ar' ? 'حجز فوري واتساب' : 'Direct WhatsApp'}</span>
                    </a>
                  )}
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
