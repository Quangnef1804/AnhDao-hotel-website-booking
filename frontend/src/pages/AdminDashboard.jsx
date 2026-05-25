import { Eye, ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../api/client.js';
import { mediaUrl } from '../api/media.js';

const emptyRoom = {
  name: '',
  type: 'single',
  price: '',
  rating: 5,
  description: '',
  status: 'available'
};

const statusOptions = ['pending', 'checked-in', 'completed', 'cancelled'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const formatDate = (value) => new Intl.DateTimeFormat('vi-VN').format(new Date(value));

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [roomImages, setRoomImages] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState('');

  const imagePreviews = useMemo(
    () => roomImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [roomImages]
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

  const resetForm = () => {
    setRoomForm(emptyRoom);
    setRoomImages([]);
    setEditingRoom(null);
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
      price: Number(roomForm.price),
      rating: Number(roomForm.rating)
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
    setEditingRoom(room);
    setRoomImages([]);
    setRoomForm({
      name: room.name,
      type: room.type,
      price: room.price,
      rating: room.rating,
      description: room.description,
      status: room.status
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

      setSelectedRooms([]);
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

  const toggleSelection = (id, selected, setter) => {
    setter((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAll = (items, selected, setter) => {
    setter(selected.length === items.length ? [] : items.map((item) => item._id));
  };

  return (
    <section className="py-10">
      <div className="page-shell space-y-10">
        <div>
          <p className="text-sm font-semibold uppercase text-sky-600">{t('brand')}</p>
          <h1 className="mt-2 text-3xl font-bold text-black">{t('admin.title')}</h1>
        </div>

        {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSaveRoom}>
            <div className="mb-5 flex items-center gap-2">
              {editingRoom ? <Save size={20} /> : <Plus size={20} />}
              <h2 className="text-xl font-semibold text-black">
                {editingRoom ? t('admin.edit') : t('admin.newRoom')}
              </h2>
            </div>
            <div className="space-y-4">
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                {t('common.name')}
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                  name="name"
                  onChange={handleRoomChange}
                  required
                  value={roomForm.name}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  {t('common.type')}
                  <select
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
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
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                    name="status"
                    onChange={handleRoomChange}
                    value={roomForm.status}
                  >
                    <option value="available">{t('common.available')}</option>
                    <option value="maintenance">{t('common.maintenance')}</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  {t('common.price')}
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                    min="0"
                    name="price"
                    onChange={handleRoomChange}
                    required
                    type="number"
                    value={roomForm.price}
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  {t('common.rating')}
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                    max="5"
                    min="0"
                    name="rating"
                    onChange={handleRoomChange}
                    step="0.1"
                    type="number"
                    value={roomForm.rating}
                  />
                </label>
              </div>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                {t('common.description')}
                <textarea
                  className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
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
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-anhdao-blue">
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

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div className="relative overflow-hidden rounded-md border border-slate-200" key={preview.url}>
                        <img
                          alt={preview.file.name}
                          className="aspect-square h-full w-full object-cover"
                          src={preview.url}
                        />
                        {index === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {editingRoom?.images?.length > 0 && !imagePreviews.length && (
                  <div className="grid grid-cols-3 gap-2">
                    {editingRoom.images.map((image, index) => (
                      <div className="relative overflow-hidden rounded-md border border-slate-200" key={image.filename}>
                        <img
                          alt={image.originalName || editingRoom.name}
                          className="aspect-square h-full w-full object-cover"
                          src={mediaUrl(image.url)}
                        />
                        {index === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  type="submit"
                >
                  <Save size={17} />
                  {t('admin.saveRoom')}
                </button>
                {editingRoom && (
                  <button
                    className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                    onClick={resetForm}
                    type="button"
                  >
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="text-xl font-semibold text-black">{t('admin.rooms')}</h2>
              {selectedRooms.length > 0 && (
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={() => deleteRooms(selectedRooms)}
                  type="button"
                >
                  <Trash2 size={16} />
                  {t('admin.deleteSelected')} ({selectedRooms.length})
                </button>
              )}
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-anhdao-blue text-black">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        checked={rooms.length > 0 && selectedRooms.length === rooms.length}
                        onChange={() => toggleAll(rooms, selectedRooms, setSelectedRooms)}
                        type="checkbox"
                      />
                    </th>
                    <th className="px-4 py-3">{t('common.image')}</th>
                    <th className="px-4 py-3">{t('common.name')}</th>
                    <th className="px-4 py-3">{t('common.type')}</th>
                    <th className="px-4 py-3">{t('common.price')}</th>
                    <th className="px-4 py-3">{t('common.status')}</th>
                    <th className="px-4 py-3">{t('admin.update')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr className="border-b border-slate-100" key={room._id}>
                      <td className="px-4 py-3">
                        <input
                          checked={selectedRooms.includes(room._id)}
                          onChange={() => toggleSelection(room._id, selectedRooms, setSelectedRooms)}
                          type="checkbox"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-12 w-16 overflow-hidden rounded-md bg-anhdao-blue">
                          {room.images?.[0]?.url && (
                            <img
                              alt={room.name}
                              className="h-full w-full object-cover"
                              src={mediaUrl(room.images[0].url)}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-black">
                        <p>{room.name}</p>
                        <p className="text-xs font-normal text-slate-500">{room.images?.length || 0} images</p>
                      </td>
                      <td className="px-4 py-3">{t(`common.${room.type}`)}</td>
                      <td className="px-4 py-3">{formatCurrency(room.price)}</td>
                      <td className="px-4 py-3">{t(`common.${room.status}`)}</td>
                      <td className="px-4 py-3">
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
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-xl font-semibold text-black">{t('admin.bookings')}</h2>
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
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-anhdao-blue text-black">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      checked={bookings.length > 0 && selectedBookings.length === bookings.length}
                      onChange={() => toggleAll(bookings, selectedBookings, setSelectedBookings)}
                      type="checkbox"
                    />
                  </th>
                  <th className="px-4 py-3">{t('admin.customer')}</th>
                  <th className="px-4 py-3">{t('common.name')}</th>
                  <th className="px-4 py-3">{t('booking.checkIn')}</th>
                  <th className="px-4 py-3">{t('booking.checkOut')}</th>
                  <th className="px-4 py-3">{t('common.total')}</th>
                  <th className="px-4 py-3">{t('admin.status')}</th>
                  <th className="px-4 py-3">{t('admin.update')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr className="border-b border-slate-100" key={booking._id}>
                    <td className="px-4 py-3">
                      <input
                        checked={selectedBookings.includes(booking._id)}
                        onChange={() => toggleSelection(booking._id, selectedBookings, setSelectedBookings)}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black">{booking.userId?.nickname}</p>
                      <p className="text-xs text-slate-500">{booking.userId?.phone}</p>
                    </td>
                    <td className="px-4 py-3">{booking.roomId?.name}</td>
                    <td className="px-4 py-3">{formatDate(booking.checkInDate)}</td>
                    <td className="px-4 py-3">{formatDate(booking.checkOutDate)}</td>
                    <td className="px-4 py-3">{formatCurrency(booking.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-400"
                        onChange={(event) => handleBookingStatus(booking._id, event.target.value)}
                        value={booking.status}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {t(`common.${status}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
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
          <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
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
