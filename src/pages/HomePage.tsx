import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, ShoppingBag, TrendingUp, Shield, Truck } from 'lucide-react';
import { categoriesApi, productsApi } from '../api/client';
import ProductCard from '../components/ui/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import type { Category } from '../types';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  // ── Fetch categories ─────────────────────────────────────────
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data),
    staleTime: 1000 * 60 * 10, // cache 10 min
  });

  // ── Fetch products ───────────────────────────────────────────
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () =>
      productsApi
        .getAll({ limit: 60, ...(selectedCategory ? { categoryId: selectedCategory } : {}) })
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  // ── Client-side filter + sort ────────────────────────────────
  const filtered = (products ?? [])
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="page-enter">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <TrendingUp size={14} />
              New arrivals this week
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold leading-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Shop the Future.
              <br />
              <span className="text-indigo-300">Discover More.</span>
            </h1>
            <p className="mt-4 text-indigo-200 text-lg max-w-lg">
              Explore thousands of products across every category. Quality guaranteed, delivered to
              your door.
            </p>

            {/* Hero search */}
            <div className="mt-8 flex items-center bg-white rounded-xl shadow-xl overflow-hidden max-w-md">
              <Search size={18} className="ml-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-3.5 text-gray-900 text-sm outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="mr-3 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-5">
              {[
                { icon: Shield, label: 'Secure Checkout' },
                { icon: Truck, label: 'Free Shipping over $50' },
                { icon: ShoppingBag, label: '30-Day Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-indigo-200">
                  <Icon size={16} className="text-indigo-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Pills ─────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories?.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Grid ───────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              {selectedCategory
                ? categories?.find((c: Category) => c.id === selectedCategory)?.name ?? 'Products'
                : 'All Products'}
            </h2>
            {!isLoading && (
              <p className="text-sm text-gray-400 mt-0.5">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                {search ? ` for "${search}"` : ''}
              </p>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* States */}
        {isLoading && <ProductGridSkeleton />}

        {isError && (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Failed to load products. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No products found.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory(null); }}
              className="mt-4 text-indigo-600 hover:underline text-sm font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}