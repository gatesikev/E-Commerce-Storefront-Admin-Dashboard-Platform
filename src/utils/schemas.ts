import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required').refine((v) => v.trim().length > 0, 'Cannot be empty spaces'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  images: z.array(z.string().url('Each image must be a valid URL')).min(1, 'At least one image URL is required'),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  email: z.string().email('Enter a valid email address'),
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY'], {
    message: 'Please select a payment method',
  }),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').trim(),
  image: z.string().url('Must be a valid image URL'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;