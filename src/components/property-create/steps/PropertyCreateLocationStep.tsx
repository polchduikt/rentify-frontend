import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { MapPicker } from '@/components/property-create/MapPicker';
import { PROPERTY_CREATE_INPUT_CLASS, PROPERTY_CREATE_LABEL_CLASS } from '@/constants/propertyCreateUi';
import type { CreatePropertyPageModel } from '@/hooks/useCreatePropertyPage';

interface PropertyCreateLocationStepProps {
  model: CreatePropertyPageModel;
}

export const PropertyCreateLocationStep = ({ model }: PropertyCreateLocationStepProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const {
    register,
    watch,
    formState: { errors },
  } = model.form;

  const cityQuery = watch('cityQuery');

  return (
    <div className="space-y-6">
      <div className="relative">
        <label htmlFor="cityQuery" className={PROPERTY_CREATE_LABEL_CLASS}>
          Місто / район / метро / ЖК
        </label>
        <input
          id="cityQuery"
          type="text"
          placeholder="Почніть вводити назву..."
          value={cityQuery}
          onChange={(event) => {
            model.onCityQueryChange(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className={PROPERTY_CREATE_INPUT_CLASS}
        />
        {errors.cityQuery ? <p className="mt-1 text-xs text-red-600">{errors.cityQuery.message}</p> : null}

        {showSuggestions && cityQuery.trim().length >= 2 ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            {model.suggestionsLoading ? (
              <div className="px-4 py-3 text-sm text-slate-500">Завантаження...</div>
            ) : model.suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">Нічого не знайдено</div>
            ) : (
              model.suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  onClick={() => {
                    model.onSelectLocationSuggestion(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="block w-full border-b border-slate-100 px-4 py-2.5 text-left text-sm last:border-b-0 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">{suggestion.name}</span>
                  <span className="ml-2 text-slate-400">{suggestion.type}</span>
                  <span className="ml-2 text-slate-500">{suggestion.cityName}</span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="country" className={PROPERTY_CREATE_LABEL_CLASS}>
            Країна
          </label>
          <input id="country" type="text" className={PROPERTY_CREATE_INPUT_CLASS} {...register('country')} />
          {errors.country ? <p className="mt-1 text-xs text-red-600">{errors.country.message}</p> : null}
        </div>
        <div>
          <label htmlFor="region" className={PROPERTY_CREATE_LABEL_CLASS}>
            Область / регіон
          </label>
          <input id="region" type="text" className={PROPERTY_CREATE_INPUT_CLASS} {...register('region')} />
        </div>
        <div>
          <label htmlFor="city" className={PROPERTY_CREATE_LABEL_CLASS}>
            Місто
          </label>
          <input id="city" type="text" className={PROPERTY_CREATE_INPUT_CLASS} {...register('city')} />
          {errors.city ? <p className="mt-1 text-xs text-red-600">{errors.city.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="street" className={PROPERTY_CREATE_LABEL_CLASS}>
            Вулиця
          </label>
          <input id="street" type="text" className={PROPERTY_CREATE_INPUT_CLASS} {...register('street')} />
          {errors.street ? <p className="mt-1 text-xs text-red-600">{errors.street.message}</p> : null}
        </div>
        <div>
          <label htmlFor="houseNumber" className={PROPERTY_CREATE_LABEL_CLASS}>
            Будинок
          </label>
          <input id="houseNumber" type="text" className={PROPERTY_CREATE_INPUT_CLASS} {...register('houseNumber')} />
        </div>
        <div>
          <label htmlFor="apartment" className={PROPERTY_CREATE_LABEL_CLASS}>
            Квартира
          </label>
          <input id="apartment" type="text" className={PROPERTY_CREATE_INPUT_CLASS} {...register('apartment')} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="postalCode" className={PROPERTY_CREATE_LABEL_CLASS}>
            Поштовий індекс
          </label>
          <input id="postalCode" type="text" className={PROPERTY_CREATE_INPUT_CLASS} {...register('postalCode')} />
        </div>
        <div>
          <label htmlFor="lat" className={PROPERTY_CREATE_LABEL_CLASS}>
            Широта
          </label>
          <input id="lat" type="text" className={`${PROPERTY_CREATE_INPUT_CLASS} bg-slate-50`} readOnly {...register('lat')} />
          {errors.lat ? <p className="mt-1 text-xs text-red-600">{errors.lat.message}</p> : null}
        </div>
        <div>
          <label htmlFor="lng" className={PROPERTY_CREATE_LABEL_CLASS}>
            Довгота
          </label>
          <input id="lng" type="text" className={`${PROPERTY_CREATE_INPUT_CLASS} bg-slate-50`} readOnly {...register('lng')} />
          {errors.lng ? <p className="mt-1 text-xs text-red-600">{errors.lng.message}</p> : null}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <MapPin size={16} className="text-blue-600" />
          Оберіть точку на карті
        </div>
        <MapPicker lat={model.selectedCoords?.lat} lng={model.selectedCoords?.lng} onPick={model.onPickCoordinates} />
        <p className="mt-2 text-xs text-slate-500">Натисніть на мапі, щоб зафіксувати координати обʼєкта.</p>
        {model.isReverseGeocoding ? <p className="mt-1 text-xs text-blue-600">Оновлюю адресу за вибраною точкою...</p> : null}
        {model.reverseGeocodingError ? <p className="mt-1 text-xs text-amber-700">{model.reverseGeocodingError}</p> : null}
      </div>
    </div>
  );
};
