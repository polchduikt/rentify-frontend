import { Plus, Trash2 } from 'lucide-react';
import { PROPERTY_CREATE_INPUT_CLASS, PROPERTY_CREATE_LABEL_CLASS } from '@/constants/propertyCreateUi';
import type { PropertyCreatePricingStepProps } from './PropertyCreatePricingStep.types';


export const PropertyCreatePricingStep = ({ model }: PropertyCreatePricingStepProps) => {
  const {
    register,
    watch,
    formState: { errors },
  } = model.form;
  const rentalType = watch('rentalType');
  const availabilityDraft = model.availabilityDraft;
  const hasAnyAvailabilityBlocks = model.existingAvailabilityBlocks.length > 0 || model.availabilityBlocks.length > 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {rentalType === 'SHORT_TERM' ? (
          <div>
            <label htmlFor="pricePerNight" className={PROPERTY_CREATE_LABEL_CLASS}>
              Ціна за ніч
            </label>
            <input id="pricePerNight" type="number" min={0} step="0.01" className={PROPERTY_CREATE_INPUT_CLASS} {...register('pricePerNight')} />
            {errors.pricePerNight ? <p className="mt-1 text-xs text-red-600">{errors.pricePerNight.message}</p> : null}
          </div>
        ) : (
          <div>
            <label htmlFor="pricePerMonth" className={PROPERTY_CREATE_LABEL_CLASS}>
              Ціна за місяць
            </label>
            <input id="pricePerMonth" type="number" min={0} step="0.01" className={PROPERTY_CREATE_INPUT_CLASS} {...register('pricePerMonth')} />
            {errors.pricePerMonth ? <p className="mt-1 text-xs text-red-600">{errors.pricePerMonth.message}</p> : null}
          </div>
        )}

        <div>
          <label htmlFor="currency" className={PROPERTY_CREATE_LABEL_CLASS}>
            Валюта
          </label>
          <input id="currency" type="text" className={PROPERTY_CREATE_INPUT_CLASS} {...register('currency')} />
          {errors.currency ? <p className="mt-1 text-xs text-red-600">{errors.currency.message}</p> : null}
        </div>

        <div>
          <label htmlFor="securityDeposit" className={PROPERTY_CREATE_LABEL_CLASS}>
            Застава
          </label>
          <input id="securityDeposit" type="number" min={0} step="0.01" className={PROPERTY_CREATE_INPUT_CLASS} {...register('securityDeposit')} />
        </div>

        <div>
          <label htmlFor="cleaningFee" className={PROPERTY_CREATE_LABEL_CLASS}>
            Прибирання
          </label>
          <input id="cleaningFee" type="number" min={0} step="0.01" className={PROPERTY_CREATE_INPUT_CLASS} {...register('cleaningFee')} />
        </div>
      </div>

      {rentalType === 'SHORT_TERM' ? (
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Недоступні дати (опційно)</h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
            <input
              type="date"
              value={availabilityDraft.dateFrom}
              onChange={(event) =>
                model.setAvailabilityDraft((prev) => ({
                  ...prev,
                  dateFrom: event.target.value,
                }))
              }
              className={PROPERTY_CREATE_INPUT_CLASS}
            />
            <input
              type="date"
              value={availabilityDraft.dateTo}
              onChange={(event) =>
                model.setAvailabilityDraft((prev) => ({
                  ...prev,
                  dateTo: event.target.value,
                }))
              }
              className={PROPERTY_CREATE_INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Причина (наприклад, ремонт)"
              value={availabilityDraft.reason}
              onChange={(event) =>
                model.setAvailabilityDraft((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              className={PROPERTY_CREATE_INPUT_CLASS}
            />
            <button
              type="button"
              onClick={model.addAvailabilityBlock}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus size={16} />
              Додати
            </button>
          </div>

          {model.availabilityError ? <p className="mt-2 text-xs text-red-600">{model.availabilityError}</p> : null}

          {model.availabilityBlocksLoading ? (
            <div className="mt-4 h-16 animate-pulse rounded-xl bg-slate-100" />
          ) : null}

          {hasAnyAvailabilityBlocks ? (
            <div className="mt-4 space-y-2">
              {model.existingAvailabilityBlocks.map((block) => (
                <div
                  key={`existing-${block.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  <div>
                    <span className="font-medium text-slate-800">
                      {block.dateFrom} - {block.dateTo}
                    </span>
                    {block.reason ? <span className="ml-2 text-slate-500">{block.reason}</span> : null}
                    <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      Збережено
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => model.removeExistingAvailabilityBlock(block.id)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {model.availabilityBlocks.map((block, index) => (
                <div
                  key={`${block.dateFrom}-${block.dateTo}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm"
                >
                  <div>
                    <span className="font-medium text-slate-800">
                      {block.dateFrom} - {block.dateTo}
                    </span>
                    {block.reason ? <span className="ml-2 text-slate-500">{block.reason}</span> : null}
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      Нове
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => model.removeAvailabilityBlock(index)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
