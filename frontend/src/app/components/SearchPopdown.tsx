'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { productAPI } from '@/services/api';
import { IoSearchSharp, IoClose } from 'react-icons/io5';

interface SearchPopdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchPopdown({ isOpen, onClose }: SearchPopdownProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Popular/suggested searches - can be made dynamic later
    const popularSearches = [
        { label: 'T-SHIRTS', href: '/products?categories=T-Shirts' },
        { label: 'SHIRTS', href: '/products?categories=Shirts' },
        { label: 'BASICS', href: '/products?categories=Basics' },
        { label: 'DENIMS', href: '/products?categories=Denims' },
    ];

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const searchProducts = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await productAPI.search({ q: searchQuery });
                // Fix: Check the actual response structure
                const results = response.data?.data?.items || response.data?.items || [];
                setSearchResults(results);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            onClose();
            setSearchQuery('');
        }
    };

    const handleResultClick = (productSlug: string) => {
        router.push(`/products/${productSlug}`);
        onClose();
        setSearchQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-base-100">
            <div className="container mx-auto px-4 py-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="flex items-center gap-2 border-b border-base-300 pb-4">
                        <IoSearchSharp size={24} className="text-base-content" />
                        <input
                            ref={inputRef}
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for products..."
                            className="flex-1 bg-transparent text-base-content text-lg outline-none"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost btn-circle btn-sm"
                        >
                            <IoClose size={24} />
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner loading-md"></span>
                        </div>
                    )}

                    {!isLoading && searchResults.length > 0 && (
                        <div>
                            <p className="text-xs uppercase tracking-wide text-base-content/60 mb-4">
                                Search Results
                            </p>
                            <div className="space-y-2">
                                {searchResults.slice(0, 8).map((product: any) => (
                                    <button
                                        key={product._id}
                                        onClick={() => handleResultClick(product.slug || product._id)}
                                        className="w-full text-left p-3 hover:bg-base-200 rounded-lg transition-colors"
                                    >
                                        <div className="flex gap-3">
                                            {product.coverImage && (
                                                <img
                                                    src={product.coverImage}
                                                    alt={product.title}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-base-content">
                                                    {product.title}
                                                </p>
                                                <p className="text-xs text-base-content/60">
                                                    ₹ {product.priceFrom?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-base-content/60">No products found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
