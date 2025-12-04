import React from "react";
import { KPICardProps } from "@/types/admin";

export default function KPICard({ title, value, icon }: KPICardProps): React.JSX.Element {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-gray-500">
          {title}
        </h3>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
