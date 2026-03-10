import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useRef } from 'react';
import type { PropertyResponseDto } from '@/types/property';
import PropertyCard from '@/components/PropertyCard';

const CARD_CLASS = 'w-[85vw] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]';

const PropertyCardSkeleton = () => (
  <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white animate-pulse ${CARD_CLASS}`}>
    <div className="aspect-[3/2] bg-slate-200" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-2/3 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-200" />
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="h-9 w-full rounded bg-slate-200" />
    </div>
  </div>
);

interface PropertySliderProps {
  items: PropertyResponseDto[];
  loading: boolean;
}

const PropertySlider = ({ items, loading }: PropertySliderProps) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    const cardWidth = sliderRef.current?.firstElementChild?.clientWidth ?? 360;
    const gap = 20;
    sliderRef.current?.scrollBy({
      left: direction === 'right' ? cardWidth + gap : -(cardWidth + gap),
      behavior: 'smooth',
    });
  };

  return (
    <div className="group/slider relative">
      <button
        type="button"
        onClick={() => scroll('left')}
        className="absolute left-0 top-[40%] z-10 flex h-11 w-11 -translate-x-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow opacity-0 transition group-hover/slider:opacity-100"
      >
        <ChevronLeft size={22} className="text-slate-600" />
      </button>

      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 pt-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <PropertyCardSkeleton key={index} />)
        ) : items.length === 0 ? (
          <div className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center">
            <Home size={44} className="text-slate-300" />
            <p className="mt-3 font-medium text-slate-500">Поки що немає оголошень у цій категорії</p>
          </div>
        ) : (
          items.map((property) => (
            <div key={property.id} className={CARD_CLASS}>
              <PropertyCard property={property} />
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => scroll('right')}
        className="absolute right-0 top-[40%] z-10 flex h-11 w-11 translate-x-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow opacity-0 transition group-hover/slider:opacity-100"
      >
        <ChevronRight size={22} className="text-slate-600" />
      </button>
    </div>
  );
};

export default PropertySlider;
