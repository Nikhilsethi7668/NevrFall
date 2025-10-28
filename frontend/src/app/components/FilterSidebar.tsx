'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FilterSidebar({ filters, facetsData, handleFilterChange, clearFilters, categories }: any) {
  const [openSections, setOpenSections] = useState<string[]>(['category', 'size', 'sleeves', 'price']);
  
  // Local state for pending filters (not yet applied)
  const [pendingFilters, setPendingFilters] = useState({
    category: '',
    size: '',
    sleeves: '',
    price: 5000,
  });

  // Initialize pending filters from applied filters
  useEffect(() => {
    setPendingFilters({
      category: filters.category || '',
      size: filters.size || '',
      sleeves: filters.sleeves || '',
      price: filters.price || 5000,
    });
  }, [filters]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const isOpen = (section: string) => openSections.includes(section);

  // Handle local filter changes (doesn't trigger API call)
  const handleLocalFilterChange = (key: string, value: string | number) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters when Apply button is clicked
  const applyFilters = () => {
    // Apply each filter to the parent component
    Object.keys(pendingFilters).forEach((key) => {
      handleFilterChange(key, pendingFilters[key as keyof typeof pendingFilters]);
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setPendingFilters({
      category: '',
      size: '',
      sleeves: '',
      price: 5000,
    });
    clearFilters();
  };

  // Count active filters
  const activeFilterCount = Object.values(pendingFilters).filter(
    (value) => value !== '' && value !== 5000
  ).length;

  return (
    <aside className='w-full lg:w-72 bg-white border-r sticky top-20 h-fit px-4 py-5'>
      <h2 className='text-lg font-bold mb-4'>FILTERS</h2>

      {/* Category */}
      <div className='border-t py-3'>
        <button
          onClick={() => toggleSection('category')}
          className='flex justify-between items-center w-full font-semibold'
        >
          CATEGORY {isOpen('category') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen('category') && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleLocalFilterChange('category', cat.name)}
                  className={`border px-3 py-1 text-sm ${
                    pendingFilters.category === cat.name ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            <p className='text-sm text-gray-500 cursor-pointer ml-auto hover:underline'>View More</p>
          </div>
        )}
      </div>

      {/* Size */}
      <div className='border-t py-3'>
        <button
          onClick={() => toggleSection('size')}
          className='flex justify-between items-center w-full font-semibold'
        >
          SIZE {isOpen('size') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen('size') && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'].map((size) => (
              <button
                key={size}
                onClick={() => handleLocalFilterChange('size', size)}
                className={`border px-3 py-1 text-sm ${
                  pendingFilters.size === size ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                {size}
              </button>
            ))}
            <p className='text-sm text-gray-500 cursor-pointer ml-auto hover:underline'>View More</p>
          </div>
        )}
      </div>

      {/* Sleeves */}
      <div className='border-t py-3'>
        <button
          onClick={() => toggleSection('sleeves')}
          className='flex justify-between items-center w-full font-semibold'
        >
          SLEEVES {isOpen('sleeves') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen('sleeves') && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {['FULL SLEEVE', 'HALF SLEEVE'].map((sleeve) => (
              <button
                key={sleeve}
                onClick={() => handleLocalFilterChange('sleeves', sleeve)}
                className={`border px-3 py-1 text-sm ${
                  pendingFilters.sleeves === sleeve ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                {sleeve}
              </button>
            ))}
          </div>
        )}
      </div>

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
              value={pendingFilters.price}
              className='range range-sm'
              onChange={(e) => handleLocalFilterChange('price', e.target.value)}
            />
            <div className='flex justify-between text-sm mt-1'>
              <span>₹0</span>
              <span>₹{pendingFilters.price}</span>
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
}