import {
  CalendarCheck,
  ClipboardList,
  DoorOpen,
  Eye,
  Grid3X3,
  Hotel,
  ImagePlus,
  LayoutDashboard,
  Pencil,
  Plus,
  Save,
  Settings,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../api/client.js';
import { mediaUrl } from '../api/media.js';

const emptyRoom = {
  roomNumber: '',
  type: 'single',
  price: '',
  description: '',
  status: 'available'
};

const bookingStatusOptions = ['pending', 'checked-in', 'completed', 'cancelled'];
const roomStatusOptions = ['available', 'occupied', 'booked', 'maintenance'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const formatDate = (value) => new Intl.DateTimeFormat('vi-VN').format(new Date(value));

const roomTileStyles = {
  available: 'border-slate-200 bg-slate-100 text-slate-700 hover:border-sky-200',
  occupied: 'border-red-100 bg-red-100 text-red-700 hover:border-red-200',
  booked: 'border-amber-100 bg-amber-100 text-amber-800 hover:border-amber-200',
  maintenance: 'border-sky-200 bg-sky-100 text-slate-950 hover:border-slate-300'
};

const statusBadgeStyles = {
  available: 'bg-slate-100 text-slate-700',
  occupied: 'bg-red-50 text-red-700',
  booked: 'bg-amber-50 text-amber-800',
  maintenance: 'bg-sky-50 text-slate-800'
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [roomImages, setRoomImages] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState('');

  const imagePreviews = useMemo(
    () => roomImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [roomImages]
  );

  const roomStats = useMemo(
    () =>
      roomStatusOptions.reduce(
        (stats, status) => ({
          ...stats,
          [status]: rooms.filter((room) => room.status === status).length
        }),
        { total: rooms.length }
      ),
    [rooms]
  );

  const sidebarItems = useMemo(
    () => [
      { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
      { id: 'rooms', label: t('admin.roomMap'), icon: Grid3X3 },
      { id: 'bookings', label: t('admin.bookings'), icon: ClipboardList }
    ],
    [t]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const loadData = async () => {
    const [roomData, bookingData] = await Promise.all([apiFetch('/rooms'), apiFetch('/bookings/admin')]);
    setRooms(roomData.rooms);
    setBookings(bookingData.bookings);
  };

  useEffect(() => {
    loadData().catch((loadError) => setError(loadError.message));
  }, []);

  const currentBookingForRoom = (room) =>
    bookings.find(
      (booking) =>
        booking.roomId?._id === room._id && ['pending', 'checked-in'].includes(booking.status)
    );

  const handleRoomChange = (event) => {
    setRoomForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setRoomForm(emptyRoom);
    setRoomImages([]);
    setEditingRoom(null);
    setShowRoomForm(false);
  };

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 6) {
      setError(t('admin.imagesHint'));
    }

    setRoomImages(files.slice(0, 6));
    event.target.value = '';
  };

  const roomFormData = () => {
    const formData = new FormData();

    Object.entries({
      ...roomForm,
      price: Number(roomForm.price)
    }).forEach(([key, value]) => {
      formData.append(key, value);
    });

    roomImages.forEach((file) => {
      formData.append('images', file);
    });

    return formData;
  };

  const handleSaveRoom = async (event) => {
    event.preventDefault();
    try {
      setError('');

      if (editingRoom) {
        await apiFetch(`/rooms/${editingRoom._id}`, {
          method: 'PUT',
          body: roomFormData()
        });
      } else {
        await apiFetch('/rooms', {
          method: 'POST',
          body: roomFormData()
        });
      }

      resetForm();
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const handleEditRoom = (room) => {
    setActiveTab('rooms');
    setEditingRoom(room);
    setShowRoomForm(true);
    setRoomImages([]);
    setRoomForm({
      roomNumber: room.roomNumber || room.name || '',
      type: room.type,
      price: room.price,
      description: room.description || '',
      status: room.status
    });
  };

  const updateRoomsStatus = async (ids, status) => {
    if (!ids.length) return;

    try {
      setError('');
      await apiFetch('/rooms/bulk/status', {
        method: 'PATCH',
        body: JSON.stringify({ ids, status })
      });
      setSelectedRooms([]);
      setActiveRoom(null);
      await loadData();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  const deleteRooms = async (ids) => {
    if (!ids.length || !window.confirm(t('admin.delete'))) return;

    try {
      setError('');
      if (ids.length === 1) {
        await apiFetch(`/rooms/${ids[0]}`, { method: 'DELETE' });
      } else {
        await apiFetch('/rooms/bulk', {
          method: 'DELETE',
          body: JSON.stringify({ ids })
        });
      }

      setSelectedRooms([]);
      setActiveRoom(null);
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const data = await apiFetch(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setBookings((current) => current.map((booking) => (booking._id === bookingId ? data.booking : booking)));
      await loadData();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  const deleteBookings = async (ids) => {
    if (!ids.length || !window.confirm(t('admin.delete'))) return;

    try {
      setError('');
      if (ids.length === 1) {
        await apiFetch(`/bookings/${ids[0]}`, { method: 'DELETE' });
      } else {
        await apiFetch('/bookings/bulk', {
          method: 'DELETE',
          body: JSON.stringify({ ids })
        });
      }

      setSelectedBookings([]);
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const toggleSelection = (id, setter) => {
    setter((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAll = (items, selected, setter) => {
    setter(selected.length === items.length ? [] : items.map((item) => item._id));
  };

  const activeRoomBooking = activeRoom ? currentBookingForRoom(activeRoom) : null;

  const statCards = [
    {
      label: t('admin.totalRooms'),
      value: roomStats.total,
      icon: Hotel,
      tone: 'bg-sky-50 text-sky-700',
      border: 'border-sky-100'
    },
    {
      label: t('common.available'),
      value: roomStats.available,
      icon: DoorOpen,
      tone: 'bg-slate-100 text-slate-700',
      border: 'border-slate-200'
    },
    {
      label: t('common.occupied'),
      value: roomStats.occupied,
      icon: Users,
      tone: 'bg-red-50 text-red-700',
      border: 'border-red-100'
    },
    {
      label: t('common.maintenance'),
      value: roomStats.maintenance,
      icon: Settings,
      tone: 'bg-sky-100 text-slate-900',
      border: 'border-sky-200'
    }
  ];

  const renderStatsCards = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <article className={`rounded-2xl border bg-white p-5 shadow-sm ${card.border}`} key={card.label}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{card.value}</p>
              </div>
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${card.tone}`}>
                <Icon size={22} />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );

  const renderRoomTile = (room, compact = false) => (
    <button
      className={`flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border text-center text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${roomTileStyles[room.status]}`}
      onClick={() => setActiveRoom(room)}
      type="button"
    >
      {room.status === 'maintenance' && <Settings size={compact ? 15 : 18} />}
      <span className="leading-tight">{room.roomNumber || room.name}</span>
    </button>
  );

  const renderDashboard = () => (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-600">{t('admin.overview')}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{t('admin.roomPreview')}</h2>
          </div>
          <button
            className="rounded-md border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
            onClick={() => setActiveTab('rooms')}
            type="button"
          >
            {t('admin.roomMap')}
          </button>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
          {rooms.slice(0, 30).map((room) => (
            <div className="h-14" key={room._id}>
              {renderRoomTile(room, true)}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-600">{t('admin.recentBookings')}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{t('admin.bookings')}</h2>
          </div>
          <button
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            onClick={() => setActiveTab('bookings')}
            type="button"
          >
            {t('admin.viewCustomer')}
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {bookings.slice(0, 5).map((booking) => (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4" key={booking._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{booking.userId?.nickname || '-'}</p>
                  <p className="mt-1 text-sm text-slate-500">{booking.roomId?.roomNumber || booking.roomId?.name}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {t(`common.${booking.status}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderRoomMap = () => (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-600">{t('admin.roomMap')}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{t('admin.roomPreview')}</h2>
          </div>
          {selectedRooms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={() => updateRoomsStatus(selectedRooms, 'maintenance')}
                type="button"
              >
                <Settings size={16} />
                {t('admin.maintenanceSelected')} ({selectedRooms.length})
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => deleteRooms(selectedRooms)}
                type="button"
              >
                <Trash2 size={16} />
                {t('admin.deleteSelected')} ({selectedRooms.length})
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          {roomStatusOptions.map((status) => (
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${statusBadgeStyles[status]}`}
              key={status}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {t(`common.${status}`)}: {roomStats[status]}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
          {rooms.map((room) => (
            <div className="relative h-16 sm:h-[68px]" key={room._id}>
              <input
                aria-label={`${t('admin.selected')} ${room.roomNumber || room.name}`}
                checked={selectedRooms.includes(room._id)}
                className="absolute left-2 top-2 z-10 h-4 w-4 rounded border-slate-300 accent-sky-500"
                onChange={() => toggleSelection(room._id, setSelectedRooms)}
                type="checkbox"
              />
              <div className={selectedRooms.includes(room._id) ? 'h-full rounded-xl ring-2 ring-sky-400 ring-offset-2' : 'h-full'}>
                {renderRoomTile(room)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-600">{t('admin.rooms')}</p>
            <h2 className="mt-1 text-xl font-semibold text-black">{t('admin.roomManagement')}</h2>
          </div>
          <button
            aria-label={editingRoom || showRoomForm ? t('common.cancel') : t('admin.newRoom')}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white shadow-sm transition hover:bg-sky-600"
            onClick={() => {
              if (editingRoom || showRoomForm) {
                resetForm();
                return;
              }

              setShowRoomForm(true);
            }}
            title={editingRoom || showRoomForm ? t('common.cancel') : t('admin.newRoom')}
            type="button"
          >
            {editingRoom || showRoomForm ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {(showRoomForm || editingRoom) && (
          <form
            className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4"
            onSubmit={handleSaveRoom}
          >
            <div className="mb-4 flex items-center gap-2">
              {editingRoom ? <Save size={19} /> : <Plus size={19} />}
              <h3 className="text-lg font-semibold text-black">
                {editingRoom ? t('admin.edit') : t('admin.newRoom')}
              </h3>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                {t('common.roomNumber')}
                <input
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-400"
                  name="roomNumber"
                  onChange={handleRoomChange}
                  placeholder="P.201"
                  required
                  value={roomForm.roomNumber}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                {t('common.type')}
                <select
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-400"
                  name="type"
                  onChange={handleRoomChange}
                  value={roomForm.type}
                >
                  <option value="single">{t('common.single')}</option>
                  <option value="double">{t('common.double')}</option>
                  <option value="vip">{t('common.vip')}</option>
                </select>
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                {t('common.status')}
                <select
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-400"
                  name="status"
                  onChange={handleRoomChange}
                  value={roomForm.status}
                >
                  {roomStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {t(`common.${status}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                {t('common.price')}
                <input
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-400"
                  min="0"
                  name="price"
                  onChange={handleRoomChange}
                  required
                  type="number"
                  value={roomForm.price}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                {t('common.description')}
                <textarea
                  className="min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-400"
                  name="description"
                  onChange={handleRoomChange}
                  value={roomForm.description}
                />
              </label>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{t('admin.images')}</p>
                  <p className="mt-1 text-xs text-slate-500">{t('admin.imagesHint')}</p>
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-anhdao-blue">
                  <ImagePlus size={18} />
                  {t('admin.images')}
                  <input
                    accept="image/*"
                    className="sr-only"
                    multiple
                    onChange={handleImagesChange}
                    type="file"
                  />
                </label>
              </div>
            </div>

            {(imagePreviews.length > 0 || (editingRoom?.images?.length > 0 && !imagePreviews.length)) && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(imagePreviews.length > 0 ? imagePreviews : editingRoom.images.map((image) => ({ url: mediaUrl(image), file: { name: editingRoom.roomNumber || editingRoom.name } }))).map((preview, index) => (
                  <div className="relative overflow-hidden rounded-md border border-slate-200 bg-white" key={`${preview.url}-${index}`}>
                    <img
                      alt={preview.file.name}
                      className="aspect-square h-full w-full object-cover"
                      src={preview.url}
                    />
                    {index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                        {t('common.mainImage')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                type="submit"
              >
                <Save size={17} />
                {t('admin.saveRoom')}
              </button>
              <button
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                onClick={resetForm}
                type="button"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">{t('common.image')}</th>
                  <th className="px-5 py-4 font-semibold">{t('common.roomNumber')}</th>
                  <th className="px-5 py-4 font-semibold">{t('common.type')}</th>
                  <th className="px-5 py-4 font-semibold">{t('common.price')}</th>
                  <th className="px-5 py-4 font-semibold">{t('common.status')}</th>
                  <th className="px-5 py-4 font-semibold">{t('admin.update')}</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr className="border-t border-slate-100" key={room._id}>
                    <td className="px-5 py-4">
                      <div className="h-12 w-16 overflow-hidden rounded-lg bg-anhdao-blue">
                        {room.images?.[0] && (
                          <img
                            alt={room.roomNumber || room.name}
                            className="h-full w-full object-cover"
                            src={mediaUrl(room.images[0])}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-black">
                      <p>{room.roomNumber || room.name}</p>
                      <p className="text-xs font-normal text-slate-500">{room.images?.length || 0} images</p>
                    </td>
                    <td className="px-5 py-4">{t(`common.${room.type}`)}</td>
                    <td className="px-5 py-4">{formatCurrency(room.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[room.status]}`}>
                        {t(`common.${room.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-anhdao-blue"
                          onClick={() => handleEditRoom(room)}
                          title={t('admin.edit')}
                          type="button"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-red-50"
                          onClick={() => deleteRooms([room._id])}
                          title={t('admin.delete')}
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </section>
    </div>
  );

  const renderBookingList = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-sky-600">{t('admin.bookings')}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{t('admin.customer')}</h2>
        </div>
        {selectedBookings.length > 0 && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            onClick={() => deleteBookings(selectedBookings)}
            type="button"
          >
            <Trash2 size={16} />
            {t('admin.deleteSelected')} ({selectedBookings.length})
          </button>
        )}
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="rounded-l-xl px-5 py-4">
                <input
                  checked={bookings.length > 0 && selectedBookings.length === bookings.length}
                  className="h-4 w-4 rounded border-slate-300 accent-sky-500"
                  onChange={() => toggleAll(bookings, selectedBookings, setSelectedBookings)}
                  type="checkbox"
                />
              </th>
              <th className="px-5 py-4 font-semibold">{t('admin.customer')}</th>
              <th className="px-5 py-4 font-semibold">{t('common.roomNumber')}</th>
              <th className="px-5 py-4 font-semibold">{t('booking.checkIn')}</th>
              <th className="px-5 py-4 font-semibold">{t('booking.checkOut')}</th>
              <th className="px-5 py-4 font-semibold">{t('common.total')}</th>
              <th className="px-5 py-4 font-semibold">{t('admin.status')}</th>
              <th className="rounded-r-xl px-5 py-4 font-semibold">{t('admin.update')}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr className="border-b border-slate-100" key={booking._id}>
                <td className="border-b border-slate-100 px-5 py-5">
                  <input
                    checked={selectedBookings.includes(booking._id)}
                    className="h-4 w-4 rounded border-slate-300 accent-sky-500"
                    onChange={() => toggleSelection(booking._id, setSelectedBookings)}
                    type="checkbox"
                  />
                </td>
                <td className="border-b border-slate-100 px-5 py-5">
                  <p className="font-medium text-black">{booking.userId?.nickname || '-'}</p>
                  <p className="text-xs text-slate-500">{booking.userId?.phone || '-'}</p>
                </td>
                <td className="border-b border-slate-100 px-5 py-5">
                  {booking.roomId?.roomNumber || booking.roomId?.name}
                </td>
                <td className="border-b border-slate-100 px-5 py-5">{formatDate(booking.checkInDate)}</td>
                <td className="border-b border-slate-100 px-5 py-5">{formatDate(booking.checkOutDate)}</td>
                <td className="border-b border-slate-100 px-5 py-5 font-semibold text-slate-950">
                  {formatCurrency(booking.totalPrice)}
                </td>
                <td className="border-b border-slate-100 px-5 py-5">
                  <select
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-400"
                    onChange={(event) => handleBookingStatus(booking._id, event.target.value)}
                    value={booking.status}
                  >
                    {bookingStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {t(`common.${status}`)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-slate-100 px-5 py-5">
                  <div className="flex gap-2">
                    <button
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 font-semibold hover:bg-anhdao-blue"
                      onClick={() => setSelectedCustomer(booking.userId)}
                      title={t('admin.viewCustomer')}
                      type="button"
                    >
                      <Eye size={16} />
                      {t('admin.viewCustomer')}
                    </button>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-red-50"
                      onClick={() => deleteBookings([booking._id])}
                      title={t('admin.delete')}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <section className="bg-slate-50 py-6 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 lg:flex-row lg:px-6">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:fixed lg:bottom-6 lg:left-6 lg:top-24 lg:z-30 lg:w-64 lg:overflow-y-auto">
          <div className="mb-4 hidden px-3 pt-3 lg:block">
            <p className="text-sm font-semibold uppercase text-sky-600">{t('brand')}</p>
            <h1 className="mt-1 text-xl font-bold text-slate-950">{t('admin.title')}</h1>
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  className={`inline-flex min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition lg:w-full ${
                    isActive
                      ? 'bg-sky-100 text-sky-800 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-6 lg:ml-72">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-sky-600">{t('brand')}</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">{t('admin.title')}</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
              <CalendarCheck size={17} />
              {bookings.length} {t('admin.bookings')}
            </div>
          </div>

          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {renderStatsCards()}

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'rooms' && renderRoomMap()}
          {activeTab === 'bookings' && renderBookingList()}
        </div>
      </div>

      {activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-black">{activeRoom.roomNumber || activeRoom.name}</h2>
                <p className="text-sm text-slate-500">{t(`common.${activeRoom.status}`)}</p>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={() => setActiveRoom(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                {t('admin.quickStatus')}
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                  onChange={(event) => updateRoomsStatus([activeRoom._id], event.target.value)}
                  value={activeRoom.status}
                >
                  {roomStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {t(`common.${status}`)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-black">{t('admin.currentGuest')}</p>
                {activeRoomBooking ? (
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <p>{activeRoomBooking.userId?.nickname}</p>
                    <p>{activeRoomBooking.userId?.phone}</p>
                    <p>{activeRoomBooking.userId?.email}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">{t('admin.noGuest')}</p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-semibold text-black">{t('admin.customerInfo')}</h2>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={() => setSelectedCustomer(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">{t('auth.nickname')}</p>
                <p className="font-semibold text-black">{selectedCustomer.nickname}</p>
              </div>
              <div>
                <p className="text-slate-500">{t('auth.phone')}</p>
                <p className="font-semibold text-black">{selectedCustomer.phone}</p>
              </div>
              <div>
                <p className="text-slate-500">{t('auth.email')}</p>
                <p className="font-semibold text-black">{selectedCustomer.email}</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
