<template>
  <section class="gradient-explore" aria-label="Advanced Gradient Explorer">
    <h3 class="t">
      <Icon name="gradients" />
      <span>Advanced Gradient</span>
    </h3>

    <div class="controls">
      <label>
        <input type="checkbox" v-model="animate" />
        <span>Animate</span>
      </label>
      <label>
        <input type="checkbox" v-model="grain" />
        <span>Film Grain</span>
      </label>
      <label>
        <span>Angle</span>
        <input type="range" min="0" max="360" v-model.number="angle" />
        <span class="value-display">{{ angle }}°</span>
      </label>
      <label>
        <span>Color Stops</span>
        <input type="range" min="2" max="6" v-model.number="colorStops" />
        <span class="value-display">{{ colorStops }}</span>
      </label>
      <label>
        <span>Blend Mode</span>
        <select v-model="blendMode">
          <option value="normal">Normal</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
        </select>
      </label>
    </div>

    <div class="preset-grid">
      <button
        v-for="preset in presets"
        :key="preset.id"
        class="preset-btn"
        :class="{ active: activePreset === preset.id }"
        @click="activePreset = preset.id"
      >
        <span class="name">{{ preset.name }}</span>
      </button>
    </div>

    <div class="main-preview" v-html="currentHTML" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import Icon from '../Icon.vue';
import { useTheme } from '../../composables/useTheme';

const props = defineProps<{ palette: { hex: string; name?: string }[] }>();
const { currentColors } = useTheme();

// State
const activePreset = ref('bubbles');
const animate = ref(true);
const grain = ref(false);
const angle = ref(135);
const colorStops = ref(4);
const blendMode = ref('normal');

// Get effective colors
const colors = computed(() => {
  if (props.palette?.length >= 2) {
    return props.palette.slice(0, colorStops.value).map(c => c.hex);
  }
  return currentColors.value.slice(0, colorStops.value).map(c => c.hex);
});

// Pattern presets
const presets = [
  { id: 'bubbles', name: 'Bubbles' },
  { id: 'aurora', name: 'Aurora' },
  { id: 'mesh', name: 'Mesh' },
  { id: 'sunset', name: 'Sunset' },
  { id: 'galaxy', name: 'Galaxy' },
  { id: 'neon', name: 'Neon Glow' },
  { id: 'holographic', name: 'Holographic' },
  { id: 'lava', name: 'Lava Lamp' },
  { id: 'ocean', name: 'Ocean Depth' },
  { id: 'crystal', name: 'Crystal' },
  { id: 'plasma', name: 'Plasma' },
  { id: 'smoke', name: 'Smoke' },
  { id: 'fire', name: 'Fire' },
  { id: 'ice', name: 'Ice' },
  { id: 'waves', name: 'Waves' },
  { id: 'geometric', name: 'Geometric' },
  { id: 'stripes', name: 'Stripes' },
  { id: 'spotlight', name: 'Spotlight' },
];

