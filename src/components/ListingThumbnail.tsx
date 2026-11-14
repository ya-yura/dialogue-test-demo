import React from 'react';
import { Building2, Car, Home, Bike, Store, Warehouse } from 'lucide-react';

interface ListingThumbnailProps {
  category: 'warehouse' | 'villa' | 'car' | 'scooter' | 'commercial' | 'condo';
  size?: 'sm' | 'md' | 'lg';
  status?: 'active' | 'reserved' | 'archived';
}

export const ListingThumbnail: React.FC<ListingThumbnailProps> = ({
  category,
  size = 'md',
  status = 'active',
}) => {
  const dimensions =
    size === 'sm'
      ? 'w-10 h-10 rounded-lg'
      : size === 'md'
      ? 'w-12 h-12 rounded-lg'
      : 'w-14 h-14 rounded-xl';

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';

  const config = {
    warehouse: {
      bg: 'bg-slate-800 text-amber-300 border-slate-700',
      label: '600m²',
      Icon: Warehouse,
    },
    villa: {
      bg: 'bg-teal-900 text-teal-200 border-teal-800',
      label: 'VILLA',
      Icon: Home,
    },
    car: {
      bg: 'bg-blue-950 text-sky-300 border-blue-900',
      label: '4WD',
      Icon: Car,
    },
    scooter: {
      bg: 'bg-zinc-900 text-orange-300 border-zinc-800',
      label: '350cc',
      Icon: Bike,
    },
    commercial: {
      bg: 'bg-indigo-950 text-indigo-200 border-indigo-900',
      label: '145m²',
      Icon: Store,
    },
    condo: {
      bg: 'bg-cyan-950 text-cyan-200 border-cyan-900',
      label: 'SEA',
      Icon: Building2,
    },
  }[category];

  const IconComponent = config.Icon;

  return (
    <div
      className={`relative shrink-0 ${dimensions} ${config.bg} border flex flex-col items-center justify-center overflow-hidden select-none`}
    >
      <IconComponent className={`${iconSize} opacity-90`} />
      <span className="text-[9px] font-mono font-semibold tracking-tight opacity-85 leading-none mt-0.5">
        {config.label}
      </span>
      {status === 'reserved' && (
        <div
          className="absolute inset-x-0 bottom-0 bg-amber-500/95 text-slate-950 text-[8px] font-bold text-center leading-tight py-0.5"
          title="Объявление забронировано"
        >
          БРОНЬ
        </div>
      )}
    </div>
  );
};
