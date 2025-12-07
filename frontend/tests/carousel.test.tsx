import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ImageCarousel from '../src/app/components/ImageCarousel';

// Mock next/image
vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />
}));

describe('ImageCarousel', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<ImageCarousel />);
        expect(screen.getByRole('region', { name: /product highlights/i })).toBeDefined();
        // Should show first slide initially
        const slides = screen.getAllByRole('group', { name: /slide/i });
        expect(slides[0].className).toContain('opacity-100');
        expect(slides[1].className).toContain('opacity-0');
    });

    it('auto-scrolls after interval', () => {
        render(<ImageCarousel />);
        const slides = screen.getAllByRole('group', { name: /slide/i });

        // Initial state
        expect(slides[0].className).toContain('opacity-100');

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(4000);
        });

        // Should be on second slide
        expect(slides[0].className).toContain('opacity-0');
        expect(slides[1].className).toContain('opacity-100');
    });

    it('pauses on mouse enter and resumes on mouse leave', () => {
        render(<ImageCarousel />);
        const carousel = screen.getByRole('region', { name: /product highlights/i });
        const slides = screen.getAllByRole('group', { name: /slide/i });

        // Mouse enter to pause
        fireEvent.mouseEnter(carousel);

        // Advance time - should NOT change slide
        act(() => {
            vi.advanceTimersByTime(4000);
        });
        expect(slides[0].className).toContain('opacity-100');

        // Mouse leave to resume
        fireEvent.mouseLeave(carousel);

        // Advance time - should change slide
        act(() => {
            vi.advanceTimersByTime(4000);
        });
        expect(slides[1].className).toContain('opacity-100');
    });

    it('pauses on manual navigation and resumes after delay', () => {
        render(<ImageCarousel />);
        const nextButton = screen.getByLabelText(/next slide/i);
        const slides = screen.getAllByRole('group', { name: /slide/i });

        // Click next
        fireEvent.click(nextButton);
        expect(slides[1].className).toContain('opacity-100');

        // Advance time less than resume delay (6s) - should NOT auto-scroll
        act(() => {
            vi.advanceTimersByTime(4000);
        });
        // Still on slide 2 (index 1)
        expect(slides[1].className).toContain('opacity-100');
        expect(slides[2].className).toContain('opacity-0');

        // Advance time past resume delay + interval
        act(() => {
            vi.advanceTimersByTime(2000 + 4000); // Finish 6s delay + 4s interval
        });
        // Should have moved to slide 3 (index 2)
        expect(slides[2].className).toContain('opacity-100');
    });
});
