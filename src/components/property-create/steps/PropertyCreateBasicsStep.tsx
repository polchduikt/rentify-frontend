import type { CreatePropertyPageModel } from '@/hooks/useCreatePropertyPage';
import { MARKET_TYPE_OPTIONS, PROPERTY_TYPE_OPTIONS, RENTAL_TYPE_OPTIONS } from '@/constants/propertyCreateOptions';
import { PROPERTY_CREATE_INPUT_CLASS, PROPERTY_CREATE_LABEL_CLASS } from '@/constants/propertyCreateUi';

interface PropertyCreateBasicsStepProps {
  model: CreatePropertyPageModel;
}

export const PropertyCreateBasicsStep = ({ model }: PropertyCreateBasicsStepProps) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = model.form;

  const rentalType = watch('rentalType');
  const marketType = watch('marketType');
  const propertyType = watch('propertyType');

  return (
    <div className="space-y-6">
      <div>
        <p className={PROPERTY_CREATE_LABEL_CLASS}>Тип оренди</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {RENTAL_TYPE_OPTIONS.map((option) => {
            const isActive = rentalType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => model.form.setValue('rentalType', option.value, { shouldValidate: true, shouldDirty: true })}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  isActive ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-slate-900'}`}>{option.label}</p>
                <p className="mt-1 text-xs text-slate-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={PROPERTY_CREATE_LABEL_CLASS}>Тип нерухомості</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_TYPE_OPTIONS.map((option) => {
            const isActive = propertyType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => model.form.setValue('propertyType', option.value, { shouldValidate: true, shouldDirty: true })}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {errors.propertyType ? <p className="mt-1 text-xs text-red-600">{errors.propertyType.message}</p> : null}
      </div>

      <div>
        <p className={PROPERTY_CREATE_LABEL_CLASS}>Ринок</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setValue('marketType', undefined, { shouldDirty: true })}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              !marketType ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700'
            }`}
          >
            Не вказано
          </button>
          {MARKET_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('marketType', option.value, { shouldDirty: true })}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                marketType === option.value ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className={PROPERTY_CREATE_LABEL_CLASS}>
          Заголовок оголошення
        </label>
        <input
          id="title"
          type="text"
          placeholder="Наприклад: Сучасна 2-кімнатна квартира біля метро"
          className={PROPERTY_CREATE_INPUT_CLASS}
          {...register('title')}
        />
        {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title.message}</p> : null}
      </div>

      <div>
        <label htmlFor="description" className={PROPERTY_CREATE_LABEL_CLASS}>
          Опис
        </label>
        <textarea
          id="description"
          rows={7}
          placeholder="Опишіть переваги обʼєкта, транспорт, інфраструктуру, умови..."
          className={`${PROPERTY_CREATE_INPUT_CLASS} resize-y`}
          {...register('description')}
        />
        {errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description.message}</p> : null}
      </div>
    </div>
  );
};
