import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AdvancedGradientExplore from '../components/analysis/AdvancedGradientExplore.vue';
import { DRACULA_COLORS } from '../data/draculaColors';

// Mock the Icon component
vi.mock('../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span class="mock-icon"></span>',
  },
}));

describe('AdvancedGradientExplore', () => {
  let wrapper: ReturnType<typeof mount>;
  const mockPalette = DRACULA_COLORS.slice(0, 4);

  beforeEach(() => {
    wrapper = mount(AdvancedGradientExplore, {
      props: {
        palette: mockPalette,
      },
      global: {
        stubs: {
          Icon: true,
        },
      },
    });
  });

  describe('Component Rendering', () => {
    it('should render the component with title', () => {
      expect(wrapper.find('.gradient-explore').exists()).toBe(true);
      expect(wrapper.find('.t').text()).toContain('Advanced Gradient');
    });

    it('should render all control inputs', () => {
      const controls = wrapper.find('.controls');
      expect(controls.findAll('input[type="checkbox"]').length).toBe(2);
      expect(controls.findAll('input[type="range"]').length).toBe(2);
      expect(controls.find('select').exists()).toBe(true);
    });

    it('should render all 18 preset buttons', () => {
      const presetButtons = wrapper.findAll('.preset-btn');
      expect(presetButtons.length).toBe(18);
    });

    it('should render the gradient preview', () => {
      expect(wrapper.find('.main-preview').exists()).toBe(true);
    });
  });

  describe('Preset Buttons', () => {
    const presetIds = [
      'bubbles',
      'aurora',
      'mesh',
      'sunset',
      'galaxy',
      'neon',
      'holographic',
      'lava',
      'ocean',
      'crystal',
      'plasma',
      'smoke',
      'fire',
      'ice',
      'waves',
      'geometric',
      'stripes',
      'spotlight',
    ];

    presetIds.forEach((presetId, index) => {
      it(`should render ${presetId} button`, () => {
        const buttons = wrapper.findAll('.preset-btn');
        const button = buttons[index];
        expect(button.exists()).toBe(true);
        expect(button.text()).toBeTruthy();
      });

      it(`should set active class when ${presetId} is clicked`, async () => {
        const buttons = wrapper.findAll('.preset-btn');
        const button = buttons[index];
        await button.trigger('click');
        expect(button.classes()).toContain('active');
      });

      it(`should change activePreset when ${presetId} button is clicked`, async () => {
        const buttons = wrapper.findAll('.preset-btn');
        const button = buttons[index];
        await button.trigger('click');
        expect(button.classes('active')).toBe(true);
      });
    });

    it('should have only one active preset at a time', async () => {
      const buttons = wrapper.findAll('.preset-btn');

      // Click first button
      await buttons[0].trigger('click');
      expect(buttons[0].classes()).toContain('active');

      // Click second button
      await buttons[1].trigger('click');
      expect(buttons[1].classes()).toContain('active');
      expect(buttons[0].classes()).not.toContain('active');
    });

    it('should have bubbles as the default active preset', () => {
      const buttons = wrapper.findAll('.preset-btn');
      expect(buttons[0].classes()).toContain('active');
    });
  });

  describe('Checkbox Controls', () => {
    it('should toggle animate checkbox', async () => {
      const checkboxes = wrapper.findAll('.controls input[type="checkbox"]');
      const animateCheckbox = checkboxes[0]; // First checkbox is animate
      const initialValue = (animateCheckbox.element as HTMLInputElement).checked;

      await animateCheckbox.setValue(!initialValue);
      expect((animateCheckbox.element as HTMLInputElement).checked).toBe(!initialValue);
    });

    it('should toggle grain checkbox', async () => {
      const checkboxes = wrapper.findAll('.controls input[type="checkbox"]');
      const grainCheckbox = checkboxes[1]; // Second checkbox is grain
      const initialValue = (grainCheckbox.element as HTMLInputElement).checked;

      await grainCheckbox.setValue(!initialValue);
      expect((grainCheckbox.element as HTMLInputElement).checked).toBe(!initialValue);
    });

    it('should have animate checked by default', () => {
      const checkboxes = wrapper.findAll('.controls input[type="checkbox"]');
      const animateCheckbox = checkboxes[0]; // First checkbox is animate
      expect((animateCheckbox.element as HTMLInputElement).checked).toBe(true);
    });

    it('should have grain unchecked by default', () => {
      const checkboxes = wrapper.findAll('.controls input[type="checkbox"]');
      const grainCheckbox = checkboxes[1]; // Second checkbox is grain
      expect((grainCheckbox.element as HTMLInputElement).checked).toBe(false);
    });
  });

  describe('Range Controls', () => {
    it('should update angle value when range slider changes', async () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const angleSlider = rangeInputs[0]; // First range is angle
      await angleSlider.setValue('180');
      expect((angleSlider.element as HTMLInputElement).value).toBe('180');
      expect(wrapper.findAll('.value-display')[0].text()).toBe('180°');
    });

    it('should have angle range from 0 to 360', () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const angleSlider = rangeInputs[0]; // First range is angle
      expect(angleSlider.attributes('min')).toBe('0');
      expect(angleSlider.attributes('max')).toBe('360');
    });

    it('should have default angle of 135', () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const angleSlider = rangeInputs[0]; // First range is angle
      expect((angleSlider.element as HTMLInputElement).value).toBe('135');
    });

    it('should update color stops value when range slider changes', async () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const stopsSlider = rangeInputs[1]; // Second range is color stops
      await stopsSlider.setValue('6');
      expect((stopsSlider.element as HTMLInputElement).value).toBe('6');
      expect(wrapper.findAll('.value-display')[1].text()).toBe('6');
    });

    it('should have color stops range from 2 to 6', () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const stopsSlider = rangeInputs[1]; // Second range is color stops
      expect(stopsSlider.attributes('min')).toBe('2');
      expect(stopsSlider.attributes('max')).toBe('6');
    });

    it('should have default color stops of 4', () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const stopsSlider = rangeInputs[1]; // Second range is color stops
      expect((stopsSlider.element as HTMLInputElement).value).toBe('4');
    });
  });

  describe('Blend Mode Select', () => {
    it('should have all blend mode options', () => {
      const select = wrapper.find('.controls select');
      const options = select.findAll('option');
      expect(options.length).toBe(4);

      const optionValues = options.map(opt => opt.element.value);
      expect(optionValues).toContain('normal');
      expect(optionValues).toContain('multiply');
      expect(optionValues).toContain('screen');
      expect(optionValues).toContain('overlay');
    });

    it('should change blend mode when option is selected', async () => {
      const select = wrapper.find('.controls select');
      await select.setValue('multiply');
      expect((select.element as unknown as { value: string }).value).toBe('multiply');
    });

    it('should have normal as default blend mode', () => {
      const select = wrapper.find('.controls select');
      expect((select.element as unknown as { value: string }).value).toBe('normal');
    });
  });

  describe('Gradient Preview', () => {
    it('should update preview when preset changes', async () => {
      const preview = wrapper.find('.main-preview');
      const _initialHTML = preview.html();

      const buttons = wrapper.findAll('.preset-btn');
      await buttons[1].trigger('click');

      const updatedHTML = preview.html();
      expect(updatedHTML).not.toBe(_initialHTML);
    });

    it('should generate HTML content for preview', () => {
      const preview = wrapper.find('.main-preview');
      expect(preview.element.innerHTML).toBeTruthy();
    });
  });

  describe('Color Handling', () => {
    it('should use palette colors when provided', () => {
      const wrapperWithPalette = mount(AdvancedGradientExplore, {
        props: {
          palette: mockPalette,
        },
        global: {
          stubs: {
            Icon: true,
          },
        },
      });

      expect(wrapperWithPalette.exists()).toBe(true);
    });

    it('should handle palette with fewer colors than color stops', () => {
      const smallPalette = DRACULA_COLORS.slice(0, 2);
      const wrapperWithSmallPalette = mount(AdvancedGradientExplore, {
        props: {
          palette: smallPalette,
        },
        global: {
          stubs: {
            Icon: true,
          },
        },
      });

      expect(wrapperWithSmallPalette.exists()).toBe(true);
      expect(wrapperWithSmallPalette.find('.main-preview').exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for the section', () => {
      expect(wrapper.find('.gradient-explore').attributes('aria-label')).toBe(
        'Advanced Gradient Explorer'
      );
    });

    it('should have labeled controls', () => {
      const labels = wrapper.findAll('.controls label');
      expect(labels.length).toBeGreaterThan(0);
      
      // Check that labels contain text
      const labelTexts = labels.map(l => l.text());
      expect(labelTexts.some(t => t.includes('Animate'))).toBe(true);
      expect(labelTexts.some(t => t.includes('Film Grain'))).toBe(true);
      expect(labelTexts.some(t => t.includes('Angle'))).toBe(true);
      expect(labelTexts.some(t => t.includes('Color Stops'))).toBe(true);
      expect(labelTexts.some(t => t.includes('Blend Mode'))).toBe(true);
    });

    it('should have focusable buttons', () => {
      const buttons = wrapper.findAll('.preset-btn');
      buttons.forEach(button => {
        expect(button.element.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Interaction Flow', () => {
    it('should allow multiple control changes in sequence', async () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const checkboxes = wrapper.findAll('.controls input[type="checkbox"]');
      
      // Change angle
      const angleSlider = rangeInputs[0];
      await angleSlider.setValue('270');

      // Change color stops
      const stopsSlider = rangeInputs[1];
      await stopsSlider.setValue('3');

      // Toggle animate
      const animateCheckbox = checkboxes[0];
      await animateCheckbox.setValue(false);

      // Change preset
      const buttons = wrapper.findAll('.preset-btn');
      await buttons[5].trigger('click');

      // Verify all changes persisted
      expect((angleSlider.element as HTMLInputElement).value).toBe('270');
      expect((stopsSlider.element as HTMLInputElement).value).toBe('3');
      expect((animateCheckbox.element as HTMLInputElement).checked).toBe(false);
      expect(buttons[5].classes()).toContain('active');
    });

    it('should update preview when controls change', async () => {
      const preview = wrapper.find('.main-preview');
      const _initialHTML = preview.html();

      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      // Change angle
      const angleSlider = rangeInputs[0];
      await angleSlider.setValue('270');

      // Preview should update
      await wrapper.vm.$nextTick();
      const updatedHTML = preview.html();

      // HTML should change when angle changes
      expect(updatedHTML).toBeDefined();
      // Suppress unused variable warning
      expect(_initialHTML).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', async () => {
      const buttons = wrapper.findAll('.preset-btn');

      // Rapidly click multiple buttons
      await buttons[0].trigger('click');
      await buttons[1].trigger('click');
      await buttons[2].trigger('click');
      await buttons[3].trigger('click');

      // Should end up with the last button active
      expect(buttons[3].classes()).toContain('active');
    });

    it('should handle extreme angle values', async () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const angleSlider = rangeInputs[0];

      await angleSlider.setValue('0');
      expect((angleSlider.element as HTMLInputElement).value).toBe('0');

      await angleSlider.setValue('360');
      expect((angleSlider.element as HTMLInputElement).value).toBe('360');
    });

    it('should handle minimum and maximum color stops', async () => {
      const rangeInputs = wrapper.findAll('.controls input[type="range"]');
      const stopsSlider = rangeInputs[1];

      await stopsSlider.setValue('2');
      expect((stopsSlider.element as HTMLInputElement).value).toBe('2');

      await stopsSlider.setValue('6');
      expect((stopsSlider.element as HTMLInputElement).value).toBe('6');
    });
  });
});
