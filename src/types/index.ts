export type UserRole = 'admin' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: Category;
  images: string[];
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  images: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'MOBILE_MONEY' | 'CASH_ON_DELIVERY';

export interface CheckoutFormData {
  fullName: string;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
}