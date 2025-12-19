"use client";

import React, { useState, useRef, useMemo, useEffect, JSX } from "react";
import { Product, ProductImage, ProductVariant } from "@/types";
import { useVariations } from "@/hooks/useVariations";
import { uploadProductImage } from "@/lib/firestore/products";
import { X, Upload, Plus, Info, Save, Loader2, Trash2, ChevronDown, Star } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import {
  PRODUCT_CATEGORIES,
  getCategoryType,
  getSizePlaceholder,
  isSizeRequired,
  clothingSizes,
  shoeSizes,
  GENDER_OPTIONS
} from "@/lib/constants";
import { CompressionOptions } from "@/types/admin";
import { ProductFormProps, LocalImage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import { Variation, generateUUID } from "@/types/variations";


export default function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ProductFormProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Data Structure & State ---
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Convert existing ProductVariant[] to Variation[] format for editing
  const initialVariationsFromProps: Variation[] = useMemo(() => {
    if (!initialData?.variants || initialData.variants.length === 0) {
      return [];
    }
    
    // Flatten ProductVariant (which has sizes: string[]) into Variation (which has size: string)
    const flattened: Variation[] = [];
    initialData.variants.forEach((variant: ProductVariant) => {
      variant.sizes.forEach((size: string) => {
        flattened.push({
          id: generateUUID(),
          color: variant.color,
          size: size,
          sku: variant.sku || `${initialData.name?.toUpperCase().replace(/\s+/g, '')}-${variant.color.toUpperCase()}-${size}`,
          barcode: variant.barcode || "",
          stockStatus: variant.inStock,
        });
      });
    });
    return flattened;
  }, [initialData?.variants, initialData?.name]);

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
    images: (initialData?.images?.map(img => typeof img === 'string' ? { url: img, color: initialData?.colors?.[0] || "" } : img) || []) as LocalImage[],
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
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(initialData?.primaryImageIndex ?? 0);

  // Variant Builder State - Using custom hook with initial data from existing product
  const {
    variations,
    addVariations,
    updateVariation,
    removeVariation,
    removeByColor,
    getUniqueColors,
    getUniqueSizes,
    hasInStock,
    reset: resetVariations,
    groupedByColor,
  } = useVariations(initialVariationsFromProps);

  // New Variant Input State
  const [newVariantColor, setNewVariantColor] = useState<string>("");
  const [selectedPredefinedSizes, setSelectedPredefinedSizes] = useState<string[]>([]);
  const [newVariantSizes, setNewVariantSizes] = useState<string>(""); // Comma separated for manual input
  const [newVariantStock, setNewVariantStock] = useState<boolean>(true);
  const [newVariantBarcode, setNewVariantBarcode] = useState<string>("");

  // Simple Mode Inputs
  const [newSize, setNewSize] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [compressionStatus, setCompressionStatus] = useState<string>("");
  
  // Expanded color groups for accordion
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set());

  // --- Derived State ---

  // Derive available colors for image dropdown
  const availableColors: string[] = useMemo(() => {
    if (formData.hasVariants) {
      return getUniqueColors();
    }
    return formData.colors;
  }, [formData.hasVariants, variations, formData.colors, getUniqueColors]);

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
    
    // Create optimistic images - default to first available color
    const defaultColor: string = getUniqueColors()[0] || formData.colors[0] || "";
    const newImages: LocalImage[] = fileArray.map(file => ({
      url: URL.createObjectURL(file),
      color: defaultColor,
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

  // --- Variant Management (Flat Array) ---

  const handleAddVariation: () => void = (): void => {
    if (!newVariantColor) {
      toast.error("Lütfen bir renk giriniz.");
      return;
    }

    let sizes: string[] = [];
    const categoryType: string = getCategoryType(formData.category);
    const hasPredefined: boolean = categoryType === 'shoes' || categoryType === 'clothing';

    if (hasPredefined) {
      if (selectedPredefinedSizes.length === 0 && isSizeRequired(formData.category)) {
        toast.error("Lütfen en az bir beden seçiniz.");
        return;
      }
      sizes = [...selectedPredefinedSizes];
    } else {
      sizes = newVariantSizes.split(",").map(s => s.trim()).filter(Boolean);
      if (sizes.length === 0) {
        sizes = ["Standard"];
      }
    }

    // Add variations using hook (includes duplicate validation and auto-SKU)
    const success: boolean = addVariations({
      productName: formData.name || "URUN",
      color: newVariantColor,
      sizes,
      stockStatus: newVariantStock,
      barcode: newVariantBarcode,
    });

    if (success) {
      toast.success(`${sizes.length} varyasyon eklendi.`);
      // Reset fields
      setNewVariantColor("");
      setNewVariantSizes("");
      setSelectedPredefinedSizes([]);
      setNewVariantStock(true);
      setNewVariantBarcode("");
    }
  };

  const handleBarcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    if (!/^[0-9]*$/.test(value)) {
      return;
    }
    setNewVariantBarcode(value);
  };

  const handleDeleteVariation: (id: string) => void = (id: string): void => {
    if (confirm("Bu varyasyonu silmek istediğinize emin misiniz?")) {
      removeVariation(id);
      toast.success("Varyasyon silindi.");
    }
  };

  const handleToggleStock: (id: string, currentStatus: boolean) => void = (id: string, currentStatus: boolean): void => {
    updateVariation(id, { stockStatus: !currentStatus });
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
        finalColors = getUniqueColors();
        finalSizes = getUniqueSizes();
        finalInStock = hasInStock();
      }

      // 2. Validation
      if (formData.hasVariants) {
        if (variations.length === 0) throw new Error("Lütfen en az bir varyasyon ekleyin.");
        
        if (isSizeRequired(formData.category)) {
          const variationHasSizes = variations.some(v => v.size && v.size !== "Standard");
          if (!variationHasSizes) throw new Error("Lütfen varyasyonlar için beden giriniz.");
        }
      } else {
        if (isSizeRequired(formData.category) && formData.sizes.length === 0) {
          sizeInputRef.current?.focus();
          throw new Error("Lütfen en az bir beden ekleyin!");
        }
      }

      const slug: string = slugify(formData.name);
      const finalPrice: number = hasDiscount ? discountedPrice : formData.price;

      // Reorder images: primary image first, then same color images, then others
      const rawImages: ProductImage[] = formData.images.map(img => ({
        url: img.url,
        color: img.color
      }));
      
      let orderedImages: ProductImage[] = [...rawImages];
      if (primaryImageIndex > 0 && primaryImageIndex < rawImages.length) {
        const primaryImg = rawImages[primaryImageIndex];
        const primaryColor = primaryImg.color;
        
        // Remove primary image from array
        orderedImages = rawImages.filter((_, idx) => idx !== primaryImageIndex);
        
        // Split into same color and other colors
        const sameColorImages = orderedImages.filter(img => img.color === primaryColor);
        const otherImages = orderedImages.filter(img => img.color !== primaryColor);
        
        // Reorder: primary first, then same color, then others
        orderedImages = [primaryImg, ...sameColorImages, ...otherImages];
      }

      // Map Flat Array variations to ProductVariant format
      // We accept that 'sizes' will contain only 1 item per variant to preserve unique SKUs/Barcodes for each size-color combo
      const productVariants: ProductVariant[] = formData.hasVariants 
        ? variations.map(v => ({
            color: v.color,
            sizes: [v.size],
            inStock: v.stockStatus,
            sku: v.sku,
            barcode: v.barcode,
          }))
        : [];

      const submitData = {
        ...formData,
        price: finalPrice,
        originalPrice: hasDiscount ? formData.price : undefined,
        isDiscounted: hasDiscount,
        images: orderedImages, // Use reordered images
        primaryImageIndex: 0, // Always 0 since we reordered
        colors: finalColors,
        sizes: finalSizes,
        inStock: finalInStock,
        variants: productVariants,
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
      const allSelected = predefinedSizes.every(size => selectedPredefinedSizes.includes(size));
      
      return (
        <div className="space-y-2">
          {/* Select All / Clear All buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (allSelected) {
                  setSelectedPredefinedSizes([]);
                } else {
                  setSelectedPredefinedSizes([...predefinedSizes]);
                }
              }}
              className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                allSelected 
                  ? "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200" 
                  : "bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
              }`}
            >
              {allSelected ? "Temizle" : "Hepsini Seç"}
            </button>
            {selectedPredefinedSizes.length > 0 && !allSelected && (
              <span className="text-xs text-gray-500 self-center">
                {selectedPredefinedSizes.length} seçili
              </span>
            )}
          </div>
          {/* Size buttons */}
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
          
          {/* Custom size input */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Özel beden (örn: 35, 36, 37)"
              value={newVariantSizes}
              onChange={(e) => setNewVariantSizes(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md"
            />
            <span className="text-xs text-gray-400">veya yazın</span>
          </div>
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
                <Input
                  type="number"
                  name="basePrice"
                  required
                  min="0"
                  value={formData.price === 0 ? "" : formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Switch
                  checked={hasDiscount}
                  onCheckedChange={(checked) => {
                    setHasDiscount(checked);
                    if (!checked) {
                      setDiscountedPrice(0);
                    }
                  }}
                  label="İndirim Var mı?"
                />
              </div>

              {hasDiscount && (
                <div className="col-span-2 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">İndirimli Fiyat (₺)</label>
                  <Input
                    type="number"
                    required={hasDiscount}
                    min="0"
                    value={discountedPrice === 0 ? "" : discountedPrice}
                    onChange={(e) => setDiscountedPrice(parseFloat(e.target.value) || 0)}
                    error={discountedPrice >= formData.price && discountedPrice > 0 ? "İndirimli fiyat, satış fiyatından düşük olmalıdır." : undefined}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Variants & Inventory Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Varyasyonlar & Stok</h3>
              <div className="flex items-center">
                <Switch
                  checked={formData.hasVariants}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, hasVariants: checked }));
                    if (!checked) {
                      // Reset variant builder fields
                      resetVariations();
                      setNewVariantColor("");
                      setNewVariantSizes("");
                      setSelectedPredefinedSizes([]);
                      setNewVariantStock(true);
                      setNewVariantBarcode("");
                    }
                  }}
                  label="Gelişmiş Varyasyon Modu"
                  className="min-w-[200px] gap-4"
                />
              </div>
            </div>

            {formData.hasVariants ? (
              // --- Variant Builder UI (Flat Array) ---
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Varyasyon Ekle
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    SKU otomatik oluşturulur (ÜRÜN-RENK-BEDEN formatında)
                  </p>
                  
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">Barkod (Opsiyonel)</label>
                      <input
                        type="text"
                        value={newVariantBarcode}
                        onChange={handleBarcodeChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center space-x-2 cursor-pointer pb-2">
                        <input 
                          type="checkbox" 
                          checked={newVariantStock}
                          onChange={(e) => setNewVariantStock(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Stokta Var</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={handleAddVariation}
                      size="sm"
                    >
                      Ekle
                    </Button>
                  </div>
                </div>


                {/* Color-Grouped Variations with Accordion */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Varyasyonlar ({hasMounted ? variations.length : "..."})
                  </h4>
                  
                  {!hasMounted ? (
                    // Skeleton Loader
                    <div className="space-y-2">
                         {[1, 2, 3].map((i) => (
                           <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg animate-pulse">
                             <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-full bg-gray-200" />
                               <div className="space-y-2">
                                 <div className="h-4 w-32 bg-gray-200 rounded" />
                                 <div className="h-3 w-24 bg-gray-200 rounded" />
                               </div>
                             </div>
                             <div className="flex gap-2">
                               <div className="h-6 w-16 bg-gray-200 rounded" />
                               <div className="h-8 w-8 bg-gray-200 rounded" />
                             </div>
                           </div>
                         ))}
                    </div>
                  ) : Object.keys(groupedByColor).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      Henüz varyasyon eklenmedi.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(groupedByColor).map(([color, colorVariations]) => {
                        const isExpanded = expandedColors.has(color);
                        const inStockCount = colorVariations.filter(v => v.stockStatus).length;
                        
                        return (
                          <div key={color} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Color Header */}
                            <div className="flex items-center justify-between p-3 bg-gray-50">
                              {/* Clickable area for expand/collapse */}
                              <div 
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  setExpandedColors(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(color)) {
                                      newSet.delete(color);
                                    } else {
                                      newSet.add(color);
                                    }
                                    return newSet;
                                  });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setExpandedColors(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(color)) {
                                        newSet.delete(color);
                                      } else {
                                        newSet.add(color);
                                      }
                                      return newSet;
                                    });
                                  }
                                }}
                                className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-gray-100 -m-3 p-3 rounded-l-lg transition-colors"
                              >
                                <ChevronDown 
                                  className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                />
                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                                  {color.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{color}</span>
                                <span className="text-xs text-gray-500">
                                  ({colorVariations.length} beden, {inStockCount} stokta)
                                </span>
                              </div>
                              
                              {/* Delete button with AlertDialog */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    type="button"
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>&quot;{color}&quot; rengini silmek istiyor musunuz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu işlem &quot;{color}&quot; rengindeki {colorVariations.length} varyasyonu silecektir. Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        removeByColor(color);
                                        toast.success(`"${color}" rengi silindi.`);
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            
                            {/* Expandable Size List */}
                            {isExpanded && (
                              <div className="border-t border-gray-200 divide-y divide-gray-100">
                                {colorVariations.map((variation) => (
                                  <div 
                                    key={variation.id} 
                                    className="flex items-center justify-between px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium text-gray-700 w-12">{variation.size}</span>
                                      <span className="text-xs text-gray-400 font-mono">{variation.sku}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStock(variation.id, variation.stockStatus)}
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                                          variation.stockStatus 
                                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                            : "bg-red-100 text-red-800 hover:bg-red-200"
                                        }`}
                                      >
                                        {variation.stockStatus ? "Stokta" : "Tükendi"}
                                      </button>
                                      
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <button
                                            type="button"
                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Varyasyonu silmek istiyor musunuz?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              {variation.color} - {variation.size} varyasyonunu silmek üzeresiniz. Bu işlem geri alınamaz.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => {
                                                removeVariation(variation.id);
                                                toast.success("Varyasyon silindi.");
                                              }}
                                              className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                              Sil
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // --- Simple Mode UI ---
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
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
                <Switch
                  checked={formData.featured}
                  onCheckedChange={() => handleToggle("featured")}
                  label="Öne Çıkan Ürün"
                />
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Görseller</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {formData.images.map((img, index) => {
                const localImg = img as LocalImage;
                const isPrimary: boolean = index === primaryImageIndex;
                return (
                  <div 
                    key={`image-${index}`} 
                    className={`relative group border-2 rounded-lg p-2 bg-gray-50 flex flex-col ${
                      isPrimary ? 'border-primary-400 bg-primary-50' : 'border-gray-200'
                    }`}
                  >
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
                      
                      {/* Primary image indicator/button */}
                      <button
                        type="button"
                        onClick={() => setPrimaryImageIndex(index)}
                        className={`absolute top-1 left-1 p-1 rounded-full shadow-sm transition-all ${
                          isPrimary 
                            ? 'bg-primary-400 text-white' 
                            : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-primary-100 hover:text-primary-500'
                        }`}
                        title={isPrimary ? "Ana görsel" : "Ana görsel yap"}
                      >
                        <Star className={`w-4 h-4 ${isPrimary ? 'fill-white' : ''}`} />
                      </button>
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => {
                          removeImage(index);
                          // Adjust primary index if needed
                          if (index === primaryImageIndex && formData.images.length > 1) {
                            setPrimaryImageIndex(0);
                          } else if (index < primaryImageIndex) {
                            setPrimaryImageIndex(prev => prev - 1);
                          }
                        }}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    {/* Primary badge */}
                    {isPrimary && (
                      <div className="text-[10px] text-primary-700 font-medium text-center mb-1">
                        ⭐ Ana Görsel
                      </div>
                    )}
                    
                    {/* Color Selection for Image */}
                    <div className="mt-auto">
                      {availableColors.length > 0 ? (
                        <select
                          value={img.color || availableColors[0]}
                          onChange={(e) => handleImageColorChange(index, e.target.value)}
                          className="w-full text-xs border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 py-1"
                        >
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