// Generate HTML for current pattern
const currentHTML = computed(() => {
  const c = colors.value;
  // Ensure we have at least 2 colors, pad with last color if needed
  while (c.length < 2) c.push(c[c.length - 1] || '#282a36');
  const c0 = c[0] || '#282a36';
  const c1 = c[1] || '#44475a';
  const c2 = c[2] || c1;
  const c3 = c[3] || c2;

  const grainSVG = grain.value
    ? `<svg style="position:absolute;width:100%;height:100%;opacity:0.08;pointer-events:none;top:0;left:0;" xmlns="http://www.w3.org/2000/svg"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#grain)"/></svg>`
    : '';

  const animClass = animate.value ? 'animated' : '';
  const blend = blendMode.value !== 'normal' ? `mix-blend-mode:${blendMode.value};` : '';

  switch (activePreset.value) {
    case 'bubbles':
      return `<div class="scene"><div class="bubble bubble1 ${animClass}" style="background:${c0};${blend}"></div><div class="bubble bubble2 ${animClass}" style="background:${c1};${blend}"></div><div class="bubble bubble3 ${animClass}" style="background:${c2};${blend}"></div>${grainSVG}</div>`;

    case 'aurora':
      return `<div class="scene" style="background:linear-gradient(${angle.value}deg,${c0},${c1})"><div class="aurora aurora1 ${animClass}" style="background:linear-gradient(${angle.value}deg,${c.join(',')});${blend}"></div><div class="aurora aurora2 ${animClass}" style="background:linear-gradient(${angle.value + 180}deg,${[...c].reverse().join(',')});${blend}"></div>${grainSVG}</div>`;

    case 'mesh':
      return `<div class="scene" style="background:${c0}"><div class="mesh ${animClass}" style="background:radial-gradient(at 20% 30%,${c1} 0,transparent 50%),radial-gradient(at 80% 70%,${c2} 0,transparent 50%),radial-gradient(at 50% 50%,${c3} 0,transparent 50%);${blend}"></div>${grainSVG}</div>`;

    case 'sunset':
      return `<div class="scene" style="background:linear-gradient(${angle.value}deg,${c.slice(0, -1).join(',')})"><div class="sun ${animClass}" style="background:radial-gradient(circle,${c[c.length - 1]},transparent);${blend}"></div>${grainSVG}</div>`;

    case 'galaxy':
      return `<div class="scene" style="background:radial-gradient(ellipse at center,${c0} 0%,${c1} 100%)"><div class="star star1 ${animClass}" style="background:${c2};${blend}"></div><div class="star star2 ${animClass}" style="background:${c3 || c2};${blend}"></div><div class="star star3 ${animClass}" style="background:${c1};${blend}"></div>${grainSVG}</div>`;

    case 'neon':
      return `<div class="scene" style="background:${c0}"><div class="neon neon1 ${animClass}" style="background:${c1};box-shadow:0 0 40px ${c1};${blend}"></div><div class="neon neon2 ${animClass}" style="background:${c2};box-shadow:0 0 40px ${c2};${blend}"></div>${grainSVG}</div>`;

    case 'holographic':
      return `<div class="scene" style="background:linear-gradient(${angle.value}deg,${c.join(',')})"><div class="holo ${animClass}" style="background:repeating-linear-gradient(${angle.value}deg,transparent,rgba(255,255,255,0.1) 2px,transparent 4px);${blend}"></div>${grainSVG}</div>`;

    case 'lava':
      return `<div class="scene" style="background:${c0}"><div class="blob blob1 ${animClass}" style="background:${c1};${blend}"></div><div class="blob blob2 ${animClass}" style="background:${c2};${blend}"></div><div class="blob blob3 ${animClass}" style="background:${c3 || c2};${blend}"></div>${grainSVG}</div>`;

    case 'ocean':
      return `<div class="scene"><div class="depth ${animClass}" style="background:linear-gradient(${angle.value}deg,${c.map((col, i) => `${col} ${Math.round((i / (c.length - 1)) * 100)}%`).join(',')});${blend}"></div>${grainSVG}</div>`;

    case 'crystal':
      return `<div class="scene" style="background:${c0}"><div class="facet facet1 ${animClass}" style="background:${c1};${blend}"></div><div class="facet facet2 ${animClass}" style="background:${c2};${blend}"></div><div class="facet facet3 ${animClass}" style="background:${c3 || c2};${blend}"></div>${grainSVG}</div>`;

    case 'plasma':
      return `<div class="scene" style="background:${c0}"><div class="plasma plasma1 ${animClass}" style="background:${c1};${blend}"></div><div class="plasma plasma2 ${animClass}" style="background:${c2};${blend}"></div><div class="plasma plasma3 ${animClass}" style="background:${c3 || c2};${blend}"></div>${grainSVG}</div>`;

    case 'smoke':
      return `<div class="scene" style="background:linear-gradient(${angle.value}deg,${c0},${c1})"><div class="smoke smoke1 ${animClass}" style="background:linear-gradient(${angle.value}deg,transparent,${c2},transparent);${blend}"></div><div class="smoke smoke2 ${animClass}" style="background:linear-gradient(${angle.value + 180}deg,transparent,${c3 || c2},transparent);${blend}"></div>${grainSVG}</div>`;

    case 'fire':
      return `<div class="scene" style="background:linear-gradient(${angle.value}deg,${c0},${c1})"><div class="flame flame1 ${animClass}" style="background:linear-gradient(${angle.value}deg,${c2},transparent);${blend}"></div><div class="flame flame2 ${animClass}" style="background:linear-gradient(${angle.value}deg,${c3 || c2},transparent);${blend}"></div>${grainSVG}</div>`;

    case 'ice':
      return `<div class="scene" style="background:${c0}"><div class="frost frost1 ${animClass}" style="background:linear-gradient(${angle.value}deg,${c1},transparent);${blend}"></div><div class="frost frost2 ${animClass}" style="background:linear-gradient(${angle.value + 90}deg,${c2},transparent);${blend}"></div>${grainSVG}</div>`;

    case 'waves':
      return `<div class="scene" style="background:${c0}"><div class="wave wave1 ${animClass}" style="background:${c1};${blend}"></div><div class="wave wave2 ${animClass}" style="background:${c2};${blend}"></div><div class="wave wave3 ${animClass}" style="background:${c3 || c2};${blend}"></div>${grainSVG}</div>`;

    case 'geometric':
      return `<div class="scene" style="background:linear-gradient(${angle.value}deg,${c0},${c1})"><div class="geo geo1 ${animClass}" style="background:${c2};${blend}"></div><div class="geo geo2 ${animClass}" style="background:${c3 || c2};${blend}"></div>${grainSVG}</div>`;

    case 'stripes':
      return `<div class="scene" style="background:repeating-linear-gradient(${angle.value}deg,${c.map((col, i) => `${col} ${i * (100 / c.length)}%,${col} ${(i + 1) * (100 / c.length)}%`).join(',')})"></div>${grainSVG}`;

    case 'spotlight':
      return `<div class="scene" style="background:${c0}"><div style="position:absolute;width:100%;height:100%;background:radial-gradient(circle at 50% 50%,${c.map((col, i) => `${col} ${i * (100 / c.length)}%`).join(',')},transparent 100%);${blend}"></div>${grainSVG}</div>`;

    default:
      return `<div class="scene" style="background:linear-gradient(${angle.value}deg,${c.join(',')})"></div>${grainSVG}`;
  }
});

