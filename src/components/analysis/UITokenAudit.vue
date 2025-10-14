<template>
  <section class="audit">
    <h3 class="t"><Icon name="puzzle" /><span>UI Token Audit</span></h3>
    <div class="grid" v-if="palette.length">
      <div class="card">
        <h4>Suggested tokens</h4>
        <ul class="list">
          <li v-for="tok in tokens" :key="tok.key" class="item">
            <span class="key">{{ tok.key }}</span>
            <span class="chip" :style="{ background: tok.hex }"></span>
            <span class="name">{{ tok.name }}</span>
          </li>
        </ul>
      </div>
      <div class="card">
        <h4>Contrast checks</h4>
        <div class="check" v-for="check in checks" :key="check.key">
          <div class="sample" :style="{ background: check.bg }">
            <span :style="{ color: check.fg }">Aa</span>
          </div>
          <div class="meta">
            <div class="pair">{{ check.key }}</div>
            <div class="ratio">{{ check.ratio.toFixed(2) }}:1</div>
            <span class="badge" :class="check.pass ? 'ok' : 'fail'">{{
              check.pass ? 'PASS' : 'FAIL'
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="empty">No colors available.</p>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { contrastRatio } from '../../utils/contrast';
import Icon from '../Icon.vue';

type Entry = { hex: string; name?: string };
const props = defineProps<{ palette: Entry[] }>();

const palette = computed(() => props.palette ?? []);

const tokens = computed(() => {
  const byLight = [...palette.value]
    .map(p => ({ ...p, l: lightness(p.hex) }))
    .sort((a, b) => a.l - b.l);
  return [
    { key: 'surface', ...byLight[byLight.length - 1] },
    { key: 'on-surface', ...byLight[0] },
    { key: 'primary', ...byLight[Math.floor(byLight.length * 0.25)] },
    { key: 'secondary', ...byLight[Math.floor(byLight.length * 0.6)] },
    { key: 'accent', ...byLight[Math.floor(byLight.length * 0.4)] },
  ]
    .filter(Boolean)
    .map(t => ({ key: t.key, hex: t.hex, name: t.name ?? t.hex }));
});

const checks = computed(() => {
  const map = new Map(tokens.value.map(t => [t.key, t]));
  const surface = map.get('surface');
  const onSurface = map.get('on-surface');
  const primary = map.get('primary');
  const accent = map.get('accent');
  const out: { key: string; bg: string; fg: string; ratio: number; pass: boolean }[] = [];
  if (surface && onSurface) {
    const r = contrastRatio(onSurface.hex, surface.hex);
    out.push({
      key: 'on-surface on surface',
      bg: surface.hex,
      fg: onSurface.hex,
      ratio: r,
      pass: r >= 4.5,
    });
  }
  if (surface && primary) {
    const r = contrastRatio(primary.hex, surface.hex);
    out.push({
      key: 'primary on surface',
      bg: surface.hex,
      fg: primary.hex,
      ratio: r,
      pass: r >= 4.5,
    });
  }
  if (surface && accent) {
    const r = contrastRatio(accent.hex, surface.hex);
    out.push({
      key: 'accent on surface',
      bg: surface.hex,
      fg: accent.hex,
      ratio: r,
      pass: r >= 4.5,
    });
  }
  return out;
});

function lightness(hex: string) {
  const m = hex.replace('#', '');
  const r = parseInt(m.substr(0, 2), 16) / 255;
  const g = parseInt(m.substr(2, 2), 16) / 255;
  const b = parseInt(m.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  return (max + min) / 2;
}
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.card {
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.75rem;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px dashed var(--surface-border);
}
.item:last-child {
  border-bottom: 0;
}
.key {
  width: 110px;
  font-weight: 600;
}
.chip {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--surface-border);
}
.check {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px dashed var(--surface-border);
}
.check:last-child {
  border-bottom: 0;
}
.sample {
  width: 90px;
  height: 44px;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.meta {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
}
.ratio {
  font-variant-numeric: tabular-nums;
}
.badge {
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.8rem;
  border: 1px solid var(--surface-border);
}
.badge.ok {
  background: color-mix(in oklab, var(--dracula-green) 15%, transparent);
}
.badge.fail {
  background: color-mix(in oklab, var(--dracula-red) 15%, transparent);
}
.empty {
  color: var(--dracula-comment);
}
@media (max-width: 920px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
