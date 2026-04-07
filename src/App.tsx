import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import { UserRoute, AdminRoute } from './routes/ProtectedRoutes';

function LoginPage() { return <div className="p-10 text-center text-gray-400">Login page — coming next</div>; }
function CartPage() { return <div className="p-10 text-center text-gray-400">Cart — coming next</div>; }
function CheckoutPage() { return <div className="p-10 text-center text-gray-400">Checkout — coming next</div>; }
function ProfilePage() { return <div className="p-10 text-center text-gray-400">Profile — coming next</div>; }
function ProductDetailPage() { return <div className="p-10 text-center text-gray-400">Product Detail — coming next</div>; }
function AdminPage() { return <div className="p-10 text-center text-gray-400">Admin Dashboard — coming next</div>; }
function AdminProductForm() { return <div className="p-10 text-center text-gray-400">Product Form — coming next</div>; }

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route element={<UserRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
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