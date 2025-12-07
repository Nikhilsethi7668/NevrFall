import type { Meta, StoryObj } from '@storybook/react';
import HeroSection from '../src/app/components/HeroSection';

const meta = {
    title: 'Components/HeroSection',
    component: HeroSection,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithVideo: Story = {
    args: {
        videoSrc: 'https://cdn.shopify.com/videos/c/o/v/8e412d2874bb496a82d55c7e8a0a1ee9.mp4',
        ctaText: 'Get In',
        ctaLink: '/products',
        height: 'tall',
        overlayOpacity: 0,
    },
};

export const WithImage: Story = {
    args: {
        imageSrc: 'https://images.unsplash.com/photo-1558769132-cb1aea1c8e5e?w=1920&h=1080&fit=crop',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        height: 'tall',
        overlayOpacity: 0.2,
    },
};

export const WithTitle: Story = {
    args: {
        videoSrc: 'https://cdn.shopify.com/videos/c/o/v/8e412d2874bb496a82d55c7e8a0a1ee9.mp4',
        title: 'SHIPS IN 24HRS',
        ctaText: 'Get In',
        ctaLink: '/products',
        height: 'tall',
    },
};

export const Minimal: Story = {
    args: {
        imageSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&h=1080&fit=crop',
        ctaText: 'Explore',
        ctaLink: '/products',
        height: 'medium',
    },
};
