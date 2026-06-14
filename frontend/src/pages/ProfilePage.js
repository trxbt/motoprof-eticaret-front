import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, LogOut, MapPin, Plus, Pencil, Trash2, Star, ChevronRight, Clock, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_MAP = {
  pending:    { label: 'Beklemede',     color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  processing: { label: 'Hazırlanıyor',  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  shipped:    { label: 'Kargoda',       color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  delivered:  { label: 'Teslim Edildi', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
};

const PAYMENT_MAP = {
  paid:      { label: 'Ödendi',    color: 'text-green-400' },
  pending:   { label: 'Bekliyor',  color: 'text-yellow-400' },
  failed:    { label: 'Başarısız', color: 'text-red-400' },
  mock_paid: { label: 'Ödendi',    color: 'text-green-400' },
};

const inputCls = 'w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-orange-500 transition-colors';
const labelCls = 'block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider';

const EMPTY_ADDR = { title: '', name: '', phone: '', address: '', city: '', district: '', is_default: false };

// ─── Address Modal ────────────────────────────────────────────────────────────
const AddressModal = ({ addr, onClose, onSave }) => {
  const [form, setForm] = useState(addr || EMPTY_ADDR);
  const [saving, setSaving] = useState(false);
  const isEdit = !!addr?.id;

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.name || !form.phone || !form.address || !form.city) {
      toast.error('Lütfen tüm zorunlu alanları doldurun'); return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const { data } = await axios.put(`${API}/addresses/${addr.id}`, form, { withCredentials: true });
        onSave(data, 'update');
      } else {
        const { data } = await axios.post(`${API}/addresses`, form, { withCredentials: true });
        onSave(data, 'create');
      }
      toast.success(isEdit ? 'Adres güncellendi' : 'Adres eklendi');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Bir hata oluştu');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-black text-white">{isEdit ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#262626] rounded-lg transition-colors"><X size={16} className="text-neutral-400" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className={labelCls}>Adres Başlığı *</label>
            <div className="flex gap-2 mb-1">
              {['Ev', 'İş', 'Diğer'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({...f, title: t}))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${form.title === t ? 'bg-orange-500 border-orange-500 text-white' : 'bg-[#0d0d0d] border-[#2a2a2a] text-neutral-400 hover:border-orange-500/50'}`}>
                  {t}
                </button>
              ))}
            </div>
            <input name="title" value={form.title} onChange={handle} placeholder="veya yazın (ör: Anne Evi)" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Ad Soyad *</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Ahmet Yılmaz" className={inputCls} /></div>
            <div><label className={labelCls}>Telefon *</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="05XX XXX XX XX" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Adres *</label>
            <textarea name="address" value={form.address} onChange={handle} rows={2} placeholder="Mahalle, sokak, bina no, daire no"
              className={`${inputCls} resize-none`} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Şehir *</label>
              <input name="city" value={form.city} onChange={handle} placeholder="İstanbul" className={inputCls} /></div>
            <div><label className={labelCls}>İlçe</label>
              <input name="district" value={form.district} onChange={handle} placeholder="Kadıköy" className={inputCls} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_default" checked={form.is_default} onChange={handle}
              className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0d0d0d] accent-orange-500" />
            <span className="text-sm text-neutral-400">Varsayılan adres olarak ayarla</span>
          </label>
          <button type="submit" disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
            {isEdit ? 'Güncelle' : 'Adresi Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders]     = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [modalAddr, setModalAddr] = useState(null); // null=closed, EMPTY_ADDR=new, obj=edit
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.title = 'Profilim - MotoProf';
    fetchOrders();
    fetchAddresses();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/orders`, { withCredentials: true });
      setOrders(data);
    } catch {} finally { setLoadingOrders(false); }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${API}/addresses`, { withCredentials: true });
      setAddresses(data);
    } catch {} finally { setLoadingAddresses(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

  const openAdd    = () => { setModalAddr(null); setShowModal(true); };
  const openEdit   = (a) => { setModalAddr(a); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const onAddrSave = (saved, action) => {
    if (action === 'create') {
      setAddresses(prev => saved.is_default ? [saved, ...prev.map(a => ({...a, is_default: false}))] : [...prev, saved]);
    } else {
      setAddresses(prev => saved.is_default
        ? [saved, ...prev.filter(a => a.id !== saved.id).map(a => ({...a, is_default: false}))]
        : prev.map(a => a.id === saved.id ? saved : a)
      );
    }
  };

  const deleteAddr = async (id) => {
    if (!window.confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${API}/addresses/${id}`, { withCredentials: true });
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Adres silindi');
    } catch { toast.error('Adres silinemedi'); }
  };

  const setDefault = async (id) => {
    try {
      const { data } = await axios.patch(`${API}/addresses/${id}/default`, {}, { withCredentials: true });
      setAddresses(prev => prev.map(a => a.id === id ? data : { ...a, is_default: false }));
      toast.success('Varsayılan adres güncellendi');
    } catch { toast.error('İşlem başarısız'); }
  };

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setActiveTab(id)} data-testid={`tab-${id}`}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === id ? 'bg-orange-500 text-white' : 'bg-[#171717] border border-[#3f3f46] text-neutral-400 hover:text-white'}`}>
      {icon}{label}
    </button>
  );

  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

      {showModal && <AddressModal addr={modalAddr} onClose={closeModal} onSave={onAddrSave} />}

      {/* Profile Header */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center">
              <User size={26} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white font-chivo">{user?.name}</h1>
              <p className="text-sm text-neutral-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} data-testid="profile-logout-btn"
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors">
            <LogOut size={15} />Çıkış Yap
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabBtn('orders',    `Siparişlerim (${orders.length})`, <Package size={15} />)}
        {tabBtn('addresses', `Adreslerim (${addresses.length})`, <MapPin size={15} />)}
      </div>

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div className="space-y-3">
              {[1,2].map(i => (
                <div key={i} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 animate-pulse">
                  <div className="flex gap-4"><div className="h-4 bg-[#262626] rounded w-24" /><div className="h-4 bg-[#262626] rounded flex-1" /></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#111] border border-[#2a2a2a] rounded-2xl">
              <div className="p-4 bg-[#1a1a1a] rounded-full mb-4"><Package size={32} className="text-neutral-600" /></div>
              <h3 className="text-base font-bold text-white mb-2">Henüz siparişiniz yok</h3>
              <p className="text-neutral-400 text-sm mb-5">Motosikletiniz için parça almaya başlayın.</p>
              <Link to="/urunler" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="space-y-4" data-testid="orders-list">
              {orders.map(order => {
                const status  = STATUS_MAP[order.status]  || STATUS_MAP.pending;
                const payment = PAYMENT_MAP[order.payment_status] || PAYMENT_MAP.pending;
                return (
                  <div key={order.id} data-testid={`order-card-${order.id}`}
                    className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-neutral-500">#{order.id?.slice(-8).toUpperCase()}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
                          <span className={`text-xs font-semibold ${payment.color}`}>{payment.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-white mt-1">{order.items?.length} ürün</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock size={11} className="text-neutral-500" />
                          <span className="text-xs text-neutral-500">{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-orange-500 font-chivo">
                          {order.total?.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{order.shipping_city}</p>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5">
                          {item.product_image
                            ? <img src={item.product_image} alt={item.product_name} className="w-6 h-6 object-cover rounded" />
                            : <div className="w-6 h-6 bg-[#1a1a1a] rounded" />}
                          <span className="text-xs text-neutral-300 max-w-[120px] truncate">{item.product_name}</span>
                          <span className="text-xs text-neutral-500">×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <span className="text-xs text-neutral-500 flex items-center px-1">+{order.items.length - 3}</span>
                      )}
                    </div>

                    {/* Detail link */}
                    <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex justify-end">
                      <Link to={`/siparislerim/${order.id}`} data-testid={`order-detail-${order.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                        Sipariş Detayını Gör <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ADDRESSES TAB ── */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-400">{addresses.length} kayıtlı adres</p>
            <button onClick={openAdd} data-testid="add-address-btn"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm">
              <Plus size={15} /> Adres Ekle
            </button>
          </div>

          {loadingAddresses ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-28 bg-[#111] rounded-xl border border-[#2a2a2a] animate-pulse" />)}
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#111] border border-[#2a2a2a] rounded-2xl">
              <div className="p-4 bg-[#1a1a1a] rounded-full mb-4"><MapPin size={32} className="text-neutral-600" /></div>
              <h3 className="text-base font-bold text-white mb-2">Kayıtlı adresiniz yok</h3>
              <p className="text-neutral-400 text-sm mb-5">Hızlı ödeme için adresinizi kaydedin.</p>
              <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm flex items-center gap-2">
                <Plus size={15} /> İlk Adresini Ekle
              </button>
            </div>
          ) : (
            <div className="space-y-3" data-testid="addresses-list">
              {addresses.map(addr => (
                <div key={addr.id} data-testid={`addr-card-${addr.id}`}
                  className={`bg-[#111] border rounded-xl p-5 transition-colors ${addr.is_default ? 'border-orange-500/40 bg-orange-500/5' : 'border-[#2a2a2a]'}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white">{addr.title}</span>
                        {addr.is_default && (
                          <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star size={9} fill="currentColor" /> Varsayılan
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white">{addr.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{addr.phone}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{addr.address}</p>
                      <p className="text-xs text-neutral-400">{addr.district ? `${addr.district} / ` : ''}{addr.city}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => openEdit(addr)} data-testid={`edit-addr-${addr.id}`}
                        className="p-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#2a2a2a] rounded-lg transition-colors">
                        <Pencil size={13} className="text-neutral-400" />
                      </button>
                      <button onClick={() => deleteAddr(addr.id)} data-testid={`del-addr-${addr.id}`}
                        className="p-2 bg-[#1a1a1a] hover:bg-red-500/20 border border-[#2a2a2a] hover:border-red-500/30 rounded-lg transition-colors">
                        <Trash2 size={13} className="text-neutral-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  {!addr.is_default && (
                    <button onClick={() => setDefault(addr.id)} data-testid={`default-addr-${addr.id}`}
                      className="mt-3 text-xs text-neutral-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                      <Star size={11} /> Varsayılan yap
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
