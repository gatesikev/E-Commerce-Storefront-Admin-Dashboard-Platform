import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  Truck,
  Smartphone,
  Banknote,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { checkoutSchema } from '../utils/schemas';
import type { CheckoutFormValues } from '../utils/schemas';

// ── Step indicator ─────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: CheckCircle },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? 'bg-indigo-600 border-indigo-600 text-white'
                  : active ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-gray-200 text-gray-400 bg-white'
              }`}>
                {done ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-indigo-600' : done ? 'text-indigo-400' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all ${done ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reusable field ─────────────────────────────────────────────
function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function Input({
  error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition-all placeholder-gray-400 ${
        error
          ? 'border-red-400 ring-1 ring-red-200 bg-red-50'
          : 'border-gray-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-white'
      }`}
      {...props}
    />
  );
}

// ── Payment method card ────────────────────────────────────────
const PAYMENT_OPTIONS = [
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
  { value: 'PAYPAL', label: 'PayPal', icon: ShoppingBag, desc: 'Pay via PayPal balance' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone, desc: 'MTN, Airtel, M-Pesa' },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when delivered' },
] as const;

// ── Main Page ──────────────────────────────────────────────────
export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { items, totalItems, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
  });

  const selectedPayment = watch('paymentMethod');

  // Empty cart guard
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
          <ShoppingBag size={15} /> Browse Products
        </Link>
      </div>
    );
  }

  // ── Step navigation with validation ───────────────────────────
  const goNext = async () => {
    let fields: (keyof CheckoutFormValues)[] = [];
    if (step === 1) fields = ['fullName', 'shippingAddress', 'city', 'phone', 'email'];
    if (step === 2) fields = ['paymentMethod'];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  // ── Final submit ───────────────────────────────────────────────
  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call (real endpoint would be POST /orders)
      await new Promise((res) => setTimeout(res, 1500));
      console.log('Order placed:', { ...data, items });
      clearCart();
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Order success screen ───────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="page-enter max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
        <p className="text-gray-400 text-sm mb-8">
          A confirmation will be sent to your email. Your order is being processed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            <Package size={16} /> View My Orders
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice() >= 50 ? 0 : 4.99;
  const tax = totalPrice() * 0.08;
  const grandTotal = totalPrice() + shipping + tax;

  return (
    <div className="page-enter">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link to="/cart" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              Checkout
            </h1>
            <p className="text-sm text-gray-400">{totalItems()} item{totalItems() !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Form area ─────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* STEP 1 — Shipping Info */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-indigo-500" />
                    <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                      Shipping Information
                    </h2>
                  </div>

                  <Field label="Full Name *" error={errors.fullName?.message}>
                    <Input error={errors.fullName?.message} placeholder="John Doe" {...register('fullName')} />
                  </Field>

                  <Field label="Email Address *" error={errors.email?.message}>
                    <Input error={errors.email?.message} type="email" placeholder="you@example.com" {...register('email')} />
                  </Field>

                  <Field label="Phone Number * (10 digits)" error={errors.phone?.message}>
                    <Input error={errors.phone?.message} placeholder="0712345678" maxLength={10} {...register('phone')} />
                  </Field>

                  <Field label="Shipping Address *" error={errors.shippingAddress?.message}>
                    <Input error={errors.shippingAddress?.message} placeholder="123 Main Street, Apt 4B" {...register('shippingAddress')} />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City *" error={errors.city?.message}>
                      <Input error={errors.city?.message} placeholder="Kigali" {...register('city')} />
                    </Field>
                    <Field label="Postal Code" error={errors.postalCode?.message}>
                      <Input error={errors.postalCode?.message} placeholder="00100 (optional)" {...register('postalCode')} />
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-indigo-500" />
                    <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                      Payment Method
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = selectedPayment === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-200 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            className="hidden"
                            {...register('paymentMethod')}
                          />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${selected ? 'text-indigo-700' : 'text-gray-700'}`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-gray-400">{opt.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {errors.paymentMethod && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={11} /> {errors.paymentMethod.message}
                    </p>
                  )}
                </div>
              )}

              {/* STEP 3 — Review */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-indigo-500" />
                    <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                      Review Your Order
                    </h2>
                  </div>

                  {/* Items list */}
                  <div className="flex flex-col gap-3">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <img
                          src={product.images?.[0]?.startsWith('http') ? product.images[0] : `https://placehold.co/60x60/e0e7ff/4f46e5?text=Item`}
                          alt={product.title}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/60x60/e0e7ff/4f46e5?text=Item`; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                          <p className="text-xs text-gray-400">Qty: {quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-indigo-700">${(product.price * quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping summary */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-indigo-800 mb-2 flex items-center gap-1.5">
                      <Truck size={14} /> Shipping to
                    </p>
                    <p className="text-gray-600">{watch('fullName')}</p>
                    <p className="text-gray-500">{watch('shippingAddress')}, {watch('city')} {watch('postalCode')}</p>
                    <p className="text-gray-500">{watch('phone')} · {watch('email')}</p>
                  </div>

                  {/* Payment summary */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <CreditCard size={14} /> Payment
                    </p>
                    <p className="text-gray-500">
                      {PAYMENT_OPTIONS.find((o) => o.value === watch('paymentMethod'))?.label ?? '—'}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                {step > 1 ? (
                  <button onClick={goBack} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    <ArrowLeft size={15} /> Back
                  </button>
                ) : (
                  <Link to="/cart" className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    <ArrowLeft size={15} /> Back to Cart
                  </Link>
                )}

                {step < 3 ? (
                  <button onClick={goNext} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                    Continue <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={15} />
                    )}
                    {isSubmitting ? 'Placing Order…' : `Place Order — $${grandTotal.toFixed(2)}`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Order summary sidebar ──────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                <Package size={16} className="text-indigo-500" /> Order Summary
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems()} items)</span>
                  <span>${totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-indigo-700" style={{ fontFamily: 'Syne, sans-serif' }}>
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Mini item list */}
              <div className="mt-4 flex flex-col gap-2">
                {items.slice(0, 3).map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold shrink-0">
                      {quantity}
                    </span>
                    <span className="truncate">{product.title}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-gray-400">+{items.length - 3} more items</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}