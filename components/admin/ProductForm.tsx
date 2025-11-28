"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/types";
import { uploadProductImage } from "@/lib/firestore/products";
import { X, Upload, Plus } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { 
  PRODUCT_CATEGORIES, 
  getCategoryType, 
  getSizePlaceholder,
  isSizeRequired 
} from "@/lib/constants";
import { CompressionOptions } from "@/types/admin";
import { useAlert } from "@/contexts/AlertContext";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, "id">) => Promise<void>;
  isSubmitting: boolean;
}


export default function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ProductFormProps): React.JSX.Element {
  const router = useRouter();
  const { showError, showSuccess } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || 0,
    isDiscounted: initialData?.isDiscounted || false,
    category: initialData?.category || "",
    brand: initialData?.brand || "",
    images: initialData?.images || [],
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
  const [newVariantStock, setNewVariantStock] = useState<boolean>(true);

  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [compressionStatus, setCompressionStatus] = useState<string>("");

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

  const handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files: FileList | null = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const fileArray: File[] = Array.from(files);
    
    // Create preview URLs for selected files
    const newPreviewUrls: string[] = fileArray.map((file: File) => {
      return URL.createObjectURL(file);
    });
    
    // Add files to selected files array
    setSelectedFiles((prev: File[]) => [...prev, ...fileArray]);
    setPreviewUrls((prev: string[]) => [...prev, ...newPreviewUrls]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
  };

  const removeImage: (index: number) => void = (index: number) => {
    // Check if this is a preview (not yet uploaded) or an existing image
    const totalExisting: number = formData.images.length;
    
    if (index < totalExisting) {
      // Remove from existing uploaded images
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i: number) => i !== index),
      }));
    } else {
      // Remove from previews
      const previewIndex: number = index - totalExisting;
      
      // Revoke the object URL to prevent memory leak
      URL.revokeObjectURL(previewUrls[previewIndex]);
      
      setSelectedFiles((prev: File[]) => prev.filter((_, i: number) => i !== previewIndex));
      setPreviewUrls((prev: string[]) => prev.filter((_, i: number) => i !== previewIndex));
    }
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
    
    // Validate sizes based on category
    // Validate sizes based on category and variants
    if (formData.hasVariants) {
      if (variants.length === 0) {
        showError("En az bir varyasyon ekleyin.");
        return;
      }
      if (isSizeRequired(formData.category)) {
        const hasSizes = variants.some(v => v.sizes && v.sizes.length > 0);
        if (!hasSizes) {
          showError("Lütfen varyasyonlar için beden giriniz.");
          return;
        }
      }
    } else {
      if (isSizeRequired(formData.category) && formData.sizes.length === 0) {
        showError("Lütfen en az bir beden ekleyin!");
        sizeInputRef.current?.focus();
        return;
      }
    }
    
    setUploading(true);
    setCompressionStatus("Preparing to upload images...");
    
    try {
      let uploadedUrls: string[] = [];
      
      // Upload selected files if any
      if (selectedFiles.length > 0) {
        
        // Compression options
        const compressionOptions: CompressionOptions= {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: false,
          fileType: "image/webp" as const,
        };
        
        // Compress and upload all files
        const uploadPromises: Promise<string>[] = selectedFiles.map(async (file: File, index: number): Promise<string> => {
          try {
            setCompressionStatus(`Compressing image ${index + 1} of ${selectedFiles.length}...`);
            
            // Compress
            const compressedFile: File = await imageCompression(file, compressionOptions);
            
            const originalSizeKB: number = parseFloat((file.size / 1024).toFixed(2));
            const compressedSizeKB: number = parseFloat((compressedFile.size / 1024).toFixed(2));
            const reductionPercent: number = parseFloat((((file.size - compressedFile.size) / file.size) * 100).toFixed(1));
            
            setCompressionStatus(`Uploading image ${index + 1} of ${selectedFiles.length}...`);
            
            // Upload
            const url: string = await uploadProductImage(compressedFile);
            
            return url;
          } catch (error) {
            console.error(`❌ Error processing image ${index + 1}:`, error);
            // Fallback to original
            return await uploadProductImage(file);
          }
        });
        
        uploadedUrls = await Promise.all(uploadPromises);
        
        // Cleanup preview URLs
        previewUrls.forEach((url: string) => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setSelectedFiles([]);
      }
      
      setCompressionStatus("");
      
      const slug: string = slugify(formData.name);

      // Calculate final prices based on discount state
      const finalPrice = hasDiscount ? discountedPrice : formData.price;

      // Aggregate colors and sizes from variants if enabled
      let finalColors: string[] = formData.colors;
      let finalSizes: string[] = formData.sizes;
      let finalInStock: boolean = formData.inStock;

      if (formData.hasVariants) {
        finalColors = Array.from(new Set(variants.map(v => v.color)));
        finalSizes = Array.from(new Set(variants.flatMap(v => v.sizes)));
        finalInStock = variants.some(v => v.inStock);
      }

      const submitData = {
        ...formData,
        price: finalPrice,
        isDiscounted: hasDiscount,
        images: [...formData.images, ...uploadedUrls],
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
      showError("Ürün kaydedilemedi");
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
                step="0.01"
                value={formData.price} // This represents the Base Price in the form UI
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
                  value={discountedPrice}
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Images & Variants */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Görseller</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {formData.images.map((url, index) => (
                <div key={`image-${index}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                  <Image
                    src={url}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              {previewUrls.map((url: string, index: number) => (
                <div key={`preview-${index}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border-2 border-dashed border-blue-300">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(formData.images.length + index)}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
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
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Renk</label>
                    <input
                      type="text"
                      placeholder="Örn: Kırmızı"
                      value={newVariantColor}
                      onChange={(e) => setNewVariantColor(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bedenler (Virgülle ayırın)</label>
                    <input
                      type="text"
                      placeholder="Örn: S, M, L"
                      value={newVariantSizes}
                      onChange={(e) => setNewVariantSizes(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center pb-2">
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
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newVariantColor) return;
                        const sizes = newVariantSizes.split(",").map(s => s.trim()).filter(Boolean);
                        setVariants([...variants, { color: newVariantColor, sizes, inStock: newVariantStock }]);
                        setNewVariantColor("");
                        setNewVariantSizes("");
                        setNewVariantStock(true);
                      }}
                      className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
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
                          onClick={() => setVariants(variants.filter((_, i) => i !== index))}
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
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stok Durumu</span>
              {formData.hasVariants ? (
                <span className="text-sm text-gray-500 italic">Varyasyonlardan hesaplanır</span>
              ) : (
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
              )}
            </div>

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
