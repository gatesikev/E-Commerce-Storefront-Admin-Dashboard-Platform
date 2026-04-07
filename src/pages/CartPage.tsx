import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Tag,
  Package,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const navigate = useNavigate();

  const handleRemove = (productId: number, title: string) => {
    removeItem(productId);
    toast.success(`${title.slice(0, 22)}… removed from cart`);
  };

  const handleClear = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  // ── Empty state ──────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-50 rounded-full mb-6">
          <ShoppingCart size={40} className="text-indigo-300" />
        </div>
        <h2
          className="text-2xl font-bold text-gray-800 mb-2"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          Looks like you haven't added anything yet. Explore our catalog to get started!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <ShoppingBag size={16} />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Shopping Cart
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {totalItems()} item{totalItems() !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={15} /> Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ───────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map(({ product, quantity }) => {
              const image = product.images?.[0]?.startsWith('http')
                ? product.images[0]
                : `https://placehold.co/120x120/e0e7ff/4f46e5?text=Item`;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Product image */}
                  <Link to={`/products/${product.id}`} className="shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-indigo-50">
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://placehold.co/120x120/e0e7ff/4f46e5?text=Item`;
                        }}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full mb-1">
                          <Tag size={10} />
                          {product.category?.name}
                        </span>
                        <Link to={`/products/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug hover:text-indigo-700 transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                        </Link>
                      </div>
                      <button
                        onClick={() => handleRemove(product.id, product.title)}
                        className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Price + quantity row */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mt-auto">
                      <span
                        className="text-lg font-bold text-indigo-700"
                        style={{ fontFamily: 'Syne, sans-serif' }}
                      >
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                      <div className="text-xs text-gray-400">
                        ${product.price.toFixed(2)} each
                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden ml-auto">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-2 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 border-x border-gray-200 min-w-[2.5rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-2 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order Summary ────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2
                className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                <Package size={18} className="text-indigo-500" />
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems()} items)</span>
                  <span className="font-medium">${totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">
                    {totalPrice() >= 50 ? 'Free' : '$4.99'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-medium">${(totalPrice() * 0.08).toFixed(2)}</span>
                </div>

                {totalPrice() < 50 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
                    <ShoppingBag size={13} className="shrink-0 mt-0.5" />
                    Add ${(50 - totalPrice()).toFixed(2)} more to get free shipping!
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span
                    className="text-xl text-indigo-700"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    ${(totalPrice() + (totalPrice() >= 50 ? 0 : 4.99) + totalPrice() * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>

              <Link
                to="/"
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={15} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}