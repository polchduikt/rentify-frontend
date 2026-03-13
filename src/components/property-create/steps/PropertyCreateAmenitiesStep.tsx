import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { PhotoUploader } from '@/components/property-create/PhotoUploader';
import { PROPERTY_CREATE_AMENITY_CATEGORY_LABELS } from '@/constants/propertyCreateUi';
import type { PropertyCreateAmenitiesStepProps } from './PropertyCreateAmenitiesStep.types';


export const PropertyCreateAmenitiesStep = ({ model }: PropertyCreateAmenitiesStepProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDrop = (targetIndex: number) => {
    if (dragIndex == null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    model.moveExistingPhoto(dragIndex, targetIndex);
    setDragIndex(null);
  };

  return (
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
        <p className="mt-1 text-sm text-slate-500">Перетягніть фото вгору списку, щоб зробити його головним.</p>

        {model.isEditMode && model.existingPhotosCount > 0 ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-slate-500">
              Поточні фото: {model.existingPhotosCount}. Перший елемент списку буде головним фото після збереження.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {model.existingPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  draggable={!model.isSubmitting}
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <img src={photo.url} alt={`Фото оголошення ${index + 1}`} className="aspect-square h-full w-full object-cover" />

                  <div className="absolute left-2 top-2 flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      <GripVertical size={11} />
                      Перетягни
                    </span>
                    {index === 0 ? (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Головне
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                    {index !== 0 ? (
                      <button
                        type="button"
                        onClick={() => model.moveExistingPhoto(index, 0)}
                        disabled={model.isSubmitting}
                        className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Зробити головним
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => model.removeExistingPhoto(photo.id)}
                      disabled={model.isSubmitting}
                      className="rounded-full bg-black/65 p-1.5 text-white disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Видалити фото"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-3">
          <PhotoUploader files={model.photos} onChange={model.setPhotos} />
        </div>
      </div>
    </div>
  );
};
