"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { TURKISH_CITIES } from "@/lib/turkish-data";
import { ShippingFormProps } from "@/types/checkout";

export default function ShippingForm({
  formData,
  setFormData,
  errors,
  setErrors,
  savedAddresses,
  selectedAddressId,
  onAddressSelect,
  user,
}: ShippingFormProps): React.JSX.Element {
  const { t } = useLanguage();

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-primary-800 mb-6">
        {t("checkout.shipping")}
      </h2>

      {/* Saved Addresses Selector */}
      {user && savedAddresses.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-primary-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Kayıtlı Adreslerim
          </label>
          <div className="relative">
            <select
              value={selectedAddressId}
              onChange={(e) => onAddressSelect(e.target.value)}
              className="w-full px-4 py-3 pr-10 border-2 border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium text-gray-700 cursor-pointer hover:border-primary-300 transition-all appearance-none shadow-sm"
            >
              <option value="new" className="font-medium">✨ Yeni Adres Gir</option>
              {savedAddresses.map((addr) => (
                <option key={addr.title} value={addr.title} className="font-normal">
                  📍 {addr.title} - {addr.city}, {addr.district}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.firstName")}
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            } ${user ? "bg-gray-50" : ""}`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.lastName")}
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            } ${user ? "bg-gray-50" : ""}`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.email")}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            } ${user ? "bg-gray-50" : ""}`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.phone")}
          </label>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pr-3 border border-r border-gray-300 rounded-l-lg">
              <span className="text-gray-700">+90</span>
            </div>
            <input
              type="tel"
              name="phone"
              value={
                formData.phone.replace(/(\d{3})(\d{0,3})(\d{0,2})(\d{0,2})/, (match,p1, p2, p3, p4) => {
                  let result = p1;
                  if (p2) result += ' ' + p2;
                  if (p3) result += ' ' + p3;
                  if (p4) result += ' ' + p4;
                  return result;
                })
              }
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setFormData((prev) => ({ ...prev, phone: value }));
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }
              }}
              placeholder="5xx xxx xx xx"
              maxLength={13}
              className={`w-full pl-16 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 tracking-wider ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.address")}
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.city")}
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={(e) => {
              handleInputChange(e);
              setFormData(prev => ({ ...prev, state: "" }));
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">İl Seçiniz</option>
            {TURKISH_CITIES.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İlçe
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            disabled={!formData.city}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.state ? "border-red-500" : "border-gray-300"
            } ${!formData.city ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">İlçe Seçiniz</option>
            {formData.city && TURKISH_CITIES.find(c => c.name === formData.city)?.districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.zipCode")}
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData(prev => ({ ...prev, zipCode: value }));
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.zipCode ? "border-red-500" : "border-gray-300"
            }`}
            maxLength={5}
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.country")}
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            disabled
            className="w-full px-4 py-2 border rounded-lg border-gray-300 bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}
