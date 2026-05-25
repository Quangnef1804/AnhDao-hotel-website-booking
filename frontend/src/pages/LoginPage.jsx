import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      navigate(location.state?.from || '/booking');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12">
      <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-sky-600">{t('brand')}</p>
          <h1 className="mt-2 text-3xl font-bold text-black">{t('auth.loginTitle')}</h1>
          <p className="mt-4 leading-7 text-slate-600">{t('home.subhead')}</p>
        </div>
        <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
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
            <label className="block space-y-2 text-sm font-medium text-slate-700">
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
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button
              className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
              disabled={loading}
              type="submit"
            >
              {loading ? '...' : t('auth.loginButton')}
            </button>
            <Link className="block text-center text-sm font-medium text-sky-700 hover:text-black" to="/register">
              {t('nav.register')}
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;

