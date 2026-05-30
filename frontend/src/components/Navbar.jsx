import {
  Bell,
  CalendarDays,
  Camera,
  Globe2,
  History,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Star,
  UserPlus,
  UserRound,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { mediaUrl } from '../api/media.js';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-anhdao-blue text-anhdao-ink' : 'text-slate-700 hover:bg-white hover:text-black'
  }`;

const CROP_SIZE = 240;
const AVATAR_OUTPUT_SIZE = 512;

const Avatar = ({ user, size = 'sm' }) => {
  const avatarSize = size === 'lg' ? 'h-16 w-16' : 'h-10 w-10';
  const iconSize = size === 'lg' ? 34 : 22;
  const avatarUrl = mediaUrl(user?.avatar);
  const isFemale = user?.gender === 'female';

  if (avatarUrl) {
    return (
      <img
        alt={user?.nickname || 'User avatar'}
        className={`${avatarSize} rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200`}
        src={avatarUrl}
      />
    );
  }

  return (
    <span
      className={`${avatarSize} grid place-items-center rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 ${
        isFemale ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-700'
      }`}
    >
      <UserRound size={iconSize} strokeWidth={2.2} />
    </span>
  );
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const createCroppedAvatarBlob = async ({ url, naturalWidth, naturalHeight, zoom, offset }) => {
  const image = await loadImage(url);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const baseScale = Math.max(CROP_SIZE / naturalWidth, CROP_SIZE / naturalHeight);
  const drawWidth = naturalWidth * baseScale * zoom;
  const drawHeight = naturalHeight * baseScale * zoom;
  const ratio = AVATAR_OUTPUT_SIZE / CROP_SIZE;
  const centerX = CROP_SIZE / 2 + offset.x;
  const centerY = CROP_SIZE / 2 + offset.y;

  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  context.clearRect(0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
  context.save();
  context.beginPath();
  context.arc(AVATAR_OUTPUT_SIZE / 2, AVATAR_OUTPUT_SIZE / 2, AVATAR_OUTPUT_SIZE / 2, 0, Math.PI * 2);
  context.clip();
  context.drawImage(
    image,
    (centerX - drawWidth / 2) * ratio,
    (centerY - drawHeight / 2) * ratio,
    drawWidth * ratio,
    drawHeight * ratio
  );
  context.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Could not crop avatar'));
    }, 'image/png');
  });
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, isAdmin, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [avatarEditor, setAvatarEditor] = useState(null);
  const [avatarDrag, setAvatarDrag] = useState(null);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSaving, setAvatarSaving] = useState(false);
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

  useEffect(() => {
    if (!user) {
      setAccountOpen(false);
      setNotificationsOpen(false);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarEditor?.url) URL.revokeObjectURL(avatarEditor.url);
    };
  }, [avatarEditor?.url]);

  const changeLanguage = () => {
    const next = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
    localStorage.setItem('anhdao_lang', next);
  };

  const handleLogout = () => {
    logout();
    setNotifications([]);
    setAccountOpen(false);
    setNotificationsOpen(false);
    navigate('/');
    setOpen(false);
  };

  const closeMenus = () => {
    setOpen(false);
    setAccountOpen(false);
    setNotificationsOpen(false);
  };

  const closeAvatarEditor = () => {
    if (avatarEditor?.url) URL.revokeObjectURL(avatarEditor.url);
    setAvatarEditor(null);
    setAvatarDrag(null);
    setAvatarError('');
    setAvatarSaving(false);
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Only image files are allowed');
      return;
    }

    if (avatarEditor?.url) URL.revokeObjectURL(avatarEditor.url);

    setAvatarEditor({
      file,
      url: URL.createObjectURL(file),
      naturalWidth: 0,
      naturalHeight: 0,
      zoom: 1,
      offset: { x: 0, y: 0 }
    });
    setAvatarError('');
    setAvatarDrag(null);
  };

  const updateAvatarEditor = (nextValues) => {
    setAvatarEditor((current) => (current ? { ...current, ...nextValues } : current));
  };

  const handleAvatarPointerDown = (event) => {
    if (!avatarEditor) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setAvatarDrag({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: avatarEditor.offset
    });
  };

  const handleAvatarPointerMove = (event) => {
    if (!avatarDrag || avatarDrag.pointerId !== event.pointerId) return;

    setAvatarEditor((current) =>
      current
        ? {
            ...current,
            offset: {
              x: avatarDrag.startOffset.x + event.clientX - avatarDrag.startX,
              y: avatarDrag.startOffset.y + event.clientY - avatarDrag.startY
            }
          }
        : current
    );
  };

  const handleAvatarPointerUp = (event) => {
    if (avatarDrag?.pointerId === event.pointerId) {
      setAvatarDrag(null);
    }
  };

  const saveAvatar = async () => {
    if (!avatarEditor?.naturalWidth || !avatarEditor?.naturalHeight) return;

    try {
      setAvatarSaving(true);
      setAvatarError('');
      const blob = await createCroppedAvatarBlob(avatarEditor);
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.png');
      const data = await apiFetch('/auth/avatar', {
        method: 'PATCH',
        body: formData
      });
      updateUser(data.user);
      closeAvatarEditor();
    } catch (error) {
      setAvatarError(error.message);
      setAvatarSaving(false);
    }
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
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setAccountOpen(false);
                }}
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
          <div className="relative">
            <button
              aria-expanded={accountOpen}
              aria-label="User menu"
              className="flex items-center justify-center rounded-full transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
              onClick={() => {
                setAccountOpen((value) => !value);
                setNotificationsOpen(false);
              }}
              type="button"
            >
              <Avatar user={user} />
            </button>

            <div
              className={`absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition duration-200 ease-out ${
                accountOpen
                  ? 'visible translate-y-0 opacity-100'
                  : 'invisible -translate-y-2 opacity-0 pointer-events-none'
              }`}
            >
              <div className="bg-gradient-to-br from-sky-50 to-white px-5 py-5">
                <div className="flex items-center gap-4">
                  <button
                    className="relative flex-none rounded-full focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                    onClick={() => avatarInputRef.current?.click()}
                    title={t('auth.changeAvatar')}
                    type="button"
                  >
                    <Avatar user={user} size="lg" />
                    <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-950 text-white shadow-sm transition hover:bg-sky-600">
                      <Camera size={14} />
                    </span>
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-950">{user.nickname}</p>
                    <p className="truncate text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="p-2">
                <NavLink
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-800"
                  onClick={closeMenus}
                  to="/booking"
                >
                  <CalendarDays size={17} />
                  {t('nav.booking')}
                </NavLink>
                <NavLink
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-800"
                  onClick={closeMenus}
                  to="/history"
                >
                  <History size={17} />
                  {t('nav.history')}
                </NavLink>
                <button
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut size={17} />
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          </div>
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

  const avatarBaseScale = avatarEditor?.naturalWidth
    ? Math.max(CROP_SIZE / avatarEditor.naturalWidth, CROP_SIZE / avatarEditor.naturalHeight)
    : 1;
  const avatarPreviewWidth = avatarEditor?.naturalWidth ? avatarEditor.naturalWidth * avatarBaseScale : CROP_SIZE;
  const avatarPreviewHeight = avatarEditor?.naturalHeight ? avatarEditor.naturalHeight * avatarBaseScale : CROP_SIZE;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4 py-3">
        <NavLink className="flex items-center gap-3 font-semibold text-black" to="/">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-anhdao-blue text-lg font-bold">AĐ</span>
          <span className="leading-tight">{t('brand')}</span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        <div className="hidden md:block">{actions}</div>

        <input
          accept="image/*"
          className="sr-only"
          onChange={handleAvatarFileChange}
          ref={avatarInputRef}
          type="file"
        />

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

      {avatarEditor && (
        <div className="fixed inset-0 z-[90] grid h-[100dvh] place-items-center overflow-y-auto bg-black/55 px-4 py-6 sm:p-6">
          <section className="my-auto max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{t('auth.avatarTitle')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('auth.avatarHint')}</p>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={closeAvatarEditor}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-6">
              <div
                className={`relative mx-auto h-[240px] w-[240px] touch-none overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-inner ring-1 ring-slate-200 ${
                  avatarDrag ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onPointerDown={handleAvatarPointerDown}
                onPointerMove={handleAvatarPointerMove}
                onPointerUp={handleAvatarPointerUp}
                onPointerCancel={handleAvatarPointerUp}
              >
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    height: avatarPreviewHeight,
                    transform: `translate(-50%, -50%) translate(${avatarEditor.offset.x}px, ${avatarEditor.offset.y}px) scale(${avatarEditor.zoom})`,
                    width: avatarPreviewWidth
                  }}
                >
                  <img
                    alt="Avatar preview"
                    className="h-full w-full select-none object-fill"
                    draggable="false"
                    onLoad={(event) =>
                      updateAvatarEditor({
                        naturalWidth: event.currentTarget.naturalWidth,
                        naturalHeight: event.currentTarget.naturalHeight
                      })
                    }
                    src={avatarEditor.url}
                  />
                </div>
              </div>

              <label className="mt-6 block space-y-3 text-sm font-medium text-slate-700">
                {t('auth.zoom')}
                <input
                  className="w-full accent-sky-500"
                  max="3"
                  min="1"
                  onChange={(event) => updateAvatarEditor({ zoom: Number(event.target.value) })}
                  step="0.01"
                  type="range"
                  value={avatarEditor.zoom}
                />
              </label>

              {avatarError && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{avatarError}</p>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-200 pt-4">
              <button
                className="flex-1 rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                onClick={closeAvatarEditor}
                type="button"
              >
                {t('common.cancel')}
              </button>
              <button
                className="flex-1 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={avatarSaving || !avatarEditor.naturalWidth}
                onClick={saveAvatar}
                type="button"
              >
                {avatarSaving ? '...' : t('common.save')}
              </button>
            </div>
          </section>
        </div>
      )}

      {reviewNotification && (
        <div className="fixed inset-0 z-[80] grid h-[100dvh] place-items-center overflow-y-auto bg-black/50 px-4 py-6 sm:p-6">
          <form className="my-auto max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-xl" onSubmit={submitReview}>
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
