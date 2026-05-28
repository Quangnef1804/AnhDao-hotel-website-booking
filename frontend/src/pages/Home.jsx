import { ArrowRight, Clock, Hotel, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Home = () => {
  const { t } = useTranslation();
  const roomCards = [
    {
      title: t('home.singleCardTitle'),
      description: t('home.singleCardDesc'),
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: t('home.familyCardTitle'),
      description: t('home.familyCardDesc'),
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: t('home.vipCardTitle'),
      description: t('home.vipCardDesc'),
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80'
    }
  ];

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

      <section className="bg-slate-50 py-20">
        <div className="page-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-600">{t('brand')}</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">{t('home.roomCardsTitle')}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{t('home.roomCardsSubtitle')}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roomCards.map((room) => (
              <article
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl"
                key={room.title}
              >
                <div className="aspect-[4/3] overflow-hidden bg-anhdao-blue">
                  <img
                    alt={room.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    src={room.image}
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold text-slate-950">{room.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{room.description}</p>
                  <Link
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                    to="/booking"
                  >
                    {t('home.bookRoomNow')}
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
