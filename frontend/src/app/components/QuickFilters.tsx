'use client';

import { useCategoryStore } from '../store/useCategoryStore';
import { useEffect, useMemo } from 'react';

interface QuickFiltersProps {
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
}

// Default filters as fallback
const DEFAULT_FILTERS = ['Jacket', 'Hoodies', 'Sweatshirt'];

const QuickFilters = ({ selectedFilter, onFilterChange }: QuickFiltersProps) => {
    const { categories, fetchCategories } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Get filter names from categories, or use defaults
    const filters = useMemo(() => {
        if (!categories || categories.length === 0) {
            return DEFAULT_FILTERS;
        }

        // Try to find categories that match our default filter names (case-insensitive)
        const filterNames: string[] = [];

        for (const defaultFilter of DEFAULT_FILTERS) {
            const lowerDefault = defaultFilter.toLowerCase();
            // Try exact match
            let match = categories.find(
                cat => cat.name.toLowerCase() === lowerDefault
            );
            
            // Try plural/singular variations if no exact match
            if (!match) {
                match = categories.find(
                    cat => {
                        const lowerName = cat.name.toLowerCase();
                        return lowerName === lowerDefault + 's' || 
                               lowerName + 's' === lowerDefault ||
                               lowerName === lowerDefault.slice(0, -1) ||
                               lowerName.slice(0, -1) === lowerDefault;
                    }
                );
            }

            if (match) {
                filterNames.push(match.name);
            } else {
                // If no match found, use the default name
                filterNames.push(defaultFilter);
            }
        }

        return filterNames.length > 0 ? filterNames : DEFAULT_FILTERS;
    }, [categories]);
    return (
        <div className="w-full py-6 px-4">
            <div className="flex justify-between gap-3">
                {filters.map((filter) => {
                    // Compare case-insensitively to handle any mismatches
                    const isSelected = selectedFilter.toLowerCase() === filter.toLowerCase();
                    return (
                        <button
                            key={filter}
                            onClick={() => onFilterChange(filter)}
                            className={`flex-1 py-1.5 px-1 text-xs sm:text-sm uppercase tracking-wider font-medium border rounded-lg transition-all duration-300 ${isSelected
                                    ? 'bg-black text-white border-black'
                                    : 'bg-transparent text-gray-800 border-gray-300 hover:border-black'
                                }`}
                        >
                            {filter}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickFilters;
