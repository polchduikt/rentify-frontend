import { Check, Search, SlidersHorizontal } from 'lucide-react';
import { LOCATION_TYPE_LABELS } from '@/constants/searchFilters';
import { useSearchFiltersPanelState } from '@/hooks/search/useSearchFiltersPanelState';
import type { SearchFiltersPanelProps } from './SearchFiltersPanel.types';
import { SearchFiltersExtraPanel } from './filters/SearchFiltersExtraPanel';
import { DropdownTrigger } from './filters/FilterControls';

const rangeLabel = (label: string, from: string, to: string, unit: string): string => {
  if (from && to) return `${label}: ${from}-${to} ${unit}`;
  if (from) return `${label}: від ${from} ${unit}`;
  if (to) return `${label}: до ${to} ${unit}`;
  return label;
};

const rentalTypeButtonLabel = (rentalType?: string): string => {
  if (rentalType === 'SHORT_TERM') return 'Тип оренди: Подобово';
  if (rentalType === 'LONG_TERM') return 'Тип оренди: Довгостроково';
  return 'Тип оренди';
};

export const SearchFiltersPanel = ({
  mode = 'default',
  mapFormAction,
  cityInput,
  rentalType,
  priceFrom,
  priceTo,
  roomsMin,
  roomsMax,
  areaFrom,
  areaTo,
  extra,
  sortMode,
  extraCount,
  filteredCount,
  suggestions,
  suggestionsLoading,
  amenitiesGrouped,
  amenitiesLoading,
  onCityInputChange,
  onLocationSuggestionSelect,
  onRentalTypeChange,
  onPriceFromChange,
  onPriceToChange,
  onRoomsSelect,
  onRoomsMaxChange,
  onAreaFromChange,
  onAreaToChange,
  onExtraDraftChange,
  onExtraImmediateChange,
  onAmenitySlugToggle,
  onAmenityCategoryToggle,
  onSortModeChange,
  onCommitFilters,
  onResetAllFilters,
}: SearchFiltersPanelProps) => {
  const {
    mainPanel,
    setMainPanel,
    isExtraOpen,
    setIsExtraOpen,
    showSuggestions,
    setShowSuggestions,
    expandedRows,
    toggleRow,
    applyMainPanel,
    rentalTypeRef,
    priceRef,
    roomsRef,
    areaRef,
    cityRef,
  } = useSearchFiltersPanelState();
  const isMapMode = mode === 'map';

  return (
    <section className={isMapMode ? 'border-none bg-transparent' : 'border-b border-blue-200 bg-[#93c5ed]'}>
      <div className="relative mx-auto max-w-[1320px] px-4 py-3 sm:px-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onCommitFilters();
            setShowSuggestions(false);
          }}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <div ref={cityRef} className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={cityInput}
              onChange={(event) => {
                onCityInputChange(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Місто, район, метро, ЖК..."
              className="h-12 w-full rounded-full bg-white pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {showSuggestions && cityInput.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                {suggestionsLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Завантаження підказок...</div>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Нічого не знайдено</div>
                ) : (
                  suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.type}-${suggestion.id}`}
                      type="button"
                      onClick={() => {
                        onLocationSuggestionSelect(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <span className="font-medium">{suggestion.name}</span>
                      <span className="ml-2 text-gray-400">{LOCATION_TYPE_LABELS[suggestion.type] || suggestion.type}</span>
                      <span className="ml-2 text-gray-400">{suggestion.cityName}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="h-12 rounded-full bg-[#f39b1d] px-8 font-semibold text-white hover:bg-[#e28f1b]">
              Знайти
            </button>
            {isMapMode ? mapFormAction : null}
          </div>
        </form>

        <div className={`mt-3 flex flex-wrap items-center gap-2 ${isMapMode ? 'relative' : ''}`}>
          <div ref={rentalTypeRef} className="relative">
            <DropdownTrigger
              label={rentalTypeButtonLabel(rentalType)}
              active={mainPanel === 'rental'}
              onClick={() => setMainPanel((prev) => (prev === 'rental' ? null : 'rental'))}
            />
            {mainPanel === 'rental' ? (
              <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-[240px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                {[
                  { value: '', label: 'Усі' },
                  { value: 'SHORT_TERM', label: 'Подобово' },
                  { value: 'LONG_TERM', label: 'Довгостроково' },
                ].map((option) => {
                  const isActive = (rentalType ?? '') === option.value;
                  return (
                    <button
                      key={option.value || 'all'}
                      type="button"
                      onClick={() => {
                        onRentalTypeChange(option.value);
                        setMainPanel(null);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                        isActive ? 'bg-gray-100 text-blue-700' : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span>{option.label}</span>
                      {isActive ? <Check size={16} className="text-blue-700" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div ref={priceRef} className="relative">
            <DropdownTrigger
              label={rangeLabel('Ціна', priceFrom, priceTo, 'грн')}
              active={mainPanel === 'price'}
              onClick={() => setMainPanel((prev) => (prev === 'price' ? null : 'price'))}
            />
            {mainPanel === 'price' ? (
              <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-[360px] rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
                <p className="mb-2 text-sm font-semibold">Ціна, грн</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={priceFrom}
                    onChange={(event) => onPriceFromChange(event.target.value)}
                    placeholder="Від"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                  <input
                    value={priceTo}
                    onChange={(event) => onPriceToChange(event.target.value)}
                    placeholder="До"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => applyMainPanel(onCommitFilters)}
                  className="mt-3 h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Застосувати
                </button>
              </div>
            ) : null}
          </div>

          <div ref={roomsRef} className="relative">
            <DropdownTrigger
              label={roomsMin ? `Кімнати: ${roomsMin}+` : 'Кімнати'}
              active={mainPanel === 'rooms'}
              onClick={() => setMainPanel((prev) => (prev === 'rooms' ? null : 'rooms'))}
            />
            {mainPanel === 'rooms' ? (
              <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-[360px] rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
                <p className="mb-2 text-sm font-semibold">Кількість кімнат</p>
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {['1', '2', '3', '4'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onRoomsSelect(value)}
                      className={`h-10 rounded-xl font-semibold ${roomsMin === value ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
                    >
                      {value === '4' ? '4+' : value}
                    </button>
                  ))}
                </div>
                <input
                  value={roomsMax}
                  onChange={(event) => onRoomsMaxChange(event.target.value)}
                  placeholder="Максимум кімнат"
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 outline-none"
                />
                <button
                  type="button"
                  onClick={() => applyMainPanel(onCommitFilters)}
                  className="mt-3 h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Застосувати
                </button>
              </div>
            ) : null}
          </div>

          <div ref={areaRef} className="relative">
            <DropdownTrigger
              label={rangeLabel('Площа', areaFrom, areaTo, 'м²')}
              active={mainPanel === 'area'}
              onClick={() => setMainPanel((prev) => (prev === 'area' ? null : 'area'))}
            />
            {mainPanel === 'area' ? (
              <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-[360px] rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
                <p className="mb-2 text-sm font-semibold">Загальна площа, м²</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={areaFrom}
                    onChange={(event) => onAreaFromChange(event.target.value)}
                    placeholder="Від"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                  <input
                    value={areaTo}
                    onChange={(event) => onAreaToChange(event.target.value)}
                    placeholder="До"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => applyMainPanel(onCommitFilters)}
                  className="mt-3 h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Застосувати
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsExtraOpen((prev) => !prev)}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 font-semibold ${
              isExtraOpen ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white'
            }`}
          >
            <SlidersHorizontal size={16} /> Всі фільтри
            {extraCount > 0 ? (
              <span className="min-w-5 rounded-full bg-blue-600 px-1 text-center text-xs leading-5 text-white">{extraCount}</span>
            ) : null}
          </button>
        </div>

        {isExtraOpen ? (
          <SearchFiltersExtraPanel
            isMapMode={isMapMode}
            extra={extra}
            sortMode={sortMode}
            extraCount={extraCount}
            filteredCount={filteredCount}
            amenitiesGrouped={amenitiesGrouped}
            amenitiesLoading={amenitiesLoading}
            onExtraDraftChange={onExtraDraftChange}
            onExtraImmediateChange={onExtraImmediateChange}
            onAmenitySlugToggle={onAmenitySlugToggle}
            onAmenityCategoryToggle={onAmenityCategoryToggle}
            onSortModeChange={onSortModeChange}
            onCommitFilters={onCommitFilters}
            onResetAllFilters={onResetAllFilters}
            expandedRows={expandedRows}
            onToggleRow={toggleRow}
            onClose={() => setIsExtraOpen(false)}
          />
        ) : null}
      </div>
    </section>
  );
};
