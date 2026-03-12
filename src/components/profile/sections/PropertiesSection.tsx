import type { PropertyResponseDto } from '@/types/property';
import { PropertyPreviewItem } from '../PropertyPreviewItem';

interface PropertiesSectionProps {
  title: string;
  properties: PropertyResponseDto[];
  propertiesLoading: boolean;
  propertiesError: string | null;
}

export const PropertiesSection = ({
  title,
  properties,
  propertiesLoading,
  propertiesError,
}: PropertiesSectionProps) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{properties.length}</span>
    </div>
    {propertiesError ? (
      <p className="text-sm text-rose-700">{propertiesError}</p>
    ) : propertiesLoading ? (
      <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
    ) : properties.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        У цьому розділі поки немає оголошень.
      </div>
    ) : (
      <div className="space-y-4">
        {properties.map((property) => (
          <PropertyPreviewItem key={property.id} property={property} />
        ))}
      </div>
    )}
  </section>
);
