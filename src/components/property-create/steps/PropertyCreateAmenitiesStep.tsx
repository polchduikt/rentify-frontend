import { PhotoUploader } from '@/components/property-create/PhotoUploader';
import { PROPERTY_CREATE_AMENITY_CATEGORY_LABELS } from '@/constants/propertyCreateUi';
import type { CreatePropertyPageModel } from '@/hooks/useCreatePropertyPage';

interface PropertyCreateAmenitiesStepProps {
  model: CreatePropertyPageModel;
}

export const PropertyCreateAmenitiesStep = ({ model }: PropertyCreateAmenitiesStepProps) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">Зручності</h3>

      <div className="mt-4 space-y-5">
        {model.amenitiesLoading ? (
          <div className="text-sm text-slate-500">Завантаження зручностей...</div>
        ) : (
          model.amenitiesGrouped.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                {PROPERTY_CREATE_AMENITY_CATEGORY_LABELS[group.category] ?? group.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.amenities.map((amenity) => {
                  const isActive = model.amenitySlugs.includes(amenity.slug);
                  return (
                    <button
                      key={amenity.slug}
                      type="button"
                      onClick={() => model.toggleAmenity(amenity.slug)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        isActive
                          ? 'border-blue-300 bg-blue-50 font-medium text-blue-700'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {amenity.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-slate-900">Фото</h3>
      <p className="mt-1 text-sm text-slate-500">Спочатку створюємо оголошення, потім фото завантажуються на бекенд.</p>
      <div className="mt-3">
        <PhotoUploader files={model.photos} onChange={model.setPhotos} />
      </div>
    </div>
  </div>
);
