import type { Meta, StoryObj } from '@storybook/react';
import Navbar from '../src/app/components/Navbar';

const meta = {
    title: 'Components/Navbar',
    component: Navbar,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
};

export const Desktop: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'desktop',
        },
    },
};
