import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { AmenityCategory, RentalType } from '@/types/enums';
import type { LocationSuggestionDto } from '@/types/location';
import type { AmenityCategoryGroupDto } from '@/types/property';
import type { SearchExtraFilters, SearchMainPanel, SearchSortMode } from '@/types/search';
import { CollapsibleOptionsRow, DropdownTrigger } from './filters/FilterControls';
import { CATEGORY_LABELS, LOCATION_TYPE_LABELS, PROPERTY_TYPES } from './filters/constants';

interface SearchFiltersPanelProps {
  mode?: 'default' | 'map';
  mapFormAction?: ReactNode;
  cityInput: string;
  rentalType?: RentalType;
  priceFrom: string;
  priceTo: string;
  roomsMin: string;
  roomsMax: string;
  areaFrom: string;
  areaTo: string;
  extra: SearchExtraFilters;
  sortMode: SearchSortMode;
  extraCount: number;
  filteredCount: number;
  suggestions: LocationSuggestionDto[];
  suggestionsLoading: boolean;
  amenitiesGrouped: AmenityCategoryGroupDto[];
  amenitiesLoading: boolean;
  onCityInputChange: (value: string) => void;
  onLocationSuggestionSelect: (suggestion: LocationSuggestionDto) => void;
  onRentalTypeChange: (value: string) => void;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  onRoomsSelect: (value: string) => void;
  onRoomsMaxChange: (value: string) => void;
  onAreaFromChange: (value: string) => void;
  onAreaToChange: (value: string) => void;
  onExtraDraftChange: (patch: Partial<SearchExtraFilters>) => void;
  onExtraImmediateChange: (patch: Partial<SearchExtraFilters>) => void;
  onAmenitySlugToggle: (slug: string) => void;
  onAmenityCategoryToggle: (category: AmenityCategory) => void;
  onSortModeChange: (mode: SearchSortMode) => void;
  onCommitFilters: () => void;
  onResetAllFilters: () => void;
}

