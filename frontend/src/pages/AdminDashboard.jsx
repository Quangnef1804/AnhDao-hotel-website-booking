import { BedDouble, Boxes, CalendarCheck, Eye, ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../api/client.js';
import { mediaUrl } from '../api/media.js';

const roomTypeOptions = [
  { type: 'single', name: 'Phòng đơn' },
  { type: 'double', name: 'Phòng đôi' },
  { type: 'family', name: 'Phòng gia đình' },
  { type: 'vip', name: 'Phòng VIP' }
];

const emptyRoom = {
  name: roomTypeOptions[0].name,
  quantity: '',
  type: roomTypeOptions[0].type,
  price: '',
  description: '',
  status: 'available'
};

const bookingStatusOptions = ['pending', 'checked-in', 'completed', 'cancelled'];
const roomStatusOptions = ['available', 'maintenance'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const formatDate = (value) => new Intl.DateTimeFormat('vi-VN').format(new Date(value));

const statusBadgeStyles = {
  available: 'bg-slate-100 text-slate-700',
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
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState('');

  const imagePreviews = useMemo(
    () => roomImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [roomImages]
  );

  const stats = useMemo(
    () => ({
      roomTypes: rooms.length,
      availableQuantity: rooms
        .filter((room) => room.status !== 'maintenance')
        .reduce((total, room) => total + Number(room.quantity || 0), 0),
      maintenance: rooms.filter((room) => room.status === 'maintenance').length,
      bookings: bookings.length
    }),
    [rooms, bookings]
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

  const handleRoomChange = (event) => {
    setRoomForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRoomTypeChange = (event) => {
    const selectedRoomType =
      roomTypeOptions.find((option) => option.type === event.target.value) || roomTypeOptions[0];

    setRoomForm((current) => ({
      ...current,
      name: selectedRoomType.name,
      type: selectedRoomType.type
    }));
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
      roomNumber: roomForm.name,
      price: Number(roomForm.price),
      quantity: Number(roomForm.quantity)
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
    const selectedRoomType =
      roomTypeOptions.find((option) => option.type === room.type) || roomTypeOptions[0];

    setEditingRoom(room);
    setShowRoomForm(true);
    setRoomImages([]);
    setRoomForm({
      name: selectedRoomType.name,
      quantity: room.quantity ?? 0,
      type: selectedRoomType.type,
      price: room.price,
      description: room.description || '',
      status: ['available', 'maintenance'].includes(room.status) ? room.status : 'available'
    });
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

  const toggleSelection = (id) => {
    setSelectedBookings((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleAllBookings = () => {
    setSelectedBookings(selectedBookings.length === bookings.length ? [] : bookings.map((booking) => booking._id));
  };

  const statCards = [
    { label: t('admin.roomTypes'), value: stats.roomTypes, icon: BedDouble, tone: 'bg-sky-50 text-sky-700' },
    { label: t('admin.availableStock'), value: stats.availableQuantity, icon: Boxes, tone: 'bg-emerald-50 text-emerald-700' },
    { label: t('common.maintenance'), value: stats.maintenance, icon: X, tone: 'bg-slate-100 text-slate-700' },
    { label: t('admin.bookings'), value: stats.bookings, icon: CalendarCheck, tone: 'bg-indigo-50 text-indigo-700' }
  ];

  return (
    <section className="bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 lg:px-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-600">{t('brand')}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">{t('admin.title')}</h1>
          </div>
        </div>

        {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={card.label}>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-sky-600">{t('admin.rooms')}</p>
              <h2 className="mt-1 text-xl font-semibold text-black">{t('admin.roomInventory')}</h2>
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
            <form className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4" onSubmit={handleSaveRoom}>
              <div className="mb-4 flex items-center gap-2">
                {editingRoom ? <Save size={19} /> : <Plus size={19} />}
                <h3 className="text-lg font-semibold text-black">
                  {editingRoom ? t('admin.edit') : t('admin.newRoom')}
                </h3>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  {t('common.name')}
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-400"
                    name="type"
                    onChange={handleRoomTypeChange}
                    required
                    value={roomForm.type}
                  >
                    {roomTypeOptions.map((option) => (
                      <option key={option.type} value={option.type}>
                        {t(`common.${option.type}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  {t('common.quantity')}
                  <input
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-400"
                    min="0"
                    name="quantity"
                    onChange={handleRoomChange}
                    required
                    type="number"
                    value={roomForm.quantity}
                  />
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
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t('admin.images')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('admin.imagesHint')}</p>
                  </div>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-anhdao-blue">
                    <ImagePlus size={18} />
                    {t('admin.images')}
                    <input accept="image/*" className="sr-only" multiple onChange={handleImagesChange} type="file" />
                  </label>
                </div>
              </div>

              {(imagePreviews.length > 0 || (editingRoom?.images?.length > 0 && !imagePreviews.length)) && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {(imagePreviews.length > 0
                    ? imagePreviews
                    : editingRoom.images.map((image) => ({
                        url: mediaUrl(image),
                        file: { name: editingRoom.name || editingRoom.roomNumber }
                      }))
                  ).map((preview, index) => (
                    <div className="relative overflow-hidden rounded-md border border-slate-200 bg-white" key={`${preview.url}-${index}`}>
                      <img alt={preview.file.name} className="aspect-square h-full w-full object-cover" src={preview.url} />
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
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">{t('common.image')}</th>
                  <th className="px-5 py-4 font-semibold">{t('common.name')}</th>
                  <th className="px-5 py-4 font-semibold">{t('common.quantity')}</th>
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
                          <img alt={room.name || room.roomNumber} className="h-full w-full object-cover" src={mediaUrl(room.images[0])} />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-black">
                      <p>{room.name || room.roomNumber}</p>
                      <p className="text-xs font-normal text-slate-500">{room.images?.length || 0} images</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-950">{room.quantity ?? 0}</td>
                    <td className="px-5 py-4">{formatCurrency(room.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[room.status] || statusBadgeStyles.available}`}>
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
                      onChange={toggleAllBookings}
                      type="checkbox"
                    />
                  </th>
                  <th className="px-5 py-4 font-semibold">{t('admin.customer')}</th>
                  <th className="px-5 py-4 font-semibold">{t('common.name')}</th>
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
                        onChange={() => toggleSelection(booking._id)}
                        type="checkbox"
                      />
                    </td>
                    <td className="border-b border-slate-100 px-5 py-5">
                      <p className="font-medium text-black">{booking.userId?.nickname || '-'}</p>
                      <p className="text-xs text-slate-500">{booking.userId?.phone || '-'}</p>
                    </td>
                    <td className="border-b border-slate-100 px-5 py-5">
                      {booking.roomId?.name || booking.roomId?.roomNumber}
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
      </div>

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
