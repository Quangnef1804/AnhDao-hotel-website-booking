import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mediaUrl } from '../api/media.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const RoomCard = ({ room, onDetail }) => {
  const { t } = useTranslation();
  const mainImage = room.images?.[0]?.url;

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="relative mb-4 h-36 overflow-hidden rounded-md bg-anhdao-blue">
        {mainImage && (
          <img
            alt={room.name}
            className="absolute inset-0 h-full w-full object-cover"
            src={mediaUrl(mainImage)}
          />
        )}
        <div className="relative flex h-full items-end justify-between p-4">
          <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-800">
            {t(`common.${room.type}`)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-black px-3 py-1 text-xs font-semibold text-white">
            <Star size={14} fill="currentColor" />
            {room.rating}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold text-black">{room.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{room.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-slate-500">{t('common.price')}</p>
            <p className="font-semibold text-black">{formatCurrency(room.price)}</p>
          </div>
          <span
            className={`rounded-md px-3 py-1 text-xs font-semibold ${
              room.status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {t(`common.${room.status}`)}
          </span>
        </div>
        <button
          className="mt-5 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
