'use client';

import { useQuery } from '@tanstack/react-query';
import { productAPI } from '@/services/api';
import ProductCard from './ProductCard';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import { useCategoryStore } from '../store/useCategoryStore';
import { useEffect } from 'react';

interface TrendingGridProps {
    selectedFilter: string;
}

const TrendingGrid = ({ selectedFilter }: TrendingGridProps) => {
    const { categories, fetchCategories } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Find the actual category name from the database that matches the filter
    // This handles case-insensitive matching and plural/singular variations
    const getCategoryName = () => {
        if (!categories || categories.length === 0) {
            return selectedFilter; // Fallback to the filter name if categories not loaded
        }

        // Try exact match first (case-insensitive)
        const exactMatch = categories.find(
            cat => cat.name.toLowerCase() === selectedFilter.toLowerCase()
        );
        if (exactMatch) return exactMatch.name;

        // Try plural/singular variations
        const lowerFilter = selectedFilter.toLowerCase();
        const variations = [
            lowerFilter,
            lowerFilter + 's', // Add 's' for plural
            lowerFilter.slice(0, -1), // Remove last char (for plural to singular)
        ];

        for (const variation of variations) {
            const match = categories.find(
                cat => cat.name.toLowerCase() === variation
            );
            if (match) return match.name;
        }

        // If no match found, return the original filter name
        return selectedFilter;
    };

    const categoryName = getCategoryName();

    const { data, isLoading } = useQuery({
        queryKey: ['trending-grid', categoryName],
        queryFn: async () => {
            const params = {
                categories: categoryName,
                limit: 4,
            };
            const res = await productAPI.getByFilter(params);
            return res.data;
        },
        enabled: !!categoryName, // Only run query when we have a category name
    });

    const products = data?.items || [];

    return (
        <div className="w-full py-4">
            {isLoading ? (
                <div className="h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" text={`Loading ${categoryName}...`} />
                </div>
            ) : (
                <>
                    {/* Desktop: 4 columns with better spacing, Mobile: 2 columns */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-6 gap-y-6 lg:gap-y-8 mb-8">
                        {products.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            No products found for {categoryName}
                        </div>
                    )}

                    <div className="flex justify-center">
                        <Link
                            href={`/products?categories=${categoryName}`}
                            className="px-8 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] font-medium hover:opacity-80 transition-opacity"
                        >
                            View More
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default TrendingGrid;
