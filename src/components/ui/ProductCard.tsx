import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const { isAuthenticated, userRole } = useAuth();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please log in to add items to your cart'); return; }
    addItem(product);
    toast.success(`${product.title.slice(0, 24)}… added to cart!`);
  };

  const image = product.images?.[0]?.startsWith('http')
    ? product.images[0]
    : `https://placehold.co/400x300/e0e7ff/4f46e5?text=No+Image`;

  return (
    <Link to={`/products/${product.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-indigo-200 transition-all duration-300 flex flex-col">
      <div className="relative overflow-hidden bg-indigo-50 aspect-video">
        <img src={image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x300/e0e7ff/4f46e5?text=No+Image`; }} />
        <span className="absolute top-3 left-3 bg-white/90 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
          {product.category?.name ?? 'Uncategorized'}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">{product.title}</h3>
          <p className="mt-1 text-xs text-gray-400 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-lg font-bold text-indigo-700">${product.price.toFixed(2)}</span>
          <div className="flex gap-2">
            <Link to={`/products/${product.id}`} onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors" title="View details">
              <Eye size={16} />
            </Link>
            {userRole !== 'admin' && (
              <button onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                <ShoppingCart size={14} />Add
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}