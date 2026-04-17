import React from 'react';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const colors = [
  'bg-bus-blue-700', 'bg-bus-green-600', 'bg-bus-orange-600',
  'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600'
];

function getColor(name) {
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizeClass = sizes[size] || sizes.md;
  const colorClass = getColor(name);

  if (src) {
    return (
      <img
        src={src.startsWith('http') ? src : `/uploads/${src}`}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
