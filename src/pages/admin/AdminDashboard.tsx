import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  
  TrendingUp,
  Users,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, categoriesApi } from '../../api/client';
import type { Product, Category, OrderStatus } from '../../types';

// ── Order status config ────────────────────────────────────────
const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    'bg-amber-50 text-amber-700 border-amber-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED:  'bg-green-50 text-green-700 border-green-200',
  CANCELLED:  'bg-red-50 text-red-700 border-red-200',
};

// Mock orders for display (API doesn't have full order management)
const MOCK_ORDERS = [
  { id: 'ORD-001', customer: 'Alice Johnson', email: 'alice@email.com', total: 127.50, status: 'DELIVERED' as OrderStatus, date: '2026-04-01', items: 3 },
  { id: 'ORD-002', customer: 'Bob Smith',    email: 'bob@email.com',   total: 54.00,  status: 'SHIPPED'   as OrderStatus, date: '2026-04-03', items: 2 },
  { id: 'ORD-003', customer: 'Carol White',  email: 'carol@email.com', total: 89.99,  status: 'PROCESSING'as OrderStatus, date: '2026-04-05', items: 4 },
  { id: 'ORD-004', customer: 'David Lee',    email: 'david@email.com', total: 33.00,  status: 'PENDING'   as OrderStatus, date: '2026-04-06', items: 1 },
  { id: 'ORD-005', customer: 'Eva Martinez', email: 'eva@email.com',   total: 210.00, status: 'CANCELLED' as OrderStatus, date: '2026-04-06', items: 5 },
];

// ── Delete confirmation modal ──────────────────────────────────
function DeleteModal({
  title, onConfirm, onCancel, isDeleting,
}: {
  title: string; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-5">
          Are you sure you want to delete <span className="font-semibold">"{title}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <X size={15} /> Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isDeleting
              ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Trash2 size={15} />}
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void;
  icon: React.ComponentType<{ size?: number }>; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [tab, setTab] = useState<'products' | 'orders' | 'categories'>('products');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<{ id: number; name: string } | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, OrderStatus>>(
    Object.fromEntries(MOCK_ORDERS.map((o) => [o.id, o.status]))
  );

  const qc = useQueryClient();

  // ── Fetch products ───────────────────────────────────────────
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll({ limit: 100 }).then((r: any) => r.data),
    staleTime: 1000 * 60 * 3,
  });

  // ── Fetch categories ─────────────────────────────────────────
  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r: any) => r.data),
    staleTime: 1000 * 60 * 10,
  });

  // ── Delete product mutation ──────────────────────────────────
  const deleteProduct = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  // ── Delete category mutation ─────────────────────────────────
  const deleteCategory = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
      setDeleteCatTarget(null);
    },
    onError: () => toast.error('Failed to delete category'),
  });

  // ── Update order status (local mock) ────────────────────────
  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setOrderStatuses((prev) => ({ ...prev, [orderId]: status }));
    toast.success(`Order ${orderId} updated to ${status}`);
  };

  // Stats
  const totalRevenue = MOCK_ORDERS.filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-400">Manage your store</p>
            </div>
          </div>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {/* ── Stats row ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package}      label="Total Products"  value={products?.length ?? '—'}    color="bg-indigo-100 text-indigo-600" />
          <StatCard icon={ShoppingBag}  label="Total Orders"    value={MOCK_ORDERS.length}          color="bg-purple-100 text-purple-600" />
          <StatCard icon={TrendingUp}   label="Revenue"         value={`$${totalRevenue.toFixed(0)}`} color="bg-green-100 text-green-600"  />
          <StatCard icon={Users}        label="Categories"      value={categories?.length ?? '—'}   color="bg-amber-100 text-amber-600"  />
        </div>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <TabBtn active={tab === 'products'}   onClick={() => setTab('products')}   icon={Package}     label="Products" />
          <TabBtn active={tab === 'orders'}     onClick={() => setTab('orders')}     icon={ShoppingBag} label="Orders" />
          <TabBtn active={tab === 'categories'} onClick={() => setTab('categories')} icon={Tag}         label="Categories" />
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* PRODUCTS TAB                                        */}
        {/* ════════════════════════════════════════════════════ */}
        {tab === 'products' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                Product Inventory
              </h2>
              <button
                onClick={() => qc.invalidateQueries({ queryKey: ['products'] })}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {loadingProducts ? (
              <div className="p-8 flex flex-col gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(products ?? []).map((product: Product) => {
                      const img = product.images?.[0]?.startsWith('http')
                        ? product.images[0]
                        : `https://placehold.co/40x40/e0e7ff/4f46e5?text=P`;
                      return (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={img} alt={product.title}
                                className="w-10 h-10 rounded-lg object-cover bg-indigo-50 shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/40x40/e0e7ff/4f46e5?text=P`; }}
                              />
                              <span className="font-medium text-gray-800 line-clamp-1 max-w-[180px]">
                                {product.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 hidden sm:table-cell">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                              {product.category?.name}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-indigo-700">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/products/${product.id}`}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye size={15} />
                              </Link>
                              <Link
                                to={`/admin/products/${product.id}/edit`}
                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </Link>
                              <button
                                onClick={() => setDeleteTarget({ id: product.id, title: product.title })}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(products ?? []).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Package size={36} className="mx-auto mb-3 text-gray-300" />
                    No products found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* ORDERS TAB                                          */}
        {/* ════════════════════════════════════════════════════ */}
        {tab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                All Customer Orders
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_ORDERS.map((order) => {
                    const currentStatus = orderStatuses[order.id] ?? order.status;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-bold text-gray-800">{order.id}</p>
                          <p className="text-xs text-gray-400">{order.items} items</p>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <p className="font-medium text-gray-700">{order.customer}</p>
                          <p className="text-xs text-gray-400">{order.email}</p>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell text-gray-500">
                          {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 font-bold text-indigo-700">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="relative">
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer outline-none transition-all ${STATUS_STYLES[currentStatus]}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* CATEGORIES TAB                                      */}
        {/* ════════════════════════════════════════════════════ */}
        {tab === 'categories' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                Product Categories
              </h2>
              <Link
                to="/admin/categories/new"
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus size={14} /> Add Category
              </Link>
            </div>

            {loadingCats ? (
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(categories ?? []).map((cat: Category) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    <img
                      src={cat.image?.startsWith('http') ? cat.image : `https://placehold.co/48x48/e0e7ff/4f46e5?text=${cat.name[0]}`}
                      alt={cat.name}
                      className="w-12 h-12 rounded-xl object-cover bg-indigo-50 shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/48x48/e0e7ff/4f46e5?text=${cat.name[0]}`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400">slug: {cat.slug}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/admin/categories/${cat.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteCatTarget({ id: cat.id, name: cat.name })}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {(categories ?? []).length === 0 && (
                  <div className="col-span-3 text-center py-10 text-gray-400">
                    <Tag size={32} className="mx-auto mb-2 text-gray-300" />
                    No categories found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Delete product modal ───────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          title={deleteTarget.title}
          isDeleting={deleteProduct.isPending}
          onConfirm={() => deleteProduct.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Delete category modal ──────────────────────────────── */}
      {deleteCatTarget && (
        <DeleteModal
          title={deleteCatTarget.name}
          isDeleting={deleteCategory.isPending}
          onConfirm={() => deleteCategory.mutate(deleteCatTarget.id)}
          onCancel={() => setDeleteCatTarget(null)}
        />
      )}
    </div>
  );
}