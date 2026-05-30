import {
  Armchair,
  Bath,
  BriefcaseBusiness,
  Building2,
  Coffee,
  Heart,
  ShowerHead,
  Sparkles,
  UsersRound,
  Wifi
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mediaUrl } from '../api/media.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const amenitiesByType = {
  single: ['wifi', 'workspace', 'shower'],
  double: ['wifi', 'breakfast', 'shower'],
  family: ['family', 'breakfast', 'window'],
  vip: ['cityView', 'bathtub', 'lounge']
};

const amenityIcons = {
  wifi: Wifi,
  workspace: BriefcaseBusiness,
  shower: ShowerHead,
  family: UsersRound,
  breakfast: Coffee,
  window: Building2,
  cityView: Building2,
  bathtub: Bath,
  lounge: Armchair
};

const RoomCard = ({ room, onDetail }) => {
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState(false);
  const mainImage = room.images?.[0];
  const amenities = amenitiesByType[room.type] || amenitiesByType.single;
  const isMaintenance = room.status === 'maintenance';
  const isSoldOut = Number(room.quantity || 0) <= 0;
  const isUnavailable = isMaintenance || isSoldOut;

  return (
    <article className={`group relative flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl md:flex-row md:p-5 ${isUnavailable ? 'opacity-80' : ''}`}>
      <div className="relative min-h-56 overflow-hidden rounded-2xl bg-anhdao-blue md:min-h-[250px] md:w-[38%] md:flex-none">
        {mainImage ? (
          <img
            alt={room.name || room.roomNumber}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={mediaUrl(mainImage)}
          />
        ) : (
          <div className="grid h-full min-h-56 place-items-center text-slate-600 md:min-h-[250px]">
            <Sparkles size={34} />
          </div>
        )}

        <button
          aria-label={t('booking.favoriteRoom')}
          className={`absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-white/95 shadow-sm transition hover:scale-105 ${
            favorite ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
          }`}
          onClick={() => setFavorite((value) => !value)}
          type="button"
        >
          <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
        </button>

        <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
          {t(`common.${room.type}`)}
        </span>

        {isUnavailable && (
          <span className="absolute left-4 top-4 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {isMaintenance ? t('common.maintenance') : t('booking.soldOut')}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-2xl font-bold leading-tight text-sky-700 sm:text-3xl">
              {room.name || room.roomNumber}
            </h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Sparkles;
                return (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-slate-700"
                    key={amenity}
                  >
                    <Icon size={14} className="text-sky-600" />
                    {t(`booking.amenities.${amenity}`)}
                  </span>
                );
              })}
            </div>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
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

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{room.description}</p>

        <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">{t('common.price')}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{formatCurrency(room.price)}</p>
          </div>

          <button
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isUnavailable}
            onClick={() => onDetail(room)}
            type="button"
          >
            {t('booking.seeAllOptions')}
          </button>
        </div>
      </div>
    </article>
  );
};

export default RoomCard;
