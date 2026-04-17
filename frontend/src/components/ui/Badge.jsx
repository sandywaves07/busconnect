import React from 'react';
import { Briefcase, ShoppingBag, FileText, Wrench } from 'lucide-react';

const typeConfig = {
  job: { label: 'Job', className: 'badge-job', Icon: Briefcase },
  marketplace: { label: 'Marketplace', className: 'badge-marketplace', Icon: ShoppingBag },
  update: { label: 'Update', className: 'badge-update', Icon: FileText },
};

const roleConfig = {
  operator: { label: 'Operator', className: 'bg-bus-blue-100 text-bus-blue-700' },
  driver: { label: 'Driver', className: 'bg-green-100 text-green-700' },
  vendor: { label: 'Vendor', className: 'bg-bus-orange-100 text-bus-orange-700' },
  mechanic: { label: 'Mechanic', className: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', className: 'bg-red-100 text-red-700' },
  guest: { label: 'Guest', className: 'bg-gray-100 text-gray-600' },
};

export function PostTypeBadge({ type }) {
  const config = typeConfig[type] || typeConfig.update;
  const { label, className, Icon } = config;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const config = roleConfig[role] || roleConfig.guest;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export function ConditionBadge({ condition }) {
  const map = {
    new: 'bg-green-100 text-green-700',
    excellent: 'bg-bus-blue-100 text-bus-blue-700',
    good: 'bg-yellow-100 text-yellow-700',
    fair: 'bg-orange-100 text-orange-700',
    'for-parts': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[condition] || 'bg-gray-100 text-gray-600'}`}>
      {condition}
    </span>
  );
}
