import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, UserPlus, Store, Mail, Lock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginSchema, registerSchema } from '../utils/schemas';
import type { LoginFormData, RegisterFormData } from '../utils/schemas';

// ── Reusable input wrapper ─────────────────────────────────────
function InputField({
  label,
  icon,
  error,
  type = 'text',
  placeholder,
  registration,
  rightElement,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  type?: string;
  placeholder: string;
  registration: object;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white transition-all ${
        error ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200'
      }`}>
        <span className={`shrink-0 ${error ? 'text-red-400' : 'text-gray-400'}`}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder-gray-400"
          {...registration}
        />
        {rightElement}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Login Form ─────────────────────────────────────────────────
function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // Check role from localStorage (set by AuthContext)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        toast.success(`Welcome back, Administrator!`);
        navigate('/admin');
      } else {
        toast.success(`Welcome back, ${user.name}!`);
        navigate('/');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField
        label="Email Address"
        icon={<Mail size={16} />}
        error={errors.email?.message}
        type="email"
        placeholder="you@example.com"
        registration={register('email')}
      />
      <InputField
        label="Password"
        icon={<Lock size={16} />}
        error={errors.password?.message}
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter your password"
        registration={register('password')}
        rightElement={
          <button type="button" onClick={() => setShowPassword((s) => !s)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      {/* Admin hint */}
      <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
        <AlertCircle size={14} className="text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-700">
          <span className="font-semibold">Admin credentials:</span> admin@admin.com / admin123
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-1"
      >
        {isLoading ? (
          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <LogIn size={16} />
        )}
        {isLoading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

// ── Register Form ──────────────────────────────────────────────
function RegisterForm({ onSuccess: _onSuccess }: { onSuccess: () => void }) {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success(`Account created! Welcome, ${data.name}!`);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField
        label="Full Name"
        icon={<User size={16} />}
        error={errors.name?.message}
        placeholder="John Doe"
        registration={register('name')}
      />
      <InputField
        label="Email Address"
        icon={<Mail size={16} />}
        error={errors.email?.message}
        type="email"
        placeholder="you@example.com"
        registration={register('email')}
      />
      <InputField
        label="Password"
        icon={<Lock size={16} />}
        error={errors.password?.message}
        type={showPassword ? 'text' : 'password'}
        placeholder="At least 4 characters"
        registration={register('password')}
        rightElement={
          <button type="button" onClick={() => setShowPassword((s) => !s)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <InputField
        label="Confirm Password"
        icon={<Lock size={16} />}
        error={errors.confirmPassword?.message}
        type={showConfirm ? 'text' : 'password'}
        placeholder="Repeat your password"
        registration={register('confirmPassword')}
        rightElement={
          <button type="button" onClick={() => setShowConfirm((s) => !s)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-1"
      >
        {isLoading ? (
          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <UserPlus size={16} />
        )}
        {isLoading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-12 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Store size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            NexusShop
          </span>
        </Link>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Your ultimate<br />shopping destination.
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Thousands of products. Seamless checkout. Delivered fast.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: '10K+', label: 'Products' },
              { value: '50K+', label: 'Customers' },
              { value: '99%', label: 'Satisfaction' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
                <div className="text-indigo-300 text-sm mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-400 text-sm relative z-10">
          © {new Date().getFullYear()} NexusShop. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#f8f7ff]">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            {/* Mobile logo */}
            <Link to="/" className="flex lg:hidden items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Store size={15} className="text-white" />
              </div>
              <span className="text-lg font-bold text-indigo-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                NexusShop
              </span>
            </Link>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === 'login'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === 'register'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserPlus size={15} /> Register
              </button>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                {tab === 'login' ? 'Welcome back!' : 'Create an account'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {tab === 'login'
                  ? 'Sign in to access your cart and orders.'
                  : 'Join NexusShop and start shopping today.'}
              </p>
            </div>

            {/* Form */}
            {tab === 'login' ? (
              <LoginForm />
            ) : (
              <RegisterForm onSuccess={() => setTab('login')} />
            )}

            {/* Switch tab link */}
            <p className="text-center text-sm text-gray-500 mt-5">
              {tab === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => setTab('register')} className="text-indigo-600 font-semibold hover:underline">
                    Register here
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => setTab('login')} className="text-indigo-600 font-semibold hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}