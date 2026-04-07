import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Package,
  Shield,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../api/client';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';


export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)).then((r) => r.data),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    if (!product) return;
    for (let i = 0; i < quantity; i++) addItem(product);
    toast.success(`${quantity}× ${product.title.slice(0, 20)}… added to cart!`);
  };

  // Clean up image URLs
  const images =
    product?.images
      ?.map((img) => (img.startsWith('http') ? img : null))
      .filter(Boolean) as string[] ?? [];

  if (images.length === 0 && product) {
    images.push(`https://placehold.co/600x500/e0e7ff/4f46e5?text=${encodeURIComponent(product.title.slice(0, 12))}`);
  }

  const prevImage = () => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-5 bg-gray-100 rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package size={56} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Product not found</h2>
        <p className="text-gray-400 mb-6">This product may have been removed or doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Catalog
          </Link>
          <span>/</span>
          <span className="text-indigo-600 font-medium">{product.category?.name}</span>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Image Gallery ──────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative bg-indigo-50 rounded-3xl overflow-hidden aspect-square group">
              <img
                src={images[activeImage]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://placehold.co/600x500/e0e7ff/4f46e5?text=No+Image`;
                }}
              />
              {/* Nav arrows — only show if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === activeImage ? 'bg-indigo-600 w-4' : 'bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImage
                        ? 'border-indigo-500 shadow-md'
                        : 'border-transparent hover:border-indigo-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://placehold.co/80x80/e0e7ff/4f46e5?text=${i + 1}`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ───────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
                <Tag size={12} />
                {product.category?.name ?? 'Uncategorized'}
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-3xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {product.title}
            </h1>

            {/* Mock rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">4.0 (128 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl font-bold text-indigo-700"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${(product.price * 1.2).toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                20% off
              </span>
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity + Add to Cart */}
            {userRole !== 'admin' && (
              <div className="flex flex-col gap-3 pt-2">
                {/* Quantity selector */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors font-bold"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-gray-900 border-x border-gray-200 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                >
                  <ShoppingCart size={18} />
                  Add {quantity > 1 ? `${quantity} items` : 'to Cart'} — $
                  {(product.price * quantity).toFixed(2)}
                </button>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {[
                { icon: Shield, label: 'Secure Payment' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: RotateCcw, label: '30-Day Returns' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center"
                >
                  <Icon size={18} className="text-indigo-500" />
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}