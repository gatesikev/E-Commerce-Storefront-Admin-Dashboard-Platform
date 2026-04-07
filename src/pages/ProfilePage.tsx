import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  ShoppingBag,
  LogOut,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Mock orders — in a real app these come from GET /orders/me
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    date: '2026-03-28',
    status: 'DELIVERED' as OrderStatus,
    total: 127.5,
    items: [
      { title: 'Futuristic Holographic Soccer Cleats', qty: 2, price: 39 },
      { title: 'Chic Summer Denim Espadrille Sandals', qty: 1, price: 33 },
    ],
  },
  {
    id: 'ORD-002',
    date: '2026-04-01',
    status: 'SHIPPED' as OrderStatus,
    total: 54.0,
    items: [{ title: 'Rainbow Glitter High Heels', qty: 1, price: 39 }, { title: 'Generic Item', qty: 1, price: 15 }],
  },
  {
    id: 'ORD-003',
    date: '2026-04-05',
    status: 'PENDING' as OrderStatus,
    total: 27.0,
    items: [{ title: 'Vibrant Runners: Bold Orange & Blue', qty: 1, price: 27 }],
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number }> }> = {
  PENDING:    { label: 'Pending',    color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   icon: Clock },
  PROCESSING: { label: 'Processing', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: RotateCcw },
  SHIPPED:    { label: 'Shipped',    color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: Truck },
  DELIVERED:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: XCircle },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="page-enter">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1
          className="text-3xl font-bold text-gray-900 mb-8"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Profile Card ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full border-4 border-indigo-100 object-cover bg-indigo-50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`;
                  }}
                />
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                  <CheckCircle size={12} className="text-white" />
                </div>
              </div>

              {/* Name + role */}
              <div>
                <h2
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {user?.name}
                </h2>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${
                  user?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  <ShieldCheck size={11} />
                  {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                </span>
              </div>

              {/* Info rows */}
              <div className="w-full flex flex-col gap-2 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User size={15} className="text-gray-400 shrink-0" />
                  <span>Member since April 2026</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ShoppingBag size={15} className="text-gray-400 shrink-0" />
                  <span>{MOCK_ORDERS.length} orders placed</span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: 'Orders', value: MOCK_ORDERS.length, icon: Package, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Delivered', value: MOCK_ORDERS.filter((o) => o.status === 'DELIVERED').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={17} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Order History ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            <h2
              className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              <Package size={20} className="text-indigo-500" />
              Order History
            </h2>

            {MOCK_ORDERS.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No orders yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {MOCK_ORDERS.map((order) => {
                  const cfg = STATUS_CONFIG[order.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                    >
                      {/* Order header */}
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <div>
                          <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {order.id}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Placed on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={12} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="flex flex-col gap-1.5 mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-indigo-100 text-indigo-700 text-xs rounded-full flex items-center justify-center font-bold shrink-0">
                                {item.qty}
                              </span>
                              <span className="truncate max-w-xs">{item.title}</span>
                            </span>
                            <span className="font-medium text-gray-700 shrink-0 ml-2">
                              ${(item.price * item.qty).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Order Total</span>
                        <span
                          className="text-lg font-bold text-indigo-700"
                          style={{ fontFamily: 'Syne, sans-serif' }}
                        >
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}