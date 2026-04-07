import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import { UserRoute, AdminRoute } from './routes/ProtectedRoutes';

// Placeholders — will be replaced as we build each page
function AdminPage() { return <div className="p-10 text-center text-gray-400">Admin Dashboard — coming next</div>; }
function AdminProductForm() { return <div className="p-10 text-center text-gray-400">Product Form — coming next</div>; }

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Protected — User */}
        <Route element={<UserRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Protected — Admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/products/new" element={<AdminProductForm />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
        </Route>

        <Route path="*" element={<div className="p-10 text-center">404 — Not found</div>} />
      </Routes>
    </div>
  );
}