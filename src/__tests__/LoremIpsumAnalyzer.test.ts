import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoremIpsumAnalyzer from '../components/analysis/LoremIpsumAnalyzer.vue';

describe('LoremIpsumAnalyzer', () => {
  it('should render with default props', () => {
    const wrapper = mount(LoremIpsumAnalyzer, {
      props: {
        palette: [],
      },
    });

    expect(wrapper.find('h3').text()).toContain('Lorem Ipsum Analyzer');
  });

  it('should display color selection dropdowns', () => {
    const wrapper = mount(LoremIpsumAnalyzer, {
      props: {
        palette: [
          { hex: '#bd93f9', name: 'Purple' },
          { hex: '#ff79c6', name: 'Pink' },
        ],
      },
    });

    const selects = wrapper.findAll('select');
    // Should have: Variant, Length, Heading Color, Strong Color, Emphasis Color, Code Color
    expect(selects.length).toBeGreaterThanOrEqual(6);
  });

  it('should show custom length input when length is set to custom', async () => {
    const wrapper = mount(LoremIpsumAnalyzer, {
      props: {
        palette: [],
      },
    });

    const lengthSelect = wrapper.findAll('select').find(select => {
      const options = Array.from(select.element.options).map((opt: any) => opt.value);
      return options.includes('custom');
    });

    expect(lengthSelect).toBeDefined();

    if (lengthSelect) {
      await lengthSelect.setValue('custom');
      await wrapper.vm.$nextTick();

      // Check if custom word count input appears
      const inputs = wrapper.findAll('input[type="number"]');
      const customInput = inputs.find(
        input => input.attributes('min') === '5' && input.attributes('max') === '500'
      );
      expect(customInput).toBeDefined();
    }
  });

  it('should generate Lorem Ipsum text', () => {
    const wrapper = mount(LoremIpsumAnalyzer, {
      props: {
        palette: [],
      },
    });

    const vm = wrapper.vm as any;
    const generated = vm.generated;

    expect(Array.isArray(generated)).toBe(true);
    expect(generated.length).toBeGreaterThan(0);
  });

  it('should populate available colors from palette, backgrounds, and accents', () => {
    const wrapper = mount(LoremIpsumAnalyzer, {
      props: {
        palette: [
          { hex: '#bd93f9', name: 'Purple' },
          { hex: '#ff79c6', name: 'Pink' },
        ],
        backgrounds: [{ hex: '#282a36', name: 'Background' }],
        accents: [{ hex: '#50fa7b', name: 'Green' }],
      },
    });

    const vm = wrapper.vm as any;
    const availableColors = vm.availableColors;

    expect(availableColors.length).toBeGreaterThan(0);
    // Should deduplicate colors by hex
    const hexes = availableColors.map((c: any) => c.hex);
    const uniqueHexes = new Set(hexes);
    expect(hexes.length).toBe(uniqueHexes.size);
  });

  it('should apply selected colors to preview style', async () => {
    const wrapper = mount(LoremIpsumAnalyzer, {
      props: {
        palette: [
          { hex: '#bd93f9', name: 'Purple' },
          { hex: '#ff79c6', name: 'Pink' },
        ],
      },
    });

    const vm = wrapper.vm as any;

    // Set a custom heading color
    vm.selectedHeadingColor = '#ff79c6';
    await wrapper.vm.$nextTick();

    const previewStyle = vm.previewStyle;
    expect(previewStyle['--ipsum-hdr']).toBe('#ff79c6');
  });
});
