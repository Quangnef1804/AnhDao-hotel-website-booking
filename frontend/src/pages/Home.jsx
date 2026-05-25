import { ArrowRight, Clock, Hotel, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Home = () => {
  const { t } = useTranslation();

  return (
    <>
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
        <img
          alt="Anh Dao hotel lobby"
          className="absolute inset-0 h-full w-full object-cover opacity-65"
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="page-shell relative flex min-h-[calc(100vh-64px)] flex-col justify-center py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl">{t('home.headline')}</h1>
            <p className="mt-5 text-lg leading-8 text-white/90">{t('home.subhead')}</p>
            <Link
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-anhdao-blue px-5 py-3 font-semibold text-black hover:bg-white"
              to="/booking"
            >
              {t('home.cta')}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="page-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-black">{t('home.introTitle')}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{t('home.intro')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Hotel className="text-sky-500" size={28} />
              <div>
                <p className="text-2xl font-bold text-black">36+</p>
                <p className="text-sm text-slate-600">{t('home.rooms')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Clock className="text-sky-500" size={28} />
              <div>
                <p className="text-2xl font-bold text-black">24/7</p>
                <p className="text-sm text-slate-600">{t('home.service')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Users className="text-sky-500" size={28} />
              <div>
                <p className="text-2xl font-bold text-black">2K+</p>
                <p className="text-sm text-slate-600">{t('home.guests')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

