import { useEffect, useRef, useState } from 'react';
import type { SearchMainPanel } from '@/types/search';

export const useSearchFiltersPanelState = () => {
  const [mainPanel, setMainPanel] = useState<SearchMainPanel>(null);
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const rentalTypeRef = useRef<HTMLDivElement | null>(null);
  const priceRef = useRef<HTMLDivElement | null>(null);
  const roomsRef = useRef<HTMLDivElement | null>(null);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const cityRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (mainPanel) {
        const panelRef =
          mainPanel === 'rental' ? rentalTypeRef : mainPanel === 'price' ? priceRef : mainPanel === 'rooms' ? roomsRef : areaRef;
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

  const applyMainPanel = (onCommitFilters: () => void) => {
    onCommitFilters();
    setMainPanel(null);
  };

  return {
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
  };
};
