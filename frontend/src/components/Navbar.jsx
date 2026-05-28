import { Bell, CalendarDays, Globe2, History, Home, LayoutDashboard, LogIn, Menu, Star, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-anhdao-blue text-anhdao-ink' : 'text-slate-700 hover:bg-white hover:text-black'
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [reviewNotification, setReviewNotification] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user || isAdmin) {
        setNotifications([]);
        return;
      }

      try {
        const data = await apiFetch('/notifications/my');
        setNotifications(data.notifications);
      } catch (_error) {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [user, isAdmin]);

  const changeLanguage = () => {
    const next = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
    localStorage.setItem('anhdao_lang', next);
  };

  const handleLogout = () => {
    logout();
    setNotifications([]);
    navigate('/');
    setOpen(false);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewNotification) return;

    try {
      setReviewLoading(true);
      setReviewError('');
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: reviewNotification.bookingId?._id || reviewNotification.bookingId,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment
        })
      });
      setNotifications((current) => current.filter((item) => item._id !== reviewNotification._id));
      setReviewNotification(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const links = (
    <>
      <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>
        <Home size={17} />
        {t('nav.home')}
      </NavLink>
      <NavLink to="/booking" className={navLinkClass} onClick={() => setOpen(false)}>
        <CalendarDays size={17} />
        {t('nav.booking')}
      </NavLink>
      {user && (
        <NavLink to="/history" className={navLinkClass} onClick={() => setOpen(false)}>
          <History size={17} />
          {t('nav.history')}
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}>
          <LayoutDashboard size={17} />
          {t('nav.admin')}
        </NavLink>
      )}
    </>
  );

  const actions = (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <button
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-anhdao-blue"
        onClick={changeLanguage}
        type="button"
      >
        <Globe2 size={17} />
        {i18n.language === 'vi' ? 'EN' : 'VI'}
      </button>
      {user ? (
        <>
          {!isAdmin && (
            <div className="relative">
              <button
                className="relative grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-800 hover:bg-anhdao-blue"
                onClick={() => setNotificationsOpen((value) => !value)}
                type="button"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <p className="mb-2 text-sm font-semibold text-black">{t('notification.title')}</p>
                  {notifications.length ? (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <button
                          className="w-full rounded-md border border-slate-200 p-3 text-left text-sm leading-6 hover:bg-anhdao-blue"
                          key={notification._id}
                          onClick={() => {
                            setReviewNotification(notification);
                            setNotificationsOpen(false);
                          }}
                          type="button"
                        >
                          {notification.message}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">{t('notification.empty')}</p>
                  )}
                </div>
              )}
            </div>
          )}
          <button
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={handleLogout}
            type="button"
          >
            {t('nav.logout')}
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-2 md:flex-row">
          <NavLink className={navLinkClass} to="/login" onClick={() => setOpen(false)}>
            <LogIn size={17} />
            {t('nav.login')}
          </NavLink>
          <NavLink className={navLinkClass} to="/register" onClick={() => setOpen(false)}>
            <UserPlus size={17} />
            {t('nav.register')}
          </NavLink>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4 py-3">
        <NavLink className="flex items-center gap-3 font-semibold text-black" to="/">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-anhdao-blue text-lg font-bold">AĐ</span>
          <span className="leading-tight">{t('brand')}</span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        <div className="hidden md:block">{actions}</div>

        <button
          aria-label="Toggle navigation"
          className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="page-shell flex flex-col gap-2 py-4">
            {links}
            {actions}
          </div>
        </div>
      )}

      {reviewNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl" onSubmit={submitReview}>
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-semibold text-black">{t('notification.reviewTitle')}</h2>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={() => setReviewNotification(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{reviewNotification.message}</p>
            <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
              {t('notification.rating')}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    className={`grid h-10 w-10 place-items-center rounded-md border ${
                      Number(reviewForm.rating) >= rating
                        ? 'border-yellow-300 bg-yellow-100 text-yellow-700'
                        : 'border-slate-200 text-slate-400'
                    }`}
                    key={rating}
                    onClick={() => setReviewForm((current) => ({ ...current, rating }))}
                    type="button"
                  >
                    <Star size={18} fill="currentColor" />
                  </button>
                ))}
              </div>
            </label>
            <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
              {t('notification.comment')}
              <textarea
                className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                value={reviewForm.comment}
              />
            </label>
            {reviewError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{reviewError}</p>}
            <button
              className="mt-4 w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
              disabled={reviewLoading}
              type="submit"
            >
              {reviewLoading ? '...' : t('notification.submit')}
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Navbar;
