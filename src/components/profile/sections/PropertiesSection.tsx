import { useState } from 'react';
import type { PropertyResponseDto } from '@/types/property';
import type { PropertiesSectionProps } from './PropertiesSection.types';
import { useDeletePropertyMutation } from '@/hooks/api';
import { getApiErrorMessage } from '@/utils/errors';
import { PropertyPreviewItem } from '../PropertyPreviewItem';

export const PropertiesSection = ({ title, properties, propertiesLoading, propertiesError }: PropertiesSectionProps) => {
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyResponseDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deletePropertyMutation = useDeletePropertyMutation();

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) {
      return;
    }

    setDeleteError(null);
    try {
      await deletePropertyMutation.mutateAsync(propertyToDelete.id);
      setPropertyToDelete(null);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'Не вдалося видалити оголошення.'));
    }
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{properties.length}</span>
        </div>

        {deleteError ? <p className="mb-4 text-sm text-rose-700">{deleteError}</p> : null}

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
              <PropertyPreviewItem
                key={property.id}
                property={property}
                onDelete={(item) => setPropertyToDelete(item)}
                isDeleting={deletePropertyMutation.isPending && propertyToDelete?.id === property.id}
              />
            ))}
          </div>
        )}
      </section>

      {propertyToDelete ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Видалити оголошення?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Ви дійсно хочете видалити <span className="font-semibold text-slate-800">{propertyToDelete.title}</span>? Дію не можна
              скасувати.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                disabled={deletePropertyMutation.isPending}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                disabled={deletePropertyMutation.isPending}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
              >
                {deletePropertyMutation.isPending ? 'Видалення...' : 'Видалити'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
