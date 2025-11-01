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
    const initialFilters: Record<string, any> = { price: filters.price || 5000 };
    if (facetsData) {
      Object.keys(facetsData).forEach(key => {
        initialFilters[key] = filters[key] || '';
      });
    }
    setPendingFilters(initialFilters);
    // Open sections that have active filters
    const activeSections = Object.keys(initialFilters).filter(key => initialFilters[key] && key !== 'price');
    setOpenSections(['price', ...activeSections]);
  }, [filters, facetsData]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const isOpen = (section: string) => openSections.includes(section);

  // --- Handle local filter changes ---
  const handleLocalFilterChange = (key: string, value: string | number) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  // --- Apply all pending filters ---
  const applyFilters = () => {
    handleFilterChange(pendingFilters);
    setIsFilterBar(false); // Close dialog on apply
  };

  // --- Clear all filters ---
  const handleClearFilters = () => {
    const cleared: Record<string, any> = { price: 5000 };
    if (facetsData) {
      Object.keys(facetsData).forEach(key => {
        cleared[key] = '';
      });
    }
    setPendingFilters(cleared);
    clearFilters();
  };

  // --- Count active filters (excluding default price) ---
  const activeFilterCount = Object.entries(pendingFilters).filter(
    ([key, value]) => value && (key !== 'price' || value !== 5000)
  ).length;

  // --- Render a single filter section ---
  const renderFilterSection = (key: string, facet: any) => {
    const options = facet || [];
    const currentSelection = pendingFilters[key];

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
            {options && options.length > 0 && options.map((option: any) => (
              <button
                key={option.slug || option.size || option.color}
                onClick={() => handleLocalFilterChange(key, option.slug || option.size || option.color)}
                className={`border px-3 py-1 text-sm ${
                  currentSelection === (option.slug || option.size || option.color) ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                {option.name || option.size || option.color} ({option.count})
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const renderDesktopSidebar = () => (
    <aside className='w-full lg:w-72 hidden sm:block bg-white border-r sticky top-20 h-fit px-4 py-5'>
      <h2 className='text-lg font-bold mb-4'>FILTERS</h2>

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
              max='5000'
              value={pendingFilters.price || 5000}
              className='range range-sm'
              onChange={(e) => handleLocalFilterChange('price', parseInt(e.target.value, 10))}
            />
            <div className='flex justify-between text-sm mt-1'>
              <span>₹0</span>
              <span>₹{pendingFilters.price || 5000}</span>
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
          <Dialog.Title className="text-xl font-semibold text-center text-secondary mb-4">
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
                    max='5000'
                    value={pendingFilters.price || 5000}
                    className='range range-sm'
                    onChange={(e) => handleLocalFilterChange('price', parseInt(e.target.value, 10))}
                  />
                  <div className='flex justify-between text-sm mt-1'>
                    <span>₹0</span>
                    <span>₹{pendingFilters.price || 5000}</span>
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