const rangeLabel = (label: string, from: string, to: string, unit: string): string => {
  if (from && to) return `${label}: ${from}-${to} ${unit}`;
  if (from) return `${label}: від ${from} ${unit}`;
  if (to) return `${label}: до ${to} ${unit}`;
  return label;
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
  const [mainPanel, setMainPanel] = useState<SearchMainPanel>(null);
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const isMapMode = mode === 'map';

  const priceRef = useRef<HTMLDivElement | null>(null);
  const roomsRef = useRef<HTMLDivElement | null>(null);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const cityRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (mainPanel) {
        const panelRef = mainPanel === 'price' ? priceRef : mainPanel === 'rooms' ? roomsRef : areaRef;
        if (panelRef.current && !panelRef.current.contains(target)) {
          setMainPanel(null);
        }
      }

      if (cityRef.current && !cityRef.current.contains(target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [mainPanel]);

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  const applyMainPanel = () => {
    onCommitFilters();
    setMainPanel(null);
  };

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
          <label className="relative">
            <select
              value={rentalType ?? ''}
              onChange={(event) => onRentalTypeChange(event.target.value)}
              className="h-11 appearance-none rounded-full bg-white pl-4 pr-10 font-semibold"
            >
              <option value="">Тип оренди</option>
              <option value="SHORT_TERM">Подобово</option>
              <option value="LONG_TERM">Довгостроково</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </label>

          <div ref={priceRef} className="relative">
            <DropdownTrigger
              label={rangeLabel('Ціна', priceFrom, priceTo, 'грн')}
              active={mainPanel === 'price'}
              onClick={() => setMainPanel((prev) => (prev === 'price' ? null : 'price'))}
            />
            {mainPanel === 'price' && (
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
                  onClick={applyMainPanel}
                  className="mt-3 h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Застосувати
                </button>
              </div>
            )}
          </div>

          <div ref={roomsRef} className="relative">
            <DropdownTrigger
              label={roomsMin ? `Кімнати: ${roomsMin}+` : 'Кімнати'}
              active={mainPanel === 'rooms'}
              onClick={() => setMainPanel((prev) => (prev === 'rooms' ? null : 'rooms'))}
            />
            {mainPanel === 'rooms' && (
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
                  onClick={applyMainPanel}
                  className="mt-3 h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Застосувати
                </button>
              </div>
            )}
          </div>

          <div ref={areaRef} className="relative">
            <DropdownTrigger
              label={rangeLabel('Площа', areaFrom, areaTo, 'м²')}
              active={mainPanel === 'area'}
              onClick={() => setMainPanel((prev) => (prev === 'area' ? null : 'area'))}
            />
            {mainPanel === 'area' && (
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
                  onClick={applyMainPanel}
                  className="mt-3 h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Застосувати
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExtraOpen((prev) => !prev)}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 font-semibold ${
              isExtraOpen ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white'
            }`}
          >
            <SlidersHorizontal size={16} /> Всі фільтри
            {extraCount > 0 && (
              <span className="min-w-5 rounded-full bg-blue-600 px-1 text-center text-xs leading-5 text-white">{extraCount}</span>
            )}
          </button>
        </div>

        {isExtraOpen && (
          <div
            className={
              isMapMode
                ? 'absolute left-0 right-0 top-[calc(100%+10px)] z-[760] max-h-[68vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6'
                : 'mt-3 rounded-3xl border border-gray-200 bg-white p-5 sm:p-6'
            }
          >
            <div className="grid grid-cols-1 gap-5">
              <CollapsibleOptionsRow
                rowId="property-type"
                label="Тип житла"
                options={[
                  {
                    key: 'all',
                    label: 'Усі',
                    active: !extra.propertyType,
                    onClick: () => onExtraImmediateChange({ propertyType: undefined }),
                  },
                  ...PROPERTY_TYPES.map((propertyType) => ({
                    key: propertyType.value,
                    label: propertyType.label,
                    active: extra.propertyType === propertyType.value,
                    onClick: () => onExtraImmediateChange({ propertyType: propertyType.value }),
                  })),
                ]}
                expandedRows={expandedRows}
                onToggleRow={toggleRow}
              />

              <CollapsibleOptionsRow
                rowId="market-type"
                label="Ринок"
                options={[
                  {
                    key: 'all',
                    label: 'Усі',
                    active: !extra.marketType,
                    onClick: () => onExtraImmediateChange({ marketType: undefined }),
                  },
                  {
                    key: 'SECONDARY',
                    label: 'Вторинний',
                    active: extra.marketType === 'SECONDARY',
                    onClick: () => onExtraImmediateChange({ marketType: 'SECONDARY' }),
                  },
                  {
                    key: 'NEW_BUILD',
                    label: 'Новобудова',
                    active: extra.marketType === 'NEW_BUILD',
                    onClick: () => onExtraImmediateChange({ marketType: 'NEW_BUILD' }),
                  },
                ]}
                expandedRows={expandedRows}
                onToggleRow={toggleRow}
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
                <p className="pt-2 text-sm font-semibold text-gray-700">Поверх</p>
                <div className="grid max-w-md grid-cols-2 gap-2">
                  <input
                    value={extra.minFloor}
                    onChange={(event) => onExtraDraftChange({ minFloor: event.target.value })}
                    placeholder="Від"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                  <input
                    value={extra.maxFloor}
                    onChange={(event) => onExtraDraftChange({ maxFloor: event.target.value })}
                    placeholder="До"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
                <p className="pt-2 text-sm font-semibold text-gray-700">Поверховість будинку</p>
                <div className="grid max-w-md grid-cols-2 gap-2">
                  <input
                    value={extra.minTotalFloors}
                    onChange={(event) => onExtraDraftChange({ minTotalFloors: event.target.value })}
                    placeholder="Від"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                  <input
                    value={extra.maxTotalFloors}
                    onChange={(event) => onExtraDraftChange({ maxTotalFloors: event.target.value })}
                    placeholder="До"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
                <p className="pt-2 text-sm font-semibold text-gray-700">Спальні місця</p>
                <div className="grid max-w-md grid-cols-2 gap-2">
                  <input
                    value={extra.minSleepingPlaces}
                    onChange={(event) => onExtraDraftChange({ minSleepingPlaces: event.target.value })}
                    placeholder="Від"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                  <input
                    value={extra.maxSleepingPlaces}
                    onChange={(event) => onExtraDraftChange({ maxSleepingPlaces: event.target.value })}
                    placeholder="До"
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
                <p className="pt-2 text-sm font-semibold text-gray-700">Дати</p>
                <div className="grid max-w-md grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={extra.dateFrom}
                    onChange={(event) => onExtraDraftChange({ dateFrom: event.target.value })}
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                  <input
                    type="date"
                    value={extra.dateTo}
                    onChange={(event) => onExtraDraftChange({ dateTo: event.target.value })}
                    className="h-10 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                </div>
              </div>

              <CollapsibleOptionsRow
                rowId="living-rules"
                label="Умови проживання"
                options={[
                  {
                    key: 'pets',
                    label: 'Можна з тваринами',
                    active: extra.petsAllowed,
                    onClick: () => onExtraImmediateChange({ petsAllowed: !extra.petsAllowed }),
                  },
                  {
                    key: 'smoking',
                    label: 'Дозволено курити',
                    active: extra.smokingAllowed,
                    onClick: () => onExtraImmediateChange({ smokingAllowed: !extra.smokingAllowed }),
                  },
                  {
                    key: 'parties',
                    label: 'Можна вечірки',
                    active: extra.partiesAllowed,
                    onClick: () => onExtraImmediateChange({ partiesAllowed: !extra.partiesAllowed }),
                  },
                ]}
                expandedRows={expandedRows}
                onToggleRow={toggleRow}
              />

              <CollapsibleOptionsRow
                rowId="reliability"
                label="Надійність"
                options={[
                  {
                    key: 'verified-property',
                    label: 'Перевірене житло',
                    active: extra.verifiedProperty,
                    onClick: () => onExtraImmediateChange({ verifiedProperty: !extra.verifiedProperty }),
                  },
                  {
                    key: 'verified-realtor',
                    label: 'Перевірений рієлтор',
                    active: extra.verifiedRealtor,
                    onClick: () => onExtraImmediateChange({ verifiedRealtor: !extra.verifiedRealtor }),
                  },
                  {
                    key: 'hide-duplicates',
                    label: 'Приховати дублікати',
                    active: extra.hideDuplicates,
                    onClick: () => onExtraImmediateChange({ hideDuplicates: !extra.hideDuplicates }),
                  },
                ]}
                expandedRows={expandedRows}
                onToggleRow={toggleRow}
              />

              <CollapsibleOptionsRow
                rowId="amenity-categories"
                label="Категорії зручностей"
                options={amenitiesGrouped.map((group) => ({
                  key: group.category,
                  label: CATEGORY_LABELS[group.category] || group.category,
                  active: extra.amenityCategories.includes(group.category),
                  onClick: () => onAmenityCategoryToggle(group.category),
                }))}
                expandedRows={expandedRows}
                onToggleRow={toggleRow}
              />

              {amenitiesLoading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
                  <p className="pt-2 text-sm font-semibold text-gray-700">Зручності</p>
                  <div className="text-sm text-gray-500">Завантаження зручностей...</div>
                </div>
              ) : (
                amenitiesGrouped.map((group) => (
                  <CollapsibleOptionsRow
                    key={group.category}
                    rowId={`amenity-group-${group.category}`}
                    label={CATEGORY_LABELS[group.category] || group.category}
                    options={group.amenities.map((amenity) => ({
                      key: amenity.slug,
                      label: amenity.name,
                      active: extra.amenitySlugs.includes(amenity.slug),
                      onClick: () => onAmenitySlugToggle(amenity.slug),
                    }))}
                    expandedRows={expandedRows}
                    onToggleRow={toggleRow}
                  />
                ))
              )}

              <CollapsibleOptionsRow
                rowId="sorting"
                label="Сортування"
                options={[
                  {
                    key: 'NEWEST',
                    label: 'Спочатку новіші',
                    active: sortMode === 'NEWEST',
                    onClick: () => onSortModeChange('NEWEST'),
                  },
                  {
                    key: 'PRICE_ASC',
                    label: 'Дешевші',
                    active: sortMode === 'PRICE_ASC',
                    onClick: () => onSortModeChange('PRICE_ASC'),
                  },
                  {
                    key: 'PRICE_DESC',
                    label: 'Дорожчі',
                    active: sortMode === 'PRICE_DESC',
                    onClick: () => onSortModeChange('PRICE_DESC'),
                  },
                ]}
                expandedRows={expandedRows}
                onToggleRow={toggleRow}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  onCommitFilters();
                  setIsExtraOpen(false);
                }}
                className="h-11 rounded-full bg-[#f39b1d] px-6 font-semibold text-white"
              >
                Показати {filteredCount} оголошень
              </button>
              <button
                type="button"
                onClick={onResetAllFilters}
                className="h-11 rounded-full border border-gray-300 bg-white px-6 font-semibold text-gray-700"
              >
                Скинути фільтри
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
