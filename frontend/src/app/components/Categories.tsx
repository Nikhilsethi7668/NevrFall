
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryStore } from '@/app/store/useCategoryStore';

export default function Categories() {
  const router = useRouter();
  const { categories, loading, error, fetchCategories } = useCategoryStore();
  console.log(categories);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/products?categories=${categoryName}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <h1 className='text-center font-semibold text-2xl my-2'>Categories</h1>
      <div className="grid my-2 mx-2 grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category._id}
            className="flex flex-col cursor-pointer overflow-hidden"
            onClick={() => handleCategoryClick(category.name)}
          >
            <img
              src={category.image}
              alt={category.name}
              className="h-[20vh] w-full justify-around object-cover object-center"
            />
            <h3 className='py-1 px-2 text-left text-sm'>
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </>
  );
}
