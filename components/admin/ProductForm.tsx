"use client";

import React, { useState, useRef, useMemo, JSX } from "react";
import { Product, ProductVariant, ProductImage } from "@/types";
import { uploadProductImage } from "@/lib/firestore/products";
import { X, Upload, Plus, Info, Edit2, Save, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import {
  PRODUCT_CATEGORIES,
  getCategoryType,
  getSizePlaceholder,
  isSizeRequired,
  clothingSizes,
  shoeSizes
} from "@/lib/constants";
import { CompressionOptions } from "@/types/admin";
import { ProductFormProps, GENDER_OPTIONS, LocalImage } from "@/types";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";


export default function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ProductFormProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Data Structure & State ---

  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.isDiscounted ? (initialData.originalPrice || 0) : (initialData?.price || 0),
    originalPrice: initialData?.originalPrice || 0,
    isDiscounted: initialData?.isDiscounted || false,
    category: initialData?.category || "",
    brand: initialData?.brand || "",
    gender: initialData?.gender || GENDER_OPTIONS[1].value,
    material: initialData?.material || "",
    fit: initialData?.fit || "",
    careInstructions: initialData?.careInstructions || "",
    sku: initialData?.sku || "",
    barcode: initialData?.barcode || "",
    images: (initialData?.images?.map(img => typeof img === 'string' ? { url: img, color: "Genel" } : img) || []) as LocalImage[],
    sizes: initialData?.sizes || [],
    colors: initialData?.colors || [],
    inStock: initialData?.inStock ?? true,
    featured: initialData?.featured ?? false,
    hasVariants: initialData?.hasVariants || false,
    variants: initialData?.variants || [],
    slug: initialData?.slug || "",
  });

  const [hasDiscount, setHasDiscount] = useState<boolean>(initialData?.isDiscounted || false);
  const [discountedPrice, setDiscountedPrice] = useState<number>(initialData?.isDiscounted ? initialData.price : 0);

  // Variant Builder State
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  
  // New Variant Inputs
  const [newVariantColor, setNewVariantColor] = useState<string>("");
  const [newVariantSizes, setNewVariantSizes] = useState<string>(""); // Comma separated for manual input
  const [selectedPredefinedSizes, setSelectedPredefinedSizes] = useState<string[]>([]);
  const [newVariantStock, setNewVariantStock] = useState<boolean>(true);
  const [newVariantSku, setNewVariantSku] = useState<string>("");
  const [newVariantBarcode, setNewVariantBarcode] = useState<string>("");

  // Simple Mode Inputs
  const [newSize, setNewSize] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");

  const [uploading, setUploading] = useState<boolean>(false);
  const [compressionStatus, setCompressionStatus] = useState<string>("");

  // --- Derived State ---

  // Derive available colors for image dropdown
  const availableColors: string[] = useMemo(() => {
    if (formData.hasVariants) {
      return Array.from(new Set(variants.map(v => v.color))).filter(Boolean);
    }
    return formData.colors;
  }, [formData.hasVariants, variants, formData.colors]);

  // --- Handlers ---

  const handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleToggle: (name: keyof typeof formData) => void = (name: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // --- 2. Image Upload with Optimistic UI ---

  const handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Create optimistic images
    const newImages: LocalImage[] = fileArray.map(file => ({
      url: URL.createObjectURL(file),
      color: "Genel",
      isUploading: true,
      file: file
    }));
    
    // Add to state immediately
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Process uploads in background
    const compressionOptions: CompressionOptions = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: false,
      fileType: "image/webp" as const,
    };

    // Process each image
    for (const localImg of newImages) {
      try {
        setCompressionStatus("Compressing & Uploading...");
        
        // Compress
        const compressedFile: File = await imageCompression(localImg.file!, compressionOptions);
        
        // Upload
        const url: string = await uploadProductImage(compressedFile);
        
        // Update state with real URL silently
        setFormData(prev => ({
          ...prev,
          images: prev.images.map(img => 
            img.url === localImg.url 
              ? { ...img, url, isUploading: false, file: undefined } 
              : img
          )
        }));
        
        // Cleanup blob URL
        URL.revokeObjectURL(localImg.url);
        
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("Resim yüklenemedi");
        // Remove failed image
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter(img => img.url !== localImg.url)
        }));
      }
    }
    setCompressionStatus("");
  };

  const handleImageColorChange: (index: number, color: string) => void = (index: number, color: string) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages[index] = { ...newImages[index], color };
      return { ...prev, images: newImages };
    });
  };

  const removeImage: (index: number) => void = (index: number) => {
    setFormData((prev) => {
      const imageToRemove = prev.images[index] as LocalImage;
      if (imageToRemove.isUploading && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  };

  // --- Array Helpers (Simple Mode) ---

  const addArrayItem: (field: "sizes" | "colors", value: string, setter: (val: string) => void, inputRef?: React.RefObject<HTMLInputElement | null>) => void = (
    field: "sizes" | "colors",
    value: string,
    setter: (val: string) => void,
    inputRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
    setter("");
    inputRef?.current?.focus();
  };

  const removeArrayItem: (field: "sizes" | "colors", index: number) => void = (field: "sizes" | "colors", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // --- Variant Management ---

  const handleAddVariant: () => void = () => {
    if (!newVariantColor) {
      toast.error("Lütfen bir renk giriniz.");
      return;
    }

    let sizes: string[] = [];
    const categoryType = getCategoryType(formData.category);
    const hasPredefined = categoryType === 'shoes' || categoryType === 'clothing';

    if (hasPredefined) {
      if (selectedPredefinedSizes.length === 0 && isSizeRequired(formData.category)) {
        toast.error("Lütfen en az bir beden seçiniz.");
        return;
      }
      sizes = [...selectedPredefinedSizes];
    } else {
      sizes = newVariantSizes.split(",").map(s => s.trim()).filter(Boolean);
    }

    const newVariant: ProductVariant = {
      color: newVariantColor,
      sizes,
      inStock: newVariantStock,
      sku: newVariantSku,
      barcode: newVariantBarcode
    };

    if (editingVariantIndex !== null) {
      setVariants(prev => prev.map((v, i) => i === editingVariantIndex ? newVariant : v));
      setEditingVariantIndex(null);
      toast.success("Varyasyon güncellendi.");
    } else {
      setVariants([...variants, newVariant]);
      toast.success("Varyasyon eklendi.");
    }

    // Reset fields
    setNewVariantColor("");
    setNewVariantSizes("");
    setSelectedPredefinedSizes([]);
    setNewVariantStock(true);
    setNewVariantSku("");
    setNewVariantBarcode("");
  };

  const handleBarcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e: React.ChangeEvent<HTMLInputElement>) => {
    // sadece numeric olmalı
    const { value } = e.target;
    if (!/^[0-9]*$/.test(value)) {
      return;
    }
    setNewVariantBarcode(value);
  };

  const handleEditVariant: (index: number) => void = (index: number) => {
    const variant = variants[index];
    setEditingVariantIndex(index);
    setNewVariantColor(variant.color);
    setNewVariantStock(variant.inStock);
    setNewVariantSku(variant.sku || "");
    setNewVariantBarcode(variant.barcode || "");

    const categoryType = getCategoryType(formData.category);
    if (categoryType === 'shoes' || categoryType === 'clothing') {
      setSelectedPredefinedSizes(variant.sizes);
      setNewVariantSizes("");
    } else {
      setNewVariantSizes(variant.sizes.join(", "));
      setSelectedPredefinedSizes([]);
    }
  };

  const handleDeleteVariant: (index: number) => void = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
    if (editingVariantIndex === index) {
      setEditingVariantIndex(null);
      // Reset form
      setNewVariantColor("");
      setNewVariantSizes("");
      setSelectedPredefinedSizes([]);
      setNewVariantStock(true);
      setNewVariantSku("");
      setNewVariantBarcode("");
    }
  };

  // --- 3. Smart Validation & Submission ---

  const slugify: (text: string) => string = (text: string) => {
    const trMap: { [key: string]: string } = {
      'ş': 's', 'Ş': 's', 'ı': 'i', 'İ': 'i', 'ğ': 'g', 'Ğ': 'g',
      'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c'
    };
    return text
      .split('')
      .map(char => trMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleSubmit: (e: React.FormEvent) => void = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((formData.images as LocalImage[]).some(img => img.isUploading)) {
      toast.error("Lütfen resimlerin yüklenmesini bekleyin.");
      return;
    }

    setUploading(true);
    setCompressionStatus("Saving product...");

    try {
      // 1. Aggregation
      let finalColors: string[] = formData.colors;
      let finalSizes: string[] = formData.sizes;
      let finalInStock: boolean = formData.inStock;

      if (formData.hasVariants) {
        finalColors = Array.from(new Set(variants.map(v => v.color)));
        finalSizes = Array.from(new Set(variants.flatMap(v => v.sizes)));
        // If any variant is in stock, the product is in stock
        finalInStock = variants.some(v => v.inStock);
      }

      // 2. Validation
      if (formData.hasVariants) {
        if (variants.length === 0) throw new Error("Lütfen en az bir varyasyon ekleyin.");
        
        if (isSizeRequired(formData.category)) {
          const hasSizes = variants.some(v => v.sizes && v.sizes.length > 0);
          if (!hasSizes) throw new Error("Lütfen varyasyonlar için beden giriniz.");
        }
      } else {
        if (isSizeRequired(formData.category) && formData.sizes.length === 0) {
          sizeInputRef.current?.focus();
          throw new Error("Lütfen en az bir beden ekleyin!");
        }
      }

      const slug: string = slugify(formData.name);
      const finalPrice: number = hasDiscount ? discountedPrice : formData.price;

      const cleanImages: ProductImage[] = formData.images.map(img => ({
        url: img.url,
        color: img.color
      }));

      const submitData = {
        ...formData,
        price: finalPrice,
        originalPrice: hasDiscount ? formData.price : undefined,
        isDiscounted: hasDiscount,
        images: cleanImages,
        colors: finalColors,
        sizes: finalSizes,
        inStock: finalInStock,
        variants: formData.hasVariants ? variants : [],
        slug,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };

      if (hasDiscount) {
        submitData.originalPrice = formData.price;
      } else {
        delete submitData.originalPrice;
      }

      await onSubmit(submitData);
      
    } catch (error) {
      console.error("Submit Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ürün kaydedilemedi");
      }
    } finally {
      setUploading(false);
      setCompressionStatus("");
    }
  };

  // --- Render Helpers ---
  
  const renderSizeSelector: () => JSX.Element = () => {
    const categoryType = getCategoryType(formData.category);
    const predefinedSizes = categoryType === 'shoes' ? shoeSizes : categoryType === 'clothing' ? clothingSizes : [];

    if (predefinedSizes.length > 0) {
      return (
        <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-white">
          {predefinedSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setSelectedPredefinedSizes(prev => 
                  prev.includes(size) 
                    ? prev.filter(s => s !== size)
                    : [...prev, size]
                );
              }}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                selectedPredefinedSizes.includes(size)
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      );
    }

    return (
      <input
        type="text"
        placeholder={getSizePlaceholder(formData.category)}
        value={newVariantSizes}
        onChange={(e) => setNewVariantSizes(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Info Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Temel Bilgiler</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Premium Pamuklu T-Shirt"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Ürün detaylarını buraya giriniz..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                <input
                  type="text"
                  name="brand"
                  required
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fiyatlandırma</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satış Fiyatı (₺)</label>
                <input
                  type="number"
                  name="basePrice"
                  required
                  min="0"
                  step="10"
                  value={formData.price === 0 ? "" : formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">İndirim Var mı?</span>
                <button
                  type="button"
                  onClick={() => setHasDiscount(!hasDiscount)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hasDiscount ? "bg-primary-600" : "bg-gray-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${hasDiscount ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              {hasDiscount && (
                <div className="col-span-2 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">İndirimli Fiyat (₺)</label>
                  <input
                    type="number"
                    required={hasDiscount}
                    min="0"
                    step="10"
                    value={discountedPrice === 0 ? "" : discountedPrice}
                    onChange={(e) => setDiscountedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {discountedPrice >= formData.price && discountedPrice > 0 && (
                    <p className="text-xs text-red-500 mt-1">İndirimli fiyat, satış fiyatından düşük olmalıdır.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Variants & Inventory Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Varyasyonlar & Stok</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Gelişmiş Varyasyon Modu</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hasVariants: !prev.hasVariants }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.hasVariants ? "bg-primary-600" : "bg-gray-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.hasVariants ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>

            {formData.hasVariants ? (
              // --- Variant Builder UI ---
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {editingVariantIndex !== null ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingVariantIndex !== null ? "Varyasyonu Düzenle" : "Yeni Varyasyon Ekle"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Renk</label>
                      <input
                        type="text"
                        placeholder="Örn: Kırmızı"
                        value={newVariantColor}
                        onChange={(e) => setNewVariantColor(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Bedenler {getCategoryType(formData.category) === "accessories" && <span className="text-gray-400 font-normal">(Opsiyonel)</span>}
                      </label>
                      {renderSizeSelector()}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU (Opsiyonel)</label>
                      <input
                        type="text"
                        value={newVariantSku}
                        onChange={(e) => setNewVariantSku(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Barkod (Opsiyonel)</label>
                      <input
                        type="text"
                        value={newVariantBarcode}
                        onChange={handleBarcodeChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newVariantStock}
                        onChange={(e) => setNewVariantStock(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Stokta Var</span>
                    </label>

                    <div className="flex gap-2">
                      {editingVariantIndex !== null && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setEditingVariantIndex(null);
                            setNewVariantColor("");
                            setNewVariantSizes("");
                            setSelectedPredefinedSizes([]);
                            setNewVariantStock(true);
                            setNewVariantSku("");
                            setNewVariantBarcode("");
                          }}
                          size="sm"
                        >
                          İptal
                        </Button>
                      )}
                      <Button
                        type="button"
                        onClick={handleAddVariant}
                        size="sm"
                        className={editingVariantIndex !== null ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {editingVariantIndex !== null ? "Güncelle" : "Ekle"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Variants List */}
                <div className="space-y-2">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          {variant.color.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{variant.color}</p>
                          <p className="text-xs text-gray-500">
                            {variant.sizes.length > 0 ? variant.sizes.join(", ") : "Standart Beden"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-500">SKU: {variant.sku || "-"}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variant.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {variant.inStock ? "Stokta" : "Tükendi"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditVariant(index)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {variants.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      Henüz varyasyon eklenmedi.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // --- Simple Mode UI ---
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedenler</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        ref={sizeInputRef}
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addArrayItem("sizes", newSize, setNewSize, sizeInputRef))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Beden ekle..."
                      />
                      <Button type="button" onClick={() => addArrayItem("sizes", newSize, setNewSize, sizeInputRef)} size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.sizes.map((size, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {size}
                          <button type="button" onClick={() => removeArrayItem("sizes", index)} className="ml-1.5 text-gray-400 hover:text-gray-600">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Renkler</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        ref={colorInputRef}
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addArrayItem("colors", newColor, setNewColor, colorInputRef))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Renk ekle..."
                      />
                      <Button type="button" onClick={() => addArrayItem("colors", newColor, setNewColor, colorInputRef)} size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map((color, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {color}
                          <button type="button" onClick={() => removeArrayItem("colors", index)} className="ml-1.5 text-gray-400 hover:text-gray-600">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Genel Stok Durumu</span>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.inStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{formData.inStock ? "Stokta Var" : "Stokta Yok"}</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Organization & Media */}
        <div className="space-y-8">
          
          {/* Organization Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Organizasyon</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materyal</label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: %100 Pamuk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kalıp (Fit)</label>
                <input
                  type="text"
                  name="fit"
                  value={formData.fit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Slim Fit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bakım Talimatları</label>
                <textarea
                  name="careInstructions"
                  rows={3}
                  value={formData.careInstructions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="30 derecede yıkayınız..."
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Öne Çıkan Ürün</span>
                  <button
                    type="button"
                    onClick={() => handleToggle("featured")}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.featured ? "bg-primary-600" : "bg-gray-200"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.featured ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Görseller</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {formData.images.map((img, index) => {
                const localImg = img as LocalImage;
                return (
                  <div key={`image-${index}`} className="relative group border rounded-lg p-2 bg-gray-50 flex flex-col">
                    <div className="relative aspect-square mb-2 w-full">
                      <Image
                        src={img.url}
                        alt={`Product ${index + 1}`}
                        fill
                        className={`object-cover rounded-md ${localImg.isUploading ? 'opacity-50' : ''}`}
                      />
                      {localImg.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    
                    {/* Color Selection for Image */}
                    <div className="mt-auto">
                      {availableColors.length > 0 ? (
                        <select
                          value={img.color || "Genel"}
                          onChange={(e) => handleImageColorChange(index, e.target.value)}
                          className="w-full text-xs border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 py-1"
                        >
                          <option value="Genel">Genel (Hepsi)</option>
                          {availableColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5 p-1.5 bg-orange-50 border border-orange-100 rounded-md">
                          <Info className="w-3 h-3 text-orange-500 flex-shrink-0" />
                          <span className="text-[10px] text-orange-600 font-medium leading-tight">
                            Renk seçmek için varyasyon ekleyin.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 font-medium">Görsel Yükle</span>
                  </>
                )}
              </button>
            </div>
            
            {compressionStatus && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs text-blue-700 font-medium">{compressionStatus}</span>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-4 z-10">
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="w-full h-12 text-base font-semibold shadow-lg"
            >
              {isSubmitting || uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Ürünü Kaydet
                </>
              )}
            </Button>
          </div>

        </div>
      </div>
    </form>
  );
}
