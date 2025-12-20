"use client";

import { TURKISH_CITIES } from "@/lib/turkish-data";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle } from "lucide-react";
import { AddressFormData, AddressFormFieldsProps } from "@/types";
import { Select } from "@/components/ui/Select";


// Format phone for display (5xx xxx xx xx)
export const formatPhoneDisplay: (phone: string) => string = (phone: string) => {
  return phone.replace(/(\d{3})(\d{0,3})(\d{0,2})(\d{0,2})/, (match, p1, p2, p3, p4) => {
    let result: string = p1;
    if (p2) result += " " + p2;
    if (p3) result += " " + p3;
    if (p4) result += " " + p4;
    return result;
  });
};

// Parse phone input (only digits, max 10, must start with 5)
export const parsePhoneInput: (value: string) => string | null = (value: string) => {
  const digits: string = value.replace(/\D/g, "").slice(0, 10);
  // Only allow if empty or starts with 5
  if (digits === "" || digits.startsWith("5")) {
    return digits;
  }
  return null;
};

export default function AddressFormFields({
  formData,
  setFormData,
  errors,
  setErrors,
  useSpreadUpdate = false,
}: AddressFormFieldsProps) {
  const { t } = useLanguage();

  // Get districts based on selected city
  const districts: string[] = TURKISH_CITIES.find((c: { name: string; }) => c.name === formData.city)?.districts || [];

  const handlePhoneChange: (value: string) => void = (value: string) => {
    const parsed: string | null = parsePhoneInput(value);
    if (parsed !== null) {
      if (useSpreadUpdate) {
        (setFormData as (updates: Partial<AddressFormData>) => void)({ phone: parsed });
      } else {
        (setFormData as React.Dispatch<React.SetStateAction<AddressFormData>>)(prev => ({ ...prev, phone: parsed }));
      }
    }
    if (errors.phone) {
      if (useSpreadUpdate) {
        (setErrors as (updates: Record<string, string | undefined>) => void)({ ...errors, phone: undefined });
      } else {
        (setErrors as React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>)(prev => ({ ...prev, phone: undefined }));
      }
    }
  };

  const handleCityChange: (city: string) => void = (city: string) => {
    if (useSpreadUpdate) {
      (setFormData as (updates: Partial<AddressFormData>) => void)({ city, district: "" });
    } else {
      (setFormData as React.Dispatch<React.SetStateAction<AddressFormData>>)(prev => ({ ...prev, city, district: "" }));
    }
  };

  const handleDistrictChange: (district: string) => void = (district: string) => {
    if (useSpreadUpdate) {
      (setFormData as (updates: Partial<AddressFormData>) => void)({ district });
    } else {
      (setFormData as React.Dispatch<React.SetStateAction<AddressFormData>>)(prev => ({ ...prev, district }));
    }
  };

  const handleAddressChange: (fullAddress: string) => void = (fullAddress: string) => {
    if (useSpreadUpdate) {
      (setFormData as (updates: Partial<AddressFormData>) => void)({ fullAddress });
    } else {
      (setFormData as React.Dispatch<React.SetStateAction<AddressFormData>>)(prev => ({ ...prev, fullAddress }));
    }
    if (errors.fullAddress) {
      if (useSpreadUpdate) {
        (setErrors as (updates: Record<string, string | undefined>) => void)({ ...errors, fullAddress: undefined });
      } else {
        (setErrors as React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>)(prev => ({ ...prev, fullAddress: undefined }));
      }
    }
  };

  const handleZipChange: (value: string) => void = (value: string) => {
    const digits: string = value.replace(/\D/g, "").slice(0, 5);
    if (useSpreadUpdate) {
      (setFormData as (updates: Partial<AddressFormData>) => void)({ zipCode: digits });
    } else {
      (setFormData as React.Dispatch<React.SetStateAction<AddressFormData>>)(prev => ({ ...prev, zipCode: digits }));
    }
    if (errors.zipCode) {
      if (useSpreadUpdate) {
        (setErrors as (updates: Record<string, string | undefined>) => void)({ ...errors, zipCode: undefined });
      } else {
        (setErrors as React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>)(prev => ({ ...prev, zipCode: undefined }));
      }
    }
  };

  return (
    <>
      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("addresses.phone")}
        </label>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pr-2 border border-r border-gray-200 rounded-l-lg bg-gray-50">
            <span className="text-gray-600 text-sm">+90</span>
          </div>
          <input
            type="tel"
            value={formatPhoneDisplay(formData.phone)}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`w-full h-10 pl-14 pr-3 border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm tracking-wider ${
              errors.phone ? "border-red-300 bg-red-50" : "border-gray-200"
            }`}
            placeholder="5xx xxx xx xx"
            maxLength={13}
            required
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.phone}
          </p>
        )}
      </div>

      {/* City & District Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("addresses.city")}
          </label>
          <Select
            value={formData.city}
            onChange={(e) => handleCityChange(e.target.value)}
            options={TURKISH_CITIES.map((city) => ({
              value: city.name,
              label: city.name,
            }))}
            placeholder={t("addresses.select")}
            required
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("addresses.district")}
          </label>
          <Select
            value={formData.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            options={districts.map((district) => ({
              value: district,
              label: district,
            }))}
            placeholder={t("addresses.select")}
            required
            disabled={!formData.city}
          />
        </div>
      </div>

      {/* Full Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("addresses.fullAddress")}
        </label>
        <textarea
          value={formData.fullAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
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

      {/* Zip Code & Country Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Zip Code */}
        <div>
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
            maxLength={5}
          />
          {errors.zipCode && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.zipCode}
            </p>
          )}
        </div>

        {/* Country - Fixed Turkey */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("addresses.country")}
          </label>
          <input
            type="text"
            value="Türkiye"
            disabled
            className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-sm cursor-not-allowed"
          />
        </div>
      </div>
    </>
  );
}
