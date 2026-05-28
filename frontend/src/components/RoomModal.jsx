import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { mediaUrl } from '../api/media.js';
import { useAuth } from '../context/AuthContext.jsx';

const toInputDate = (date) => date.toISOString().slice(0, 10);

const RoomModal = ({ room, onClose, onBooked }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState(toInputDate(new Date()));
  const [checkOutDate, setCheckOutDate] = useState(toInputDate(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setActiveImage(0);
  }, [room?._id]);

  if (!room) return null;

  const images = room.images || [];
  const selectedImage = images[activeImage];
  const canNavigateImages = images.length > 1;

  const goImage = (step) => {
    setActiveImage((current) => (current + step + images.length) % images.length);
  };

  const handleBook = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/booking' } });
      return;
    }

    try {
      setLoading(true);
      setError('');
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          roomId: room._id,
          checkInDate,
          checkOutDate
        })
      });
      onBooked();
    } catch (bookingError) {
      setError(bookingError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section className="w-full max-w-xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-2xl font-semibold text-black">{room.roomNumber}</h2>
            <p className="mt-1 text-sm text-slate-600">{t(`common.${room.type}`)}</p>
          </div>
          <button
            aria-label={t('common.close')}
            className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <div className="relative aspect-video bg-anhdao-blue">
              {selectedImage ? (
                <img
                  alt={room.roomNumber}
                  className="h-full w-full object-cover"
                  src={mediaUrl(selectedImage)}
                />
              ) : (
                <div className="grid h-full place-items-center text-sm font-semibold text-slate-600">
                  {t('common.image')}
                </div>
              )}
              {canNavigateImages && (
                <>
                  <button
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md bg-white/90 text-black shadow"
                    onClick={() => goImage(-1)}
                    type="button"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md bg-white/90 text-black shadow"
                    onClick={() => goImage(1)}
                    type="button"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto bg-white p-3">
                {images.map((image, index) => (
                  <button
                    className={`h-16 w-24 flex-none overflow-hidden rounded-md border ${
                      activeImage === index ? 'border-black' : 'border-slate-200'
                    }`}
                    key={image}
                    onClick={() => setActiveImage(index)}
                    type="button"
                  >
                    <img
                      alt={`${room.roomNumber} ${index + 1}`}
                      className="h-full w-full object-cover"
                      src={mediaUrl(image)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="leading-7 text-slate-700">{room.description}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              {t('booking.checkIn')}
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                min={toInputDate(new Date())}
                onChange={(event) => setCheckInDate(event.target.value)}
                type="date"
                value={checkInDate}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              {t('booking.checkOut')}
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                min={checkInDate}
                onChange={(event) => setCheckOutDate(event.target.value)}
                type="date"
                value={checkOutDate}
              />
            </label>
          </div>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
            onClick={handleBook}
            type="button"
          >
            {loading ? '...' : t('booking.bookNow')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default RoomModal;
