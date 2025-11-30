"use client";

import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductVariant, ProductImage, ProductGender } from "@/types";
import { uploadProductImage } from "@/lib/firestore/products";
import { X, Upload, Plus, Info, Edit2, RotateCcw } from "lucide-react";
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
import { useAlert } from "@/contexts/AlertContext";
import { ProductFormProps } from "@/types";
import { Button } from "@/components/ui/button";

type LocalImage = ProductImage & { isUploading?: boolean; file?: File };



export default function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ProductFormProps): React.JSX.Element {
  const router = useRouter();
  const { showError } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.isDiscounted ? (initialData.originalPrice || 0) : (initialData?.price || 0),
    originalPrice: initialData?.originalPrice || 0,
    isDiscounted: initialData?.isDiscounted || false,
    category: initialData?.category || "",
    brand: initialData?.brand || "",
    gender: initialData?.gender || "Female",
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

  const [newSize, setNewSize] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");
  
  // Variant Management State
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);
  const [newVariantColor, setNewVariantColor] = useState<string>("");
  const [newVariantSizes, setNewVariantSizes] = useState<string>(""); // Comma separated
  const [selectedPredefinedSizes, setSelectedPredefinedSizes] = useState<string[]>([]);
  const [newVariantStock, setNewVariantStock] = useState<boolean>(true);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  const [uploading, setUploading] = useState<boolean>(false);
  // Removed selectedFiles and previewUrls as they are now integrated into formData.images
  const [compressionStatus, setCompressionStatus] = useState<string>("");

  // Derive available colors based on mode
  const availableColors: string[] = useMemo(() => {
    if (formData.hasVariants) {
      return Array.from(new Set(variants.map(v => v.color))).filter(Boolean);
    }
    return formData.colors;
  }, [formData.hasVariants, variants, formData.colors]);

  const handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  const handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
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
        const compressedFile = await imageCompression(localImg.file!, compressionOptions);
        
        // Upload
        const url = await uploadProductImage(compressedFile);
        
        // Update state with real URL
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
        showError("Resim yüklenemedi");
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
      // If it was a blob URL, revoke it
      if (imageToRemove.isUploading && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return {
        ...prev,
        images: prev.images.filter((_, i: number) => i !== index),
      };
    });
  };

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
    
    // Auto-focus input after adding item
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  };

  const removeArrayItem: (field: "sizes" | "colors", index: number) => void = (field: "sizes" | "colors", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

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

  const handleSubmit: (e: React.FormEvent) => Promise<void> = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for uploading images
    if ((formData.images as LocalImage[]).some(img => img.isUploading)) {
      showError("Lütfen resimlerin yüklenmesini bekleyin.");
      return;
    }

    setUploading(true);
    setCompressionStatus("Saving product...");

    try {
      // 1. Aggregation (Prepare data for validation and submission)
      let finalColors: string[] = formData.colors;
      let finalSizes: string[] = formData.sizes;
      let finalInStock: boolean = formData.inStock;

      if (formData.hasVariants) {
        finalColors = Array.from(new Set(variants.map(v => v.color)));
        finalSizes = Array.from(new Set(variants.flatMap(v => v.sizes)));
        finalInStock = variants.some(v => v.inStock);
      }
      
      // 2. Validation
      if (formData.hasVariants) {
        // Check if at least one variant exists
        if (variants.length === 0) throw new Error("Lütfen en az bir varyasyon ekleyin.");
        
        // Check if sizes are required for this category (e.g. Shoes/Clothes)
        if (isSizeRequired(formData.category)) {
          const hasSizes = variants.some(v => v.sizes && v.sizes.length > 0);
          if (!hasSizes) throw new Error("Lütfen varyasyonlar için beden giriniz.");
        }
      } else {
        // Legacy check (Existing logic for Simple Mode)
        if (isSizeRequired(formData.category) && formData.sizes.length === 0) {
          sizeInputRef.current?.focus();
          throw new Error("Lütfen en az bir beden ekleyin!");
        }
      }
      
      const slug: string = slugify(formData.name);

      // Calculate final prices based on discount state
      const finalPrice = hasDiscount ? discountedPrice : formData.price;

      // Sanitize images (remove LocalImage props)
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
        showError(error.message);
      } else {
        showError("Ürün kaydedilemedi");
      }
    } finally {
      setUploading(false);
      setCompressionStatus("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Temel Bilgiler</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Adı
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Fiyatlandırma</h4>
            
            {/* Base Price Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Satış Fiyatı (₺)
              </label>
              <input
                type="number"
                name="basePrice" // Temporary field for form handling
                required
                min="0"
                step="10"
                value={formData.price === 0 ? "" : formData.price} // This represents the Base Price in the form UI
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, price: val }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Discount Toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Bu Üründe İndirim Var mı?</span>
              <button
                type="button"
                onClick={() => setHasDiscount(!hasDiscount)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hasDiscount ? "bg-primary-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hasDiscount ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Discounted Price Input (Conditional) */}
            {hasDiscount && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İndirimli Fiyat (₺)
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  required={hasDiscount}
                  min="0"
                  step="0.01"
                  value={discountedPrice === 0 ? "" : discountedPrice}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    setDiscountedPrice(val);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {discountedPrice >= formData.price && discountedPrice > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    İndirimli fiyat, satış fiyatından düşük olmalıdır.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Kategori Seçin</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marka
              </label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cinsiyet
              </label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="Male">Erkek</option>
                <option value="Female">Kadın</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images & Variants */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Görseller</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
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
                        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  
                  {/* Color Selection for Image */}
                  <div className="mt-auto">
                    {availableColors.length > 0 ? (
                      <>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          BU FOTO HANGİ RENK?
                        </label>
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
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 p-2 bg-orange-50 border border-orange-100 rounded-md">
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
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Yükle</span>
                  </>
                )}
              </button>
            </div>
            {compressionStatus && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-700 font-medium">{compressionStatus}</span>
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

          <div>
            <h3 className="text-lg font-medium mb-4">Varyasyonlar</h3>
            
            {/* Variant Toggle & Management */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Renk Bazlı Stok/Beden Yönetimi Var mı?</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, hasVariants: !prev.hasVariants }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.hasVariants ? "bg-primary-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.hasVariants ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {formData.hasVariants && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-2 items-end">
                  <div className="col-span-1 md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Renk</label>
                    <input
                      type="text"
                      placeholder="Örn: Kırmızı"
                      value={newVariantColor}
                      onChange={(e) => setNewVariantColor(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Bedenler {getCategoryType(formData.category) === "accessories" && <span className="text-gray-400 font-normal">(Opsiyonel)</span>}
                    </label>
                    
                    {(() => {
                      const categoryType: string = getCategoryType(formData.category);
                      const predefinedSizes: string[] = categoryType === 'shoes' ? shoeSizes : categoryType === 'clothing' ? clothingSizes : [];
                      
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
                            {selectedPredefinedSizes.length === 0 && (
                              <span className="text-xs text-gray-400 italic">Beden seçiniz</span>
                            )}
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
                    })()}
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-center pb-2">
                     <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newVariantStock}
                          onChange={(e) => setNewVariantStock(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-xs text-gray-700">Stokta</span>
                     </label>
                  </div>
                  <div className="col-span-1 md:col-span-3 flex flex-col gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (!newVariantColor) return;
                          
                          let sizes: string[] = [];
                          const categoryType: string = getCategoryType(formData.category);
                          const hasPredefined: boolean = categoryType === 'shoes' || categoryType === 'clothing';

                          if (hasPredefined) {
                            if (selectedPredefinedSizes.length === 0) {
                              showError("Lütfen en az bir beden seçiniz");
                              return;
                            }
                            sizes = [...selectedPredefinedSizes];
                          } else {
                            sizes = newVariantSizes.split(",").map(s => s.trim()).filter(Boolean);
                          }

                          const newVariant = { color: newVariantColor, sizes, inStock: newVariantStock };

                          if (editingVariantIndex !== null) {
                            // Update existing variant
                            setVariants(prev => prev.map((v, i) => i === editingVariantIndex ? newVariant : v));
                            setEditingVariantIndex(null);
                          } else {
                            // Add new variant
                            setVariants([...variants, newVariant]);
                          }

                          // Reset form
                          setNewVariantColor("");
                          setNewVariantSizes("");
                          setSelectedPredefinedSizes([]);
                          setNewVariantStock(true);
                        }}
                        className={`w-full gap-2 ${
                          editingVariantIndex !== null 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : ""
                        }`}
                      >
                        {editingVariantIndex !== null ? (
                          <>
                            <Edit2 className="w-4 h-4" />
                            <span>Güncelle</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Ekle</span>
                          </>
                        )}
                      </Button>
                      
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
                          }}
                          className="w-full gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>İptal</span>
                        </Button>
                      )}
                  </div>
                </div>

                {/* Variants List */}
                <div className="space-y-2">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-gray-900" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{variant.color}</p>
                          <p className="text-xs text-gray-500">
                            {variant.sizes.length > 0 ? variant.sizes.join(", ") : "Standart Beden"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${variant.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {variant.inStock ? "Stokta" : "Tükendi"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVariantIndex(index);
                            setNewVariantColor(variant.color);
                            setNewVariantStock(variant.inStock);
                            
                            const categoryType = getCategoryType(formData.category);
                            if (categoryType === 'shoes' || categoryType === 'clothing') {
                              setSelectedPredefinedSizes(variant.sizes);
                              setNewVariantSizes("");
                            } else {
                              setNewVariantSizes(variant.sizes.join(", "));
                              setSelectedPredefinedSizes([]);
                            }
                          }}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingVariantIndex === index) {
                              setEditingVariantIndex(null);
                              setNewVariantColor("");
                              setNewVariantSizes("");
                              setSelectedPredefinedSizes([]);
                              setNewVariantStock(true);
                            }
                            setVariants(variants.filter((_, i) => i !== index));
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Legacy Size/Color Inputs (Hidden if Variants Enabled) */}
          {!formData.hasVariants && (
            <>
            {/* Sizes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedenler {getCategoryType(formData.category) === "accessories" && <span className="text-gray-400 font-normal">(Opsiyonel)</span>}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.sizes.map((size, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {size}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("sizes", index)}
                      className="ml-1.5 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={sizeInputRef}
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder={getSizePlaceholder(formData.category)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem("sizes", newSize, setNewSize, sizeInputRef);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addArrayItem("sizes", newSize, setNewSize, sizeInputRef)}
                  className="px-3 py-1.1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Renkler</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.colors.map((color, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {color}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("colors", index)}
                      className="ml-1.5 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={colorInputRef}
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Renk ekle"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem("colors", newColor, setNewColor, colorInputRef);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addArrayItem("colors", newColor, setNewColor, colorInputRef)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            </>
          )}

          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {!formData.hasVariants && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Stok Durumu</span>
                <button
                  type="button"
                  onClick={() => handleToggle("inStock")}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.inStock ? "bg-primary-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.inStock ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Öne Çıkan</span>
              <button
                type="button"
                onClick={() => handleToggle("featured")}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.featured ? "bg-primary-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.featured ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
