import type { Meta, StoryObj } from '@storybook/react';
import ProductCard from '../src/app/components/ProductCard';

const meta = {
    title: 'Components/ProductCard',
    component: ProductCard,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProduct = {
    _id: '1',
    title: 'GT BLACK STALLION FULL SLEEVE T-SHIRT',
    brand: 'GRYAPE',
    coverImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop',
    priceFrom: 4005,
    compareAtFrom: 5000,
    slug: 'gt-black-stallion-tshirt',
    collections: ['new-arrivals'],
    variants: [{ _id: 'v1' }],
};

export const Default: Story = {
    args: {
        product: mockProduct,
        showWishlist: true,
    },
};

export const WithoutWishlist: Story = {
    args: {
        product: mockProduct,
        showWishlist: false,
    },
};

export const NoDiscount: Story = {
    args: {
        product: {
            ...mockProduct,
            compareAtFrom: undefined,
        },
    },
};

export const Grid: Story = {
    args: {
        product: mockProduct,
    },
    render: (args) => (
        <div className="max-w-[1440px] mx-auto px-5 lg:px-[60px]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-5 gap-y-10 lg:gap-y-12">
                <ProductCard {...args} />
                <ProductCard product={{ ...mockProduct, _id: '2', title: 'BLACK SHADOW HOODIE', priceFrom: 5005 }} />
                <ProductCard product={{ ...mockProduct, _id: '3', title: 'PLAY SAFE T-SHIRT', priceFrom: 2505 }} />
                <ProductCard product={{ ...mockProduct, _id: '4', title: 'TASTE ME T-SHIRT', priceFrom: 2505 }} />
                <ProductCard product={{ ...mockProduct, _id: '5', title: 'RED WARRIOR T-SHIRT', priceFrom: 2505 }} />
                <ProductCard product={{ ...mockProduct, _id: '6', title: 'BLUE OCEAN HOODIE', priceFrom: 4505 }} />
                <ProductCard product={{ ...mockProduct, _id: '7', title: 'GREEN FOREST TEE', priceFrom: 2005 }} />
                <ProductCard product={{ ...mockProduct, _id: '8', title: 'YELLOW SUNSHINE SHIRT', priceFrom: 3005 }} />
            </div>
        </div>
    ),
};

