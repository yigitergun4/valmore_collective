import { X } from "lucide-react";

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

export default function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
      {label}
      <button onClick={onRemove} className="hover:opacity-60">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