// Dynamic styles
let styleEl: HTMLStyleElement | null = null;

const updateStyles = () => {
  if (styleEl) document.head.removeChild(styleEl);
  styleEl = document.createElement('style');
  styleEl.textContent = `
    .scene { position:relative; width:100%; height:100%; overflow:hidden; }
    .bubble { position:absolute; border-radius:50%; filter:blur(60px); }
    .bubble1 { width:400px; height:400px; top:-100px; left:-100px; }
    .bubble2 { width:300px; height:300px; top:150px; right:-50px; }
    .bubble3 { width:250px; height:250px; bottom:-50px; left:100px; }
    .geo { position:absolute; filter:blur(10px); }
    .geo1 { width:60%; height:60%; top:10%; left:10%; border-radius:20% 80% 30% 70%/70% 30% 70% 30%; transform:rotate(-20deg); }
    .geo2 { width:40%; height:40%; top:50%; left:50%; border-radius:50%; }
    .wave { position:absolute; left:-25%; width:150%; height:50%; border-radius:50%; filter:blur(50px); }
    .wave1 { top:0%; transform:rotate(5deg); }
    .wave2 { top:20%; transform:rotate(-5deg); }
    .wave3 { top:40%; transform:rotate(3deg); }
    .aurora { position:absolute; width:200%; height:100%; filter:blur(80px); }
    .aurora1 { left:-50%; transform:skewX(-10deg); }
    .aurora2 { right:-50%; transform:skewX(10deg); }
    .mesh { position:absolute; width:100%; height:100%; filter:blur(40px); }
    .sun { position:absolute; width:150px; height:150px; border-radius:50%; top:30%; left:50%; transform:translateX(-50%); filter:blur(20px); }
    .star { position:absolute; border-radius:50%; filter:blur(30px); }
    .star1 { width:200px; height:200px; top:20%; left:20%; }
    .star2 { width:150px; height:150px; bottom:20%; right:20%; }
    .star3 { width:100px; height:100px; top:50%; left:50%; }
    .neon { position:absolute; filter:blur(2px); }
    .neon1 { width:3px; height:80%; top:10%; left:30%; }
    .neon2 { width:80%; height:3px; top:50%; left:10%; }
    .holo { position:absolute; width:100%; height:100%; opacity:0.5; mix-blend-mode:screen; }
    .blob { position:absolute; border-radius:40% 60% 70% 30%/40% 50% 60% 50%; filter:blur(40px); }
    .blob1 { width:300px; height:300px; top:-50px; left:-50px; }
    .blob2 { width:250px; height:250px; bottom:-50px; right:-50px; }
    .blob3 { width:200px; height:200px; top:50%; left:50%; transform:translate(-50%,-50%); }
    .depth { position:absolute; width:100%; height:100%; }
    .facet { position:absolute; width:50%; height:50%; }
    .facet1 { top:0; left:0; clip-path:polygon(0 0,100% 0,50% 100%); }
    .facet2 { top:0; right:0; clip-path:polygon(0 0,100% 0,50% 100%); }
    .facet3 { bottom:0; left:25%; clip-path:polygon(50% 0,0 100%,100% 100%); }
    .plasma { position:absolute; border-radius:50%; filter:blur(60px) contrast(150%); mix-blend-mode:screen; }
    .plasma1 { width:400px; height:400px; top:-100px; left:-100px; }
    .plasma2 { width:350px; height:350px; bottom:-100px; right:-100px; }
    .plasma3 { width:300px; height:300px; top:50%; left:50%; transform:translate(-50%,-50%); }
    .smoke { position:absolute; width:150%; height:100%; filter:blur(100px); }
    .smoke1 { left:-25%; transform:rotate(-5deg); }
    .smoke2 { right:-25%; transform:rotate(5deg); }
    .flame { position:absolute; width:60%; height:80%; bottom:-20%; filter:blur(30px); }
    .flame1 { left:10%; }
    .flame2 { right:10%; opacity:0.7; }
    .frost { position:absolute; width:100%; height:100%; }
    .frost1 { clip-path:polygon(0 0,100% 0,100% 30%,0 70%); }
    .frost2 { clip-path:polygon(0 50%,100% 20%,100% 100%,0 100%); }
    ${
      animate.value
        ? `
      @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-20px); } }
      @keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
      @keyframes pulse { 0%,100% { opacity:0.8; } 50% { opacity:1; } }
      .bubble.animated { animation:float 6s ease-in-out infinite; }
      .bubble1.animated { animation-delay:0s; }
      .bubble2.animated { animation-delay:-2s; }
      .bubble3.animated { animation-delay:-4s; }
      .aurora.animated { animation:spin 20s linear infinite; }
      .mesh.animated { animation:pulse 4s ease-in-out infinite; }
      .star.animated { animation:pulse 3s ease-in-out infinite; }
      .star1.animated { animation-delay:0s; }
      .star2.animated { animation-delay:-1s; }
      .star3.animated { animation-delay:-2s; }
      .blob.animated { animation:float 8s ease-in-out infinite; }
      .blob1.animated { animation-delay:0s; }
      .blob2.animated { animation-delay:-2.5s; }
      .blob3.animated { animation-delay:-5s; }
      .plasma.animated { animation:float 5s ease-in-out infinite; }
      .plasma1.animated { animation-delay:0s; }
      .plasma2.animated { animation-delay:-1.5s; }
      .plasma3.animated { animation-delay:-3s; }
      .neon.animated { animation:pulse 2s ease-in-out infinite; }
      .neon1.animated { animation-delay:0s; }
      .neon2.animated { animation-delay:-1s; }
    `
        : ''
    }
  `;
  document.head.appendChild(styleEl);
};

onMounted(() => updateStyles());
onUnmounted(() => {
  if (styleEl) document.head.removeChild(styleEl);
});
watch([activePreset, animate, grain, angle, colorStops, blendMode], () => updateStyles());
</script>

<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.gradient-explore {
  margin-top: 1rem;
}
.t {
  @include mixins.analysis-heading;
}
.controls {
  @include mixins.analysis-controls;
}
.value-display {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: var(--dracula-purple);
}
.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-height: 240px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  background: var(--surface-secondary);
}
.preset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.5rem;
  border: none;
  background: var(--surface-primary);
  color: var(--dracula-foreground);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  text-align: center;
}
.preset-btn:hover {
  background: var(--surface-border);
  transform: translateY(-1px);
}
.preset-btn.active {
  background: var(--dracula-purple);
  color: white;
  box-shadow: 0 0 0 2px var(--dracula-purple);
}
.name {
  flex: 1;
}
.main-preview {
  position: relative;
  height: 400px;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  overflow: hidden;
  box-shadow: 0 8px 24px var(--surface-shadow);
}
@media (max-width: 900px) {
  .preset-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    max-height: 200px;
  }
  .main-preview {
    height: 300px;
  }
}
</style>
