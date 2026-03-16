import { COLLAPSIBLE_LIMIT } from '@/constants/searchFilters';
import type { ChipOption } from '@/types/search';

export const FilterButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${active ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
  >
    {label}
  </button>
);

export const DropdownTrigger = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-11 rounded-full border px-4 font-semibold ${active ? 'border-gray-600 bg-white' : 'border-transparent bg-white'}`}
  >
    {label}
  </button>
);

export const CollapsibleOptionsRow = ({
  rowId,
  label,
  options,
  expandedRows,
  onToggleRow,
}: {
  rowId: string;
  label: string;
  options: ChipOption[];
  expandedRows: Record<string, boolean>;
  onToggleRow: (rowId: string) => void;
}) => {
  const expanded = Boolean(expandedRows[rowId]);
  const showToggle = options.length > COLLAPSIBLE_LIMIT;
  const visibleOptions = expanded || !showToggle ? options : options.slice(0, COLLAPSIBLE_LIMIT);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
      <p className="pt-2 text-sm font-semibold text-gray-700">{label}</p>
      <div className="min-w-0">
        <div className={expanded || !showToggle ? 'flex flex-wrap items-center gap-2' : 'flex flex-nowrap items-center gap-2'}>
          {visibleOptions.map((option) => (
            <FilterButton key={option.key} label={option.label} active={option.active} onClick={option.onClick} />
          ))}
          {showToggle && (
            <button
              type="button"
              onClick={() => onToggleRow(rowId)}
              className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
            >
              {expanded ? 'Згорнути' : 'Розгорнути'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
