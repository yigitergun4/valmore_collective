
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