import { ChevronLeft, Heart, Share2 } from "lucide-react";
import type { MobileTopBarProps } from "@/types/components/products";

export default function MobileTopBar({
  onBack,
  onToggleFavorite,
  isFavorited,
}: MobileTopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 p-4 flex justify-between items-start pointer-events-none">
      <button
        onClick={onBack}
        className="pointer-events-auto p-2 bg-white/80 backdrop-blur-md rounded-full text-black shadow-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex gap-3 pointer-events-auto">
        <button
          onClick={onToggleFavorite}
          className={`p-2 backdrop-blur-md rounded-full transition-colors shadow-sm ${
            isFavorited ? "bg-primary-600 text-white" : "bg-white/80 text-black"
          }`}
        >
          <Heart className={`w-6 h-6 ${isFavorited ? "fill-white" : ""}`} />
        </button>
        <button className="p-2 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-white transition-colors shadow-sm">
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
