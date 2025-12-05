"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserProfile, addAddress, updateAddress, deleteAddress } from "@/lib/firestore/users";
import { Address } from "@/types";
import { TURKISH_CITIES } from "@/lib/turkish-data";
import { toast } from "react-hot-toast";
import { Loader2, Plus, MapPin, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import { FormErrors } from "@/types/profile";

export default function AddressesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form State
  const [formData, setFormData] = useState<Omit<Address, "id">>({
    title: "",
    fullName: "",
    phone: "",
    city: "",
    district: "",
    fullAddress: "",
    zipCode: "",
  });

  const fetchAddresses: () => Promise<void> = async () => {
    if (user?.uid) {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setAddresses(profile.addresses || []);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error(t("addresses.error.load"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const validateForm: () => boolean = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation (min 3 chars)
    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = t("addresses.validation.nameMinLength");
    }

    // Phone validation (10 digits)
    const phoneDigits: string = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      newErrors.phone = t("addresses.validation.phoneInvalid");
    }

    // Full address validation (min 10 chars)
    if (formData.fullAddress.trim().length < 10) {
      newErrors.fullAddress = t("addresses.validation.addressMinLength");
    }

    // Zip code validation (5 digits, optional but if provided must be valid)
    if (formData.zipCode && formData.zipCode.length !== 5) {
      newErrors.zipCode = t("addresses.validation.zipInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal: (address?: Address) => void = (address?: Address) => {
    setErrors({});
    if (address) {
      setEditingAddress(address);
      setFormData({
        title: address.title,
        fullName: address.fullName,
        phone: address.phone,
        city: address.city,
        district: address.district,
        fullAddress: address.fullAddress,
        zipCode: address.zipCode,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        title: "",
        fullName: "",
        phone: "",
        city: "",
        district: "",
        fullAddress: "",
        zipCode: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal: () => void = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setErrors({});
  };

  const handleSubmit: (e: React.FormEvent) => Promise<void> = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      if (editingAddress) {
        await updateAddress(user.uid, { ...formData, id: editingAddress.id });
        toast.success(t("addresses.success.update"));
      } else {
        const newAddress: Address = {
          ...formData,
          id: crypto.randomUUID(),
        };
        await addAddress(user.uid, newAddress);
        toast.success(t("addresses.success.add"));
      }
      await fetchAddresses();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(t("addresses.error.save"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete: (addressId: string) => Promise<void> = async (addressId: string) => {
    if (!user?.uid || !confirm(t("addresses.deleteConfirm"))) return;

    try {
      await deleteAddress(user.uid, addressId);
      toast.success(t("addresses.success.delete"));
      await fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error(t("addresses.error.delete"));
    }
  };

  // Format phone number as user types
  const handlePhoneChange: (value: string) => void = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: digits });
    if (errors.phone) {
      setErrors({ ...errors, phone: undefined });
    }
  };

  // Format zip code as user types
  const handleZipChange: (value: string) => void = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 5);
    setFormData({ ...formData, zipCode: digits });
    if (errors.zipCode) {
      setErrors({ ...errors, zipCode: undefined });
    }
  };

  // Get districts based on selected city
  const districts = TURKISH_CITIES.find(c => c.name === formData.city)?.districts || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{t("addresses.title")}</h1>
          <p className="text-sm text-gray-500">{t("addresses.subtitle")}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("addresses.addNew")}
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">{t("addresses.noAddress")}</h3>
          <p className="text-gray-500 mt-1 mb-6">{t("addresses.noAddressDesc")}</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-sm font-medium text-primary-600 underline hover:text-primary-700"
          >
            {t("addresses.addFirst")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-200 transition-colors group relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">{address.title}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(address)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => address.id && handleDelete(address.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{address.fullName}</p>
                <p>{address.phone}</p>
                <p className="mt-2 line-clamp-2">{address.fullAddress}</p>
                <p>{address.district} / {address.city}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingAddress ? t("addresses.editAddress") : t("addresses.addAddress")}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Address Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("addresses.addressTitle")}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("addresses.fullName")}
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    className={`w-full h-10 px-3 border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm ${
                      errors.fullName ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    required
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("addresses.phone")}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full h-10 px-3 border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm ${
                      errors.phone ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder="5XX XXX XX XX"
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("addresses.city")}
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value, district: "" });
                    }}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    required
                  >
                    <option value="">{t("addresses.select")}</option>
                    {TURKISH_CITIES.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("addresses.district")}
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    required
                    disabled={!formData.city}
                  >
                    <option value="">{t("addresses.select")}</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("addresses.fullAddress")}
                </label>
                <textarea
                  value={formData.fullAddress}
                  onChange={(e) => {
                    setFormData({ ...formData, fullAddress: e.target.value });
                    if (errors.fullAddress) setErrors({ ...errors, fullAddress: undefined });
                  }}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-none ${
                    errors.fullAddress ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  required
                />
                {errors.fullAddress && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullAddress}
                  </p>
                )}
              </div>

              {/* Zip Code */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("addresses.zipCode")}
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleZipChange(e.target.value)}
                  className={`w-full h-10 px-3 border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm ${
                    errors.zipCode ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="34000"
                />
                {errors.zipCode && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.zipCode}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("addresses.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? t("addresses.saving") : t("addresses.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

