import { CATEGORY_LABELS, PROPERTY_TYPES } from '@/constants/searchFilters';
import type { SearchFiltersPanelProps } from '@/components/search/SearchFiltersPanel.types';
import { CollapsibleOptionsRow } from './FilterControls';

interface SearchFiltersExtraPanelProps
  extends Pick<
    SearchFiltersPanelProps,
    | 'extra'
    | 'sortMode'
    | 'extraCount'
    | 'filteredCount'
    | 'amenitiesGrouped'
    | 'amenitiesLoading'
    | 'onExtraDraftChange'
    | 'onExtraImmediateChange'
    | 'onAmenitySlugToggle'
    | 'onAmenityCategoryToggle'
    | 'onSortModeChange'
    | 'onCommitFilters'
    | 'onResetAllFilters'
  > {
  isMapMode: boolean;
  expandedRows: Record<string, boolean>;
  onToggleRow: (rowId: string) => void;
  onClose: () => void;
}

export const SearchFiltersExtraPanel = ({
  isMapMode,
  extra,
  sortMode,
  filteredCount,
  amenitiesGrouped,
  amenitiesLoading,
  onExtraDraftChange,
  onExtraImmediateChange,
  onAmenitySlugToggle,
  onAmenityCategoryToggle,
  onSortModeChange,
  onCommitFilters,
  onResetAllFilters,
  expandedRows,
  onToggleRow,
  onClose,
}: SearchFiltersExtraPanelProps) => (
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
        onToggleRow={onToggleRow}
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
        onToggleRow={onToggleRow}
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
        onToggleRow={onToggleRow}
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
        onToggleRow={onToggleRow}
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
        onToggleRow={onToggleRow}
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
            onToggleRow={onToggleRow}
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
        onToggleRow={onToggleRow}
      />
    </div>

    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => {
          onCommitFilters();
          onClose();
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
);
