import { CalendarDays, Globe2, History, Home, LayoutDashboard, LogIn, Menu, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
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

  const changeLanguage = () => {
    const next = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
    localStorage.setItem('anhdao_lang', next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
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
        <button
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          onClick={handleLogout}
          type="button"
        >
          {t('nav.logout')}
        </button>
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
    </header>
  );
};

export default Navbar;

