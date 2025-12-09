'use client';

import { useQuery } from '@tanstack/react-query';
import { productAPI } from '@/services/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCategoryStore } from '../store/useCategoryStore';
import { useEffect } from 'react';

const CategoryChips = () => {
    const router = useRouter();
    const { categories, fetchCategories } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const { data: collectionsData } = useQuery({
        queryKey: ['collections'],
        queryFn: async () => {
            const res = await productAPI.getAllCollections();
            return res.data;
        },
    });

    const collections = collectionsData?.data || [];

    const handleCategoryClick = (categoryName: string) => {
        router.push(`/products?categories=${categoryName}`);
    };

    const handleCollectionClick = (slugOrName: string) => {
        router.push(`/products?collections=${slugOrName}`);
    };

    // Combine categories and collections for display
    // Requirement: Categories first, then collections
    // Use images directly from database, fallback to placeholder if not available
    const allItems = [
        ...categories.map((cat) => ({
            id: cat._id,
            name: cat.name,
            // Use category image directly from database, or placeholder if not set
            image: cat.image || '/placeholder.png',
            type: 'category',
            value: cat.name,
        })),
        ...collections.map((col: any) => ({
            id: col._id,
            name: col.name,
            image: col.image || '/placeholder.png',
            type: 'collection',
            value: col.slug || col.name,
        })),
    ];

    if (allItems.length === 0) return null;

    return (
        <div className="w-full py-2 bg-base-100">
            {/* Mobile: left-aligned scrollable, Desktop: centered with larger items */}
            <div className="flex overflow-x-auto gap-4 px-4 no-scrollbar pb-2 animate-fade-in lg:justify-center lg:gap-6">
                {allItems.map((item, index) => (
                    <button
                        key={`${item.type}-${item.id}`}
                        onClick={() =>
                            item.type === 'category'
                                ? handleCategoryClick(item.value)
                                : handleCollectionClick(item.value)
                        }
                        className="flex flex-col items-center gap-2 min-w-[72px] lg:min-w-[108px] group animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Mobile: 72px, Desktop: 108px (1.5x) */}
                        <div className="relative w-[72px] h-[72px] lg:w-[108px] lg:h-[108px] rounded-full overflow-hidden border-2 border-transparent group-hover:border-accent transition-all">
                            <Image
                                src={item.image || '/placeholder.png'}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 72px, 108px"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <span className="text-[10px] lg:text-xs uppercase font-medium text-center tracking-wide line-clamp-2 w-full">
                            {item.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryChips;
