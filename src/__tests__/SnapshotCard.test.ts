import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SnapshotCard from '../components/analysis/SnapshotCard.vue';
import type { PaletteStandard, PaletteSourceColor } from '../types/palette';

describe('SnapshotCard', () => {
  const mockStandards: PaletteStandard[] = ['material', 'hsluv', 'oklch'];
  const mockSources: PaletteSourceColor[] = [
    { hex: '#ff0000', name: 'Red' },
    { hex: '#00ff00', name: 'Green' },
    { hex: '#0000ff', name: 'Blue' },
    { hex: '#ffff00', name: 'Yellow' },
    { hex: '#ff00ff', name: 'Magenta' },
  ];
  const mockInsights = {
    lightnessRange: [5, 96] as [number, number],
    averageChroma: 0.655,
    vividShare: 100,
    totalColors: 223,
  };

  it('should render component with standards, sources, and insights', () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    expect(wrapper.find('h3').text()).toContain('Palette Snapshot');
    expect(wrapper.findAll('.chip').length).toBeGreaterThan(0);
  });

  it('should show only first color source initially when multiple sources exist', () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    // Should show first source chip + "+N" button
    const sourceChips = wrapper.findAll('.chip--interactive');
    expect(sourceChips.length).toBe(1);
    expect(sourceChips[0].text()).toBe('Red');

    // Should show "+4" button for remaining sources
    const showMoreBtn = wrapper.find('.chip--show-more');
    expect(showMoreBtn.exists()).toBe(true);
    expect(showMoreBtn.text()).toBe('+4');
  });

  it('should expand to show all sources when clicking on first color', async () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    // Click on first source chip
    const firstChip = wrapper.find('.chip--interactive');
    await firstChip.trigger('click');

    // All sources should now be visible
    const sourceChips = wrapper.findAll('.chip--interactive');
    expect(sourceChips.length).toBe(5);
    expect(sourceChips.map(chip => chip.text())).toEqual(['Red', 'Green', 'Blue', 'Yellow', 'Magenta']);

    // "+N" button should be hidden
    const showMoreBtn = wrapper.find('.chip--show-more');
    expect(showMoreBtn.exists()).toBe(false);
  });

  it('should expand to show all sources when clicking "+N" button', async () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    // Click on "+4" button
    const showMoreBtn = wrapper.find('.chip--show-more');
    await showMoreBtn.trigger('click');

    // All sources should now be visible
    const sourceChips = wrapper.findAll('.chip--interactive');
    expect(sourceChips.length).toBe(5);
  });

  it('should toggle between expanded and collapsed states', async () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    // Expand
    await wrapper.find('.chip--show-more').trigger('click');
    expect(wrapper.findAll('.chip--interactive').length).toBe(5);

    // Collapse
    await wrapper.find('.chip--interactive').trigger('click');
    expect(wrapper.findAll('.chip--interactive').length).toBe(1);
    expect(wrapper.find('.chip--show-more').exists()).toBe(true);
  });

  it('should show all sources when only one source exists', () => {
    const singleSource: PaletteSourceColor[] = [{ hex: '#ff0000', name: 'Red' }];
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: singleSource,
        insights: mockInsights,
      },
    });

    // Should show the single source without "+N" button
    const sourceChips = wrapper.findAll('.chip--interactive');
    expect(sourceChips.length).toBe(1);
    expect(wrapper.find('.chip--show-more').exists()).toBe(false);
  });

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    // Check aria-expanded on first chip
    const firstChip = wrapper.find('.chip--interactive');
    expect(firstChip.attributes('aria-expanded')).toBe('false');

    // Check aria-label on "+N" button
    const showMoreBtn = wrapper.find('.chip--show-more');
    expect(showMoreBtn.attributes('aria-label')).toBe('Show 4 more colors');
  });

  it('should update aria-expanded when toggled', async () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    const firstChip = wrapper.find('.chip--interactive');
    expect(firstChip.attributes('aria-expanded')).toBe('false');

    // Expand
    await firstChip.trigger('click');
    expect(firstChip.attributes('aria-expanded')).toBe('true');
  });

  it('should render insights metrics correctly', () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    const metrics = wrapper.findAll('.metric');
    expect(metrics.length).toBe(4);

    // Check lightness range
    expect(wrapper.text()).toContain('5–96%');

    // Check average chroma
    expect(wrapper.text()).toContain('0.655');

    // Check vivid share
    expect(wrapper.text()).toContain('100%');

    // Check total colors
    expect(wrapper.text()).toContain('223');
  });

  it('should apply correct styles to color chips', () => {
    const wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
      },
    });

    const firstChip = wrapper.find('.chip--interactive');
    expect(firstChip.attributes('style')).toContain('background: rgb(255, 0, 0)');
    expect(firstChip.attributes('title')).toBe('Red');
  });
});
