import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, LogOut, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_MAP = {
  pending: { label: 'Beklemede', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  processing: { label: 'Hazırlanıyor', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  shipped: { label: 'Kargoda', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  delivered: { label: 'Teslim Edildi', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    document.title = 'Profilim - MotoProf';
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/orders`, { withCredentials: true });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Profile header */}
      <div className="bg-[#171717] border border-[#3f3f46] rounded-2xl p-6 mb-6">
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
          <button
            onClick={handleLogout}
            data-testid="profile-logout-btn"
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
          >
            <LogOut size={15} />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          data-testid="tab-orders"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-orange-500 text-white' : 'bg-[#171717] border border-[#3f3f46] text-neutral-400 hover:text-white'}`}
        >
          <Package size={15} />
          Siparişlerim
        </button>
      </div>

      {/* Orders */}
      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#171717] border border-[#3f3f46] rounded-xl p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-4 bg-[#262626] rounded w-24" />
                    <div className="h-4 bg-[#262626] rounded flex-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#171717] border border-[#3f3f46] rounded-2xl">
              <div className="p-4 bg-[#262626] rounded-full mb-4">
                <Package size={32} className="text-neutral-600" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Henüz siparişiniz yok</h3>
              <p className="text-neutral-400 text-sm mb-5">Motosikletiniz için parça almaya başlayın.</p>
              <Link to="/urunler" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="space-y-4" data-testid="orders-list">
              {orders.map(order => {
                const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
                return (
                  <div
                    key={order.id}
                    data-testid={`order-card-${order.id}`}
                    className="bg-[#171717] border border-[#3f3f46] rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-mono text-neutral-500">#{order.id?.slice(-8).toUpperCase()}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white mt-1">
                          {order.items?.length} ürün
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock size={12} className="text-neutral-500" />
                          <span className="text-xs text-neutral-500">{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-orange-500 font-chivo">
                          {order.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{order.shipping_city}</p>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[#0a0a0a] border border-[#3f3f46] rounded-lg px-3 py-1.5">
                          <img src={item.image} alt={item.name} className="w-6 h-6 object-cover rounded" />
                          <span className="text-xs text-neutral-300 max-w-28 truncate">{item.name}</span>
                          <span className="text-xs text-neutral-500">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <span className="text-xs text-neutral-500 flex items-center px-2">+{order.items.length - 3} daha</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
