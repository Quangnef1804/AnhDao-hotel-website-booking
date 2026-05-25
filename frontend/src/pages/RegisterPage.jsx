import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nickname: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register(form);
      navigate('/booking');
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12">
      <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-sky-600">{t('brand')}</p>
          <h1 className="mt-2 text-3xl font-bold text-black">{t('auth.registerTitle')}</h1>
          <p className="mt-4 leading-7 text-slate-600">{t('home.intro')}</p>
        </div>
        <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              {t('auth.nickname')}
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                name="nickname"
                onChange={handleChange}
                required
                value={form.nickname}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              {t('auth.phone')}
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                name="phone"
                onChange={handleChange}
                required
                value={form.phone}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              {t('auth.email')}
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                name="email"
                onChange={handleChange}
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              {t('auth.password')}
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                name="password"
                onChange={handleChange}
                required
                type="password"
                value={form.password}
              />
            </label>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
            <button
              className="rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400 sm:col-span-2"
              disabled={loading}
              type="submit"
            >
              {loading ? '...' : t('auth.registerButton')}
            </button>
            <Link className="text-center text-sm font-medium text-sky-700 hover:text-black sm:col-span-2" to="/login">
              {t('nav.login')}
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RegisterPage;

