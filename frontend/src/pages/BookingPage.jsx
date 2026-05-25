import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../api/client.js';
import RoomCard from '../components/RoomCard.jsx';
import RoomModal from '../components/RoomModal.jsx';

const BookingPage = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/rooms');
      setRooms(data.rooms);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleBooked = () => {
    setSelectedRoom(null);
    setMessage(t('booking.success'));
  };

  return (
    <section className="py-10">
      <div className="page-shell">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-600">{t('brand')}</p>
            <h1 className="mt-2 text-3xl font-bold text-black">{t('booking.title')}</h1>
          </div>
        </div>

        {message && <p className="mb-5 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div className="h-80 animate-pulse rounded-lg bg-white" key={item} />
            ))}
          </div>
        ) : rooms.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} onDetail={setSelectedRoom} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">{t('booking.empty')}</p>
        )}
      </div>

      <RoomModal onBooked={handleBooked} onClose={() => setSelectedRoom(null)} room={selectedRoom} />
    </section>
  );
};

export default BookingPage;

