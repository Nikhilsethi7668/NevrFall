'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as Dialog from "@radix-ui/react-dialog";
import { GiSettingsKnobs } from "react-icons/gi";

// --- Helper to capitalize filter keys ---
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function FilterSidebar({ filters, facetsData, handleFilterChange, clearFilters }: any) {
  const [openSections, setOpenSections] = useState<string[]>(['price']);
  const [isFilterBar, setIsFilterBar] = useState<boolean>(false);

  // --- Dynamic state for pending filters ---
  const [pendingFilters, setPendingFilters] = useState<Record<string, any>>({});

  // --- Initialize pending filters from URL or defaults ---
  useEffect(() => {
    const initialFilters: Record<string, any> = { ...filters };
    if (!initialFilters.price) initialFilters.price = 10000;

    setPendingFilters(initialFilters);

    // Open sections that have active filters
    const activeSections = Object.keys(initialFilters).filter(key =>
      initialFilters[key] && key !== 'price'
    );
    setOpenSections(prev => Array.from(new Set([...prev, 'price', ...activeSections])));
  }, [filters]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const isOpen = (section: string) => openSections.includes(section);

  // --- Handle local filter changes (Multi-select support) ---
  const handleLocalFilterChange = (key: string, value: string | number) => {
    setPendingFilters((prev) => {
      const current = prev[key];

      // For Price (number), just replace
      if (key === 'price') {
        return { ...prev, [key]: value };
      }

      // For other filters (assume array or implicit array)
      let newValue;
      if (Array.isArray(current)) {
        if (current.includes(value)) {
          newValue = current.filter(item => item !== value); // Remove
        } else {
          newValue = [...current, value]; // Add
        }
      } else {
        // If it was a single string or undefined, convert to array logic
        if (current === value) {
          newValue = []; // Toggle off
        } else if (current) {
          newValue = [current, value]; // Add to existing single
        } else {
          newValue = [value]; // Start new array
        }
      }

      // If empty array, remove they key or set to null/empty? 
      // Let's keep it as empty array or undefined to represent no filter.
      if (Array.isArray(newValue) && newValue.length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [key]: newValue };
    });
  };

  // --- Apply all pending filters ---
  const applyFilters = () => {
    handleFilterChange(pendingFilters);
    setIsFilterBar(false); // Close dialog on apply
  };

  // --- Clear all filters ---
  const handleClearFilters = () => {
    const cleared: Record<string, any> = { price: 10000 };
    setPendingFilters(cleared);
    clearFilters(); // Calls setFilters({}) in parent
  };

  // --- Count active filters (excluding default price) ---
  const activeFilterCount = Object.entries(pendingFilters).filter(
    ([key, value]) => value && (key !== 'price' || Number(value) !== 10000)
  ).length;

  // --- Render a single filter section ---
  const renderFilterSection = (key: string, facet: any) => {
    const options = facet || [];
    const current = pendingFilters[key]; // Can be string or array

    // Helper to check if option is selected
    const isSelected = (val: string) => {
      if (Array.isArray(current)) return current.includes(val);
      return current === val;
    };

    return (
      <div key={key} className='border-t py-3'>
        <button
          onClick={() => toggleSection(key)}
          className='flex justify-between items-center w-full font-semibold'
        >
          {capitalize(key)} {isOpen(key) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen(key) && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {options && options.length > 0 && options.map((option: any) => {
              const val = option.slug || option.size || option.color;
              const selected = isSelected(val);
              return (
                <button
                  key={val}
                  onClick={() => handleLocalFilterChange(key, val)}
                  className={`border px-3 py-1 text-[10px] transition-colors ${selected ? 'bg-black text-white' : 'hover:bg-gray-100'
                    }`}
                >
                  {option.name || option.size || option.color} ({option.count})
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderDesktopSidebar = () => (
    <aside className='w-full lg:w-72 hidden sm:block bg-white border-r sticky top-20 h-fit px-4 py-5'>
      <h2 className='text-[12px] font-bold mb-4'>FILTERS</h2>

      {facetsData && Object.entries(facetsData).map(([key, facet]: [string, any]) =>
        renderFilterSection(key, facet)
      )}

      {/* Price */}
      <div className='border-t py-3'>
        <button
          onClick={() => toggleSection('price')}
          className='flex justify-between items-center w-full font-semibold'
        >
          PRICE {isOpen('price') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen('price') && (
          <div className='mt-3'>
            <input
              type='range'
              min='0'
              max='10000'
              value={pendingFilters.price || 10000}
              className='range range-sm'
              onChange={(e) => handleLocalFilterChange('price', parseInt(e.target.value, 10))}
            />
            <div className='flex justify-between text-[10px] mt-1'>
              <span>₹0</span>
              <span>₹{pendingFilters.price || 10000}</span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className='flex gap-2 mt-6'>
        <button onClick={handleClearFilters} className='btn btn-outline w-1/2'>
          CLEAR
        </button>
        <button onClick={applyFilters} className='btn btn-neutral w-1/2'>
          APPLY {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
        </button>
      </div>
    </aside>
  );

  const renderMobileDialog = () => (
    <Dialog.Root open={isFilterBar} onOpenChange={setIsFilterBar}>
      <Dialog.Trigger asChild>
        <button className="md:hidden lg:hidden"><GiSettingsKnobs /></button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed bottom-0 inset-x-0 w-full max-w-sm mx-auto bg-white rounded-t-2xl shadow-lg p-6 flex flex-col max-h-[80vh]">
          <Dialog.Title className="text-[12px] font-semibold text-center text-secondary mb-4">
            Filters
          </Dialog.Title>
          <div className="overflow-y-auto grow">
            {facetsData && Object.entries(facetsData).map(([key, facet]: [string, any]) =>
              renderFilterSection(key, facet)
            )}

            {/* Price */}
            <div className='border-t py-3'>
              <button
                onClick={() => toggleSection('price')}
                className='flex justify-between items-center w-full font-semibold'
              >
                PRICE {isOpen('price') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen('price') && (
                <div className='mt-3'>
                  <input
                    type='range'
                    min='0'
                    max='10000'
                    value={pendingFilters.price || 10000}
                    className='range range-sm'
                    onChange={(e) => handleLocalFilterChange('price', parseInt(e.target.value, 10))}
                  />
                  <div className='flex justify-between text-[10px] mt-1'>
                    <span>₹0</span>
                    <span>₹{pendingFilters.price || 10000}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Buttons */}
          <div className='flex gap-2 mt-6'>
            <button onClick={handleClearFilters} className='btn btn-outline w-1/2'>
              CLEAR
            </button>
            <button onClick={applyFilters} className='btn btn-neutral w-1/2'>
              APPLY {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
          </div>
          <Dialog.Close asChild>
            <button className="btn btn-sm btn-circle absolute right-3 top-3">✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return (
    <>
      {renderDesktopSidebar()}
      {renderMobileDialog()}
    </>
  );
}