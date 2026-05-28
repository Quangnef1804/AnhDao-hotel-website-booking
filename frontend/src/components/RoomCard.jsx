import { useTranslation } from 'react-i18next';
import { mediaUrl } from '../api/media.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const amenitiesByType = {
  single: ['wifi', 'workspace', 'shower'],
  double: ['family', 'breakfast', 'window'],
  vip: ['cityView', 'bathtub', 'lounge']
};

const RoomCard = ({ room, onDetail }) => {
  const { t } = useTranslation();
  const mainImage = room.images?.[0];
  const amenities = amenitiesByType[room.type] || amenitiesByType.single;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-anhdao-blue">
        {mainImage && (
          <img
            alt={room.roomNumber || room.name}
            className="absolute inset-0 h-full w-full object-cover"
            src={mediaUrl(mainImage)}
          />
        )}
        <div className="relative flex h-full items-end p-4">
          <span className="rounded-md bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
            {t(`common.${room.type}`)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold text-black">{room.roomNumber || room.name}</h3>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-slate-500">{t('booking.amenitiesTitle')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span
                className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-slate-700"
                key={amenity}
              >
                {t(`booking.amenities.${amenity}`)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-slate-500">{t('common.price')}</p>
            <p className="font-semibold text-black">{formatCurrency(room.price)}</p>
          </div>
          <span
            className={`rounded-md px-3 py-1 text-xs font-semibold ${
              room.status === 'available'
                ? 'bg-slate-100 text-slate-700'
                : room.status === 'occupied'
                  ? 'bg-red-50 text-red-700'
                  : room.status === 'booked'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-sky-50 text-slate-800'
            }`}
          >
            {t(`common.${room.status}`)}
          </span>
        </div>
        <button
          className="mt-5 rounded-md bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={room.status !== 'available'}
          onClick={() => onDetail(room)}
          type="button"
        >
          {t('booking.detail')}
        </button>
      </div>
    </article>
  );
};

export default RoomCard;
