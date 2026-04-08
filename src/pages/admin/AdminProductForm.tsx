import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Save, Plus, Trash2, Package, Tag,
  DollarSign, Image, AlertCircle, CheckCircle, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, categoriesApi } from '../../api/client';
import { productSchema } from '../../utils/schemas';
import type { Category } from '../../types';

type FormValues = {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  images: string[];
};

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function StyledInput({ error, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition-all placeholder-gray-400 ${
        error ? 'border-red-400 ring-1 ring-red-200 bg-red-50'
              : 'border-gray-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-white'
      } ${className}`}
      {...props}
    />
  );
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const { register, handleSubmit, control, reset, watch, formState: { errors, isDirty } } =
    useForm<FormValues>({
      resolver: zodResolver(productSchema) as any,
      mode: 'onChange',
      defaultValues: { images: [''] },
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'images' as never });

  const watchedImages = watch('images');
  useEffect(() => {
    if (watchedImages) {
      setPreviewImages((watchedImages as string[]).filter((url) => url?.startsWith('http')));
    }
  }, [watchedImages]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((res) => res.data),
    staleTime: 1000 * 60 * 10,
  });

  const { isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)).then((res) => res.data),
    enabled: isEditing,
    staleTime: 0,
  });

  // Populate form when editing
  const productData = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)).then((res) => res.data),
    enabled: isEditing,
  });

  useEffect(() => {
    if (productData.data) {
      const d = productData.data;
      reset({
        title: d.title,
        description: d.description,
        price: d.price,
        categoryId: d.category?.id,
        images: d.images?.length ? d.images : [''],
      });
    }
  }, [productData.data, reset]);

  const createProduct = useMutation({
    mutationFn: (data: FormValues) => productsApi.create(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      navigate('/admin');
    },
    onError: () => toast.error('Failed to create product.'),
  });

  const updateProduct = useMutation({
    mutationFn: (data: FormValues) => productsApi.update(Number(id), data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Product updated successfully!');
      navigate('/admin');
    },
    onError: () => toast.error('Failed to update product.'),
  });

  const onSubmit = (data: FormValues) => {
    isEditing ? updateProduct.mutate(data) : createProduct.mutate(data);
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  if (isEditing && loadingProduct) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Package size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-xs text-gray-400">{isEditing ? `Editing product #${id}` : 'Fill in the details below'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col gap-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              <FileText size={16} className="text-indigo-500" /> Basic Information
            </h2>

            <Field label="Product Title" error={errors.title?.message} required>
              <StyledInput error={errors.title?.message} placeholder="e.g. Futuristic Running Sneakers" {...register('title')} />
            </Field>

            <Field label="Description (min. 20 characters)" error={errors.description?.message} required>
              <textarea
                rows={4}
                placeholder="Describe the product in detail…"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition-all placeholder-gray-400 resize-none ${
                  errors.description ? 'border-red-400 ring-1 ring-red-200 bg-red-50'
                                     : 'border-gray-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200'
                }`}
                {...register('description')}
              />
              {errors.description && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle size={11} /> {errors.description.message}
                </p>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Price (USD)" error={errors.price?.message} required>
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all ${
                  errors.price ? 'border-red-400 ring-1 ring-red-200 bg-red-50'
                               : 'border-gray-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200 bg-white'
                }`}>
                  <DollarSign size={15} className="text-gray-400 shrink-0" />
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    {...register('price')} />
                </div>
                {errors.price && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} /> {errors.price.message}</p>}
              </Field>

              <Field label="Category" error={errors.categoryId?.message} required>
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all ${
                  errors.categoryId ? 'border-red-400 ring-1 ring-red-200 bg-red-50'
                                    : 'border-gray-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200 bg-white'
                }`}>
                  <Tag size={15} className="text-gray-400 shrink-0" />
                  <select className="flex-1 text-sm text-gray-900 outline-none bg-transparent" {...register('categoryId')}>
                    <option value="">Select a category…</option>
                    {(categories ?? []).map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                {errors.categoryId && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} /> {errors.categoryId.message}</p>}
              </Field>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                <Image size={16} className="text-indigo-500" /> Product Images
              </h2>
              <button type="button" onClick={() => append('' as never)}
                className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                <Plus size={14} /> Add URL
              </button>
            </div>

            {(errors.images as any)?.message && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={11} /> {(errors.images as any).message}
              </p>
            )}

            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className={`flex-1 flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all ${
                    (errors.images as any)?.[index]
                      ? 'border-red-400 ring-1 ring-red-200 bg-red-50'
                      : 'border-gray-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200 bg-white'
                  }`}>
                    <Image size={14} className="text-gray-400 shrink-0" />
                    <input type="url" placeholder={`Image URL ${index + 1} (https://…)`}
                      className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                      {...register(`images.${index}` as const)} />
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {previewImages.length > 0 && (
              <div className="flex gap-3 mt-2 flex-wrap">
                {previewImages.slice(0, 4).map((url, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Link to="/admin" className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <ArrowLeft size={15} /> Cancel
            </Link>
            <button type="submit" disabled={isPending || (!isDirty && !isEditing)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {isPending
                ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : isEditing ? <CheckCircle size={15} /> : <Save size={15} />}
              {isPending ? (isEditing ? 'Saving…' : 'Creating…') : (isEditing ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}