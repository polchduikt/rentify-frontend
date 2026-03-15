import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PropertyResponseDto } from '@/types/property';
import type { PropertiesSectionProps } from './PropertiesSection.types';
import { useChangePropertyStatusMutation, useDeletePropertyMutation } from '@/hooks/api';
import { getApiErrorMessage } from '@/utils/errors';
import { PropertyPreviewItem } from '../PropertyPreviewItem';

const buildPaginationItems = (currentPage: number, totalPages: number): Array<number | 'dots-left' | 'dots-right'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | 'dots-left' | 'dots-right'> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push('dots-left');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push('dots-right');
  }

  items.push(totalPages);
  return items;
};

export const PropertiesSection = ({
  title,
  properties,
  propertiesLoading,
  propertiesError,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: PropertiesSectionProps) => {
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyResponseDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<{ id: number; type: 'archive' | 'publish' } | null>(null);
  const deletePropertyMutation = useDeletePropertyMutation();
  const changePropertyStatusMutation = useChangePropertyStatusMutation();
  const resolvedTotalCount = totalCount ?? properties.length;
  const resolvedCurrentPage = currentPage ?? 1;
  const resolvedTotalPages = Math.max(1, totalPages ?? 1);
  const fallbackPageSize = Math.max(1, pageSize ?? (properties.length > 0 ? properties.length : 1));
  const effectiveTotalPages = Math.max(resolvedTotalPages, Math.ceil(resolvedTotalCount / fallbackPageSize));
  const paginationItems = useMemo(
    () => buildPaginationItems(resolvedCurrentPage, effectiveTotalPages),
    [resolvedCurrentPage, effectiveTotalPages],
  );
  const canPaginate = typeof onPageChange === 'function' && effectiveTotalPages > 1;

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

  const handleArchive = async (property: PropertyResponseDto) => {
    setStatusError(null);
    setStatusAction({ id: property.id, type: 'archive' });
    try {
      await changePropertyStatusMutation.mutateAsync({
        propertyId: property.id,
        payload: { status: 'INACTIVE' },
      });
    } catch (error) {
      setStatusError(getApiErrorMessage(error, 'Не вдалося перенести оголошення в архів.'));
    } finally {
      setStatusAction(null);
    }
  };

  const handlePublish = async (property: PropertyResponseDto) => {
    setStatusError(null);
    setStatusAction({ id: property.id, type: 'publish' });
    try {
      await changePropertyStatusMutation.mutateAsync({
        propertyId: property.id,
        payload: { status: 'ACTIVE' },
      });
    } catch (error) {
      setStatusError(getApiErrorMessage(error, 'Не вдалося опублікувати оголошення.'));
    } finally {
      setStatusAction(null);
    }
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{resolvedTotalCount}</span>
        </div>

        {deleteError ? <p className="mb-4 text-sm text-rose-700">{deleteError}</p> : null}
        {statusError ? <p className="mb-4 text-sm text-rose-700">{statusError}</p> : null}

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
                onArchive={(item) => void handleArchive(item)}
                onPublish={(item) => void handlePublish(item)}
                isArchiving={
                  changePropertyStatusMutation.isPending &&
                  statusAction?.id === property.id &&
                  statusAction.type === 'archive'
                }
                isPublishing={
                  changePropertyStatusMutation.isPending &&
                  statusAction?.id === property.id &&
                  statusAction.type === 'publish'
                }
              />
            ))}

            {canPaginate ? (
              <div className="rounded-2xl border border-[#d8e1f1] bg-gradient-to-br from-white via-[#f7f9fd] to-[#eef3fb] p-4 shadow-[0_18px_35px_-30px_rgba(19,40,79,0.75)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-[#405071]">
                    Сторінка {resolvedCurrentPage} з {effectiveTotalPages}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#d8e2f3] bg-white/90 p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => onPageChange?.(resolvedCurrentPage - 1)}
                      disabled={resolvedCurrentPage <= 1}
                      className="inline-flex h-9 items-center rounded-xl border border-[#cad7ee] bg-white px-3 text-[#1f3763] transition hover:border-[#9fb4d8] hover:bg-[#f3f7ff] disabled:border-[#e4e9f4] disabled:bg-[#f7f9fd] disabled:text-[#a6b1c5]"
                      aria-label="Попередня сторінка"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {paginationItems.map((item) =>
                      typeof item === 'number' ? (
                        <button
                          key={item}
                          type="button"
                          onClick={() => onPageChange?.(item)}
                          className={`h-9 min-w-9 rounded-xl border px-3 text-sm font-semibold transition ${
                            item === resolvedCurrentPage
                              ? 'border-[#13284f] bg-gradient-to-br from-[#13284f] to-[#1f3f79] text-white shadow-[0_12px_24px_-18px_rgba(19,40,79,0.95)]'
                              : 'border-[#cad7ee] bg-white text-[#1f3763] hover:border-[#9fb4d8] hover:bg-[#f3f7ff]'
                          }`}
                        >
                          {item}
                        </button>
                      ) : (
                        <span
                          key={item}
                          className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-[#e2e8f4] bg-[#f8faff] px-3 text-[#9ba9c2]"
                        >
                          ...
                        </span>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() => onPageChange?.(resolvedCurrentPage + 1)}
                      disabled={resolvedCurrentPage >= effectiveTotalPages}
                      className="inline-flex h-9 items-center rounded-xl border border-[#cad7ee] bg-white px-3 text-[#1f3763] transition hover:border-[#9fb4d8] hover:bg-[#f3f7ff] disabled:border-[#e4e9f4] disabled:bg-[#f7f9fd] disabled:text-[#a6b1c5]"
                      aria-label="Наступна сторінка"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
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
