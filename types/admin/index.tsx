
export default interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;  
  fileType: string;
}

export interface DeleteProductButtonProps {
  id: string;
  onDelete: (id: string) => Promise<void>;
}

export interface StatusFilterButtonProps {
  label: string;
  count: number;
  status: string;
  selectedStatus: string;
  onClick: (status: string) => void;
}
