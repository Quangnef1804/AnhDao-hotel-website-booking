import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../api/client.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const formatDate = (value) => new Intl.DateTimeFormat('vi-VN').format(new Date(value));

const UserHistoryPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await apiFetch('/bookings/my');
        setBookings(data.bookings);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const tabs = useMemo(
    () => [
      { id: 'pending', label: t('history.pending') },
      { id: 'checked-in', label: t('history.checkedIn') },
      { id: 'completed', label: t('history.completed') },
      { id: 'cancelled', label: t('history.cancelled') }
    ],
    [t]
  );

  const visibleBookings = bookings.filter((booking) => booking.status === activeTab);

  return (
    <section className="py-10">
      <div className="page-shell">
        <h1 className="text-3xl font-bold text-black">{t('history.title')}</h1>

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2">
          {tabs.map((tab) => (
            <button
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold ${
                activeTab === tab.id ? 'bg-black text-white' : 'text-slate-700 hover:bg-anhdao-blue'
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="h-28 animate-pulse rounded-lg bg-white" />
          ) : visibleBookings.length ? (
            visibleBookings.map((booking) => (
              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={booking._id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <h2 className="text-lg font-semibold text-black">{booking.roomId?.roomNumber}</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm text-slate-500">{t('common.total')}</p>
                    <p className="font-semibold text-black">{formatCurrency(booking.totalPrice)}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">{t('history.empty')}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserHistoryPage;
