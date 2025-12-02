"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Order } from "@/types/admin/orders";
import { fetchOrderById, updateOrderStatus } from "@/lib/firestore/orders";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  User, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// Status Badge Component
const StatusBadge: React.FC<{ status: Order["status"] }> = ({ status }) => {
  const styles: Record<Order["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    returned: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const labels: Record<Order["status"], string> = {
    pending: "Bekliyor",
    processing: "Hazırlanıyor",
    shipped: "Kargolandı",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
    returned: "İade Edildi",
  };

  const icons: Record<Order["status"], typeof Icon> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle2,
    cancelled: XCircle,
    returned: ArrowLeft,
  };

  const Icon: React.FC<{ className?: string }> = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      {labels[status]}
    </span>
  );
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<Order["status"] | "">("");

  // Modal State
  const [showShippedModal, setShowShippedModal] = useState<boolean>(false);
  const [shippingData, setShippingData] = useState<{ carrier: string; trackingNumber: string }>({
    carrier: "",
    trackingNumber: "",
  });

  useEffect(() => {
    const loadOrder: () => Promise<void> = async () => {
      try {
        if (typeof params.id !== "string") return;
        const data: Order | null = await fetchOrderById(params.id);
        if (data) {
          setOrder(data);
          setSelectedStatus(data.status);
        } else {
          setError("Sipariş bulunamadı.");
        }
      } catch (err) {
        setError("Sipariş yüklenirken bir hata oluştu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [params.id]);

  const handleUpdateStatus: () => Promise<void> = async () => {
    if (!order || !selectedStatus) return;

    if (selectedStatus === "shipped") {
      setShowShippedModal(true);
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(order.id, selectedStatus);
      setOrder({ ...order, status: selectedStatus });
      toast.success("Sipariş durumu güncellendi.");
    } catch (err) {
      console.error(err);
      toast.error("Durum güncellenirken bir hata oluştu.");
    } finally {
      setUpdating(false);
    }
  };

  const handleShippedConfirm: () => Promise<void> = async () => {
    if (!order || !shippingData.carrier || !shippingData.trackingNumber) {
      toast.error("Lütfen kargo firması ve takip numarasını giriniz.");
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(order.id, "shipped", shippingData);
      setOrder({ 
        ...order, 
        status: "shipped",
        carrier: shippingData.carrier,
        trackingNumber: shippingData.trackingNumber
      });
      setShowShippedModal(false);
      toast.success("Sipariş kargolandı olarak işaretlendi.");
    } catch (err) {
      console.error(err);
      toast.error("Durum güncellenirken bir hata oluştu.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium text-gray-900">{error || "Sipariş bulunamadı"}</p>
        <Link href="/admin/orders" className="text-primary-600 hover:underline">
          Siparişlere Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Sipariş #{order.id.slice(-6).toUpperCase()}
            <StatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Sipariş İçeriği
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={index} className="p-6 flex gap-4">
                  <div className="relative w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-500">Beden: {item.selectedSize}</p>
                          <p className="text-sm text-gray-500">Renk: {item.selectedColor}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">
                        ₺{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Adet: {item.quantity}</span>
                      <span className="font-semibold text-gray-900">
                        Top: ₺{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Shipping Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  Müşteri Bilgileri
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Ad Soyad</label>
                  <p className="text-gray-900 font-medium">{order.customer.fullName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">E-posta</label>
                  <p className="text-gray-900">{order.customer.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Telefon</label>
                  <p className="text-gray-900">{order.customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  Teslimat Adresi
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Adres Başlığı</label>
                  <p className="text-gray-900 font-medium">{order.shippingAddress.title}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Açık Adres</label>
                  <p className="text-gray-900">{order.shippingAddress.address}</p>
                  <p className="text-gray-900 mt-1">
                    {order.shippingAddress.district} / {order.shippingAddress.city}
                  </p>
                  <p className="text-gray-900">{order.shippingAddress.country}</p>
                </div>
                {order.trackingNumber && (
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase">Kargo Takip</label>
                    <p className="text-gray-900 font-medium">{order.carrier}</p>
                    <p className="text-primary-600 font-mono">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Summary */}
        <div className="space-y-6">
          {/* Status Manager */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm sticky top-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Sipariş Durumu</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durumu Güncelle
              </label>
              <div className="space-y-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Order["status"])}
                  disabled={updating}
                  className="w-full rounded-lg border-gray-300 shadow-sm px-2 py-2 focus:border-primary-500 focus:ring-green-500"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="processing">Hazırlanıyor</option>
                  <option value="shipped">Kargolandı</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="cancelled">İptal Edildi</option>
                  <option value="returned">İade Edildi</option>
                </select>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updating || selectedStatus === order.status}
                  className="w-full"
                >
                  {updating ? "Güncelleniyor..." : "Durumu Güncelle"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                &quot;Kargolandı&quot; seçildiğinde kargo takip bilgileri istenecektir.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-500" />
                Ödeme Özeti
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>₺{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span>₺{order.shippingCost.toFixed(2)}</span>
              </div>
              {order.discountTotal && order.discountTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-₺{order.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">Toplam</span>
                <span className="text-xl font-bold text-primary-600">
                  ₺{order.total.toFixed(2)}
                </span>
              </div>
              <div className="pt-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                  <span>Ödeme Yöntemi: {order.paymentMethod === 'credit_card' ? 'Kredi Kartı' : order.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipped Modal */}
      {showShippedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Kargo Bilgileri</h3>
              <button 
                onClick={() => setShowShippedModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kargo Firması
                </label>
                <input
                  type="text"
                  value={shippingData.carrier}
                  onChange={(e) => setShippingData({ ...shippingData, carrier: e.target.value })}
                  placeholder="Örn: Yurtiçi Kargo"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Takip Numarası
                </label>
                <input
                  type="text"
                  value={shippingData.trackingNumber}
                  onChange={(e) => setShippingData({ ...shippingData, trackingNumber: e.target.value })}
                  placeholder="Örn: 1234567890"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowShippedModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleShippedConfirm}
                disabled={!shippingData.carrier || !shippingData.trackingNumber || updating}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? "Güncelleniyor..." : "Onayla ve Kargola"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
