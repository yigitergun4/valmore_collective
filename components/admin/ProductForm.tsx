"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || 0,
    category: initialData?.category || "",
    brand: initialData?.brand || "",
    images: initialData?.images || [],
    sizes: initialData?.sizes || [],
    colors: initialData?.colors || [],
    inStock: initialData?.inStock ?? true,
    featured: initialData?.featured ?? false,
    slug: initialData?.slug || "",
  });

  const [newSize, setNewSize] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");
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
    if (isSizeRequired(formData.category) && formData.sizes.length === 0) {
      alert("Lütfen en az bir beden ekleyin!");
      sizeInputRef.current?.focus();
      return;
    }
    
    setUploading(true);
    setCompressionStatus("Preparing to upload images...");
    
    try {
      let uploadedUrls: string[] = [];
      
      // Upload selected files if any
      if (selectedFiles.length > 0) {
        
        // Compression options
        const compressionOptions = {
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

      await onSubmit({
        ...formData,
        images: [...formData.images, ...uploadedUrls],
        slug,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      });
      
    } catch (error) {
      console.error("❌ Form submission failed:", error);
      alert("Ürün kaydedilemedi");
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orijinal Fiyat (Opsiyonel)
              </label>
              <input
                type="number"
                name="originalPrice"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
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
                  <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                    Önizleme
                  </div>
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
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
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
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
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
