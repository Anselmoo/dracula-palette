import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ColorInput from '../components/ColorInput.vue';
import { DRACULA_COLORS, ALUCARD_COLORS } from '../data/draculaColors';

describe('Theme-Aware Color Defaults', () => {
  it('should use Dracula pink as fallback in Dracula mode', () => {
    // Mock useTheme to return Dracula colors
    vi.mock('../composables/useTheme', () => ({
      useTheme: () => ({
        currentColors: ref(DRACULA_COLORS),
        currentTheme: ref('dracula'),
        isDarkMode: ref(true),
        isLightMode: ref(false),
      }),
    }));

    const wrapper = mount(ColorInput, {
      props: {
        modelValue: '',
      },
      global: {
        stubs: {
          // Stub the composable
        },
      },
    });

    const draculaPink = DRACULA_COLORS.find(c => c.name === 'Pink');
    expect(draculaPink?.hex).toBe('#ff79c6');
    
    // Check that the placeholder uses Dracula pink
    const input = wrapper.find('input[type="text"]');
    expect(input.attributes('placeholder')).toBe('#ff79c6');
  });

  it('should display correct pink color in examples for Dracula mode', () => {
    const wrapper = mount(ColorInput, {
      props: {
        modelValue: '',
      },
    });

    const examples = wrapper.findAll('.example');
    expect(examples[0].text()).toContain('#ff79c6'); // Dracula pink hex
  });

  it('should have different pink colors between Dracula and Alucard', () => {
    const draculaPink = DRACULA_COLORS.find(c => c.name === 'Pink');
    const alucardPink = ALUCARD_COLORS.find(c => c.name === 'Pink');
    
    expect(draculaPink?.hex).toBe('#ff79c6');
    expect(alucardPink?.hex).toBe('#a3144d');
    expect(draculaPink?.hex).not.toBe(alucardPink?.hex);
  });

  it('should have different purple colors between Dracula and Alucard', () => {
    const draculaPurple = DRACULA_COLORS.find(c => c.name === 'Purple');
    const alucardPurple = ALUCARD_COLORS.find(c => c.name === 'Purple');
    
    expect(draculaPurple?.hex).toBe('#bd93f9');
    expect(alucardPurple?.hex).toBe('#644ac9');
    expect(draculaPurple?.hex).not.toBe(alucardPurple?.hex);
  });
});
