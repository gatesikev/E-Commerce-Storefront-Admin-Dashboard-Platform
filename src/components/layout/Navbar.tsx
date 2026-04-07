import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
  Store,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, userRole, user, logout } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-indigo-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link to="/" onClick={close} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors">
            <Store size={16} className="text-white" />
          </div>
          <span
            className="text-xl font-bold text-indigo-900"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Nexus<span className="text-indigo-500">Shop</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
              }`
            }
          >
            <Package size={16} />
            Catalog
          </NavLink>

          {/* Admin link */}
          {userRole === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              <LayoutDashboard size={16} />
              Admin Dashboard
            </NavLink>
          )}

          {/* Cart - authenticated non-admins */}
          {isAuthenticated && userRole !== 'admin' && (
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all"
            >
              <ShoppingCart size={16} />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Profile */}
          {isAuthenticated && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              <User size={16} />
              {user?.name?.split(' ')[0] ?? 'Profile'}
            </NavLink>
          )}
        </div>

        {/* ── Desktop Auth Buttons ── */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
            >
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>

        {/* ── Mobile: Cart badge + Hamburger ── */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && userRole !== 'admin' && (
            <Link to="/cart" onClick={close} className="relative p-2 text-gray-600">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg text-gray-600 hover:bg-indigo-50 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-indigo-100 px-4 py-3 flex flex-col gap-1 shadow-lg">
          <MobileLink to="/" icon={<Package size={17} />} label="Catalog" onClick={close} />

          {userRole === 'admin' && (
            <MobileLink
              to="/admin"
              icon={<LayoutDashboard size={17} />}
              label="Admin Dashboard"
              onClick={close}
            />
          )}

          {isAuthenticated && userRole !== 'admin' && (
            <MobileLink
              to="/cart"
              icon={<ShoppingCart size={17} />}
              label={`Cart${totalItems > 0 ? ` (${totalItems})` : ''}`}
              onClick={close}
            />
          )}

          {isAuthenticated && (
            <MobileLink
              to="/profile"
              icon={<User size={17} />}
              label={user?.name ?? 'Profile'}
              onClick={close}
            />
          )}

          <div className="border-t border-gray-100 mt-2 pt-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={17} />
                Logout
              </button>
            ) : (
              <MobileLink to="/login" icon={<LogIn size={17} />} label="Login" onClick={close} />
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}