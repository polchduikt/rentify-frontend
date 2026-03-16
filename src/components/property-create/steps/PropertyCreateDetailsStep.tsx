import { PROPERTY_CREATE_INPUT_CLASS, PROPERTY_CREATE_LABEL_CLASS } from '@/constants/propertyCreateUi';
import type { PropertyCreateDetailsStepProps } from './PropertyCreateDetailsStep.types';


export const PropertyCreateDetailsStep = ({ model }: PropertyCreateDetailsStepProps) => {
  const {
    register,
    watch,
    formState: { errors },
  } = model.form;

  const rentalType = watch('rentalType');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="rooms" className={PROPERTY_CREATE_LABEL_CLASS}>
            Кімнат
          </label>
          <input id="rooms" type="number" min={0} className={PROPERTY_CREATE_INPUT_CLASS} {...register('rooms')} />
        </div>
        <div>
          <label htmlFor="floor" className={PROPERTY_CREATE_LABEL_CLASS}>
            Поверх
          </label>
          <input id="floor" type="number" min={0} className={PROPERTY_CREATE_INPUT_CLASS} {...register('floor')} />
        </div>
        <div>
          <label htmlFor="totalFloors" className={PROPERTY_CREATE_LABEL_CLASS}>
            Поверхів у будинку
          </label>
          <input id="totalFloors" type="number" min={0} className={PROPERTY_CREATE_INPUT_CLASS} {...register('totalFloors')} />
        </div>
        <div>
          <label htmlFor="areaSqm" className={PROPERTY_CREATE_LABEL_CLASS}>
            Площа, м²
          </label>
          <input id="areaSqm" type="number" min={0} step="0.1" className={PROPERTY_CREATE_INPUT_CLASS} {...register('areaSqm')} />
        </div>
      </div>

      {rentalType === 'SHORT_TERM' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="maxGuests" className={PROPERTY_CREATE_LABEL_CLASS}>
              Макс. гостей
            </label>
            <input id="maxGuests" type="number" min={1} className={PROPERTY_CREATE_INPUT_CLASS} {...register('maxGuests')} />
            {errors.maxGuests ? <p className="mt-1 text-xs text-red-600">{errors.maxGuests.message}</p> : null}
          </div>
          <div>
            <label htmlFor="checkInTime" className={PROPERTY_CREATE_LABEL_CLASS}>
              Час заїзду
            </label>
            <input id="checkInTime" type="time" className={PROPERTY_CREATE_INPUT_CLASS} {...register('checkInTime')} />
          </div>
          <div>
            <label htmlFor="checkOutTime" className={PROPERTY_CREATE_LABEL_CLASS}>
              Час виїзду
            </label>
            <input id="checkOutTime" type="time" className={PROPERTY_CREATE_INPUT_CLASS} {...register('checkOutTime')} />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Правила проживання</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('petsAllowed')} />
            Тварини дозволені
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('smokingAllowed')} />
            Куріння дозволено
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('partiesAllowed')} />
            Вечірки дозволені
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="additionalRules" className={PROPERTY_CREATE_LABEL_CLASS}>
          Додаткові правила
        </label>
        <textarea
          id="additionalRules"
          rows={4}
          className={`${PROPERTY_CREATE_INPUT_CLASS} resize-y`}
          placeholder="Наприклад: без тварин великих порід, тиша після 22:00..."
          {...register('additionalRules')}
        />
      </div>
    </div>
  );
};
