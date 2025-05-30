<template>
  <div class="element-filter">
    <div class="row">
      <div style="flex: 2;">Enable Filter:</div>
      <div class="switch-wrapper" style="flex: 3;">
        <Switch 
          :value="hasFilters" 
          @update:value="value => toggleFilters(value)" 
        />
      </div>
    </div>
    <template v-if="hasFilters">
      <div class="presets">
        <div class="preset-item" v-for="(item, index) in presetFilters" :key="index" @click="applyPresetFilters(item.values)">
          <img :src="handleImageElement.src" alt="" :style="{ filter: filters2Style(item.values) }">
          <span class="preset-label">{{ item.label }}</span>
        </div>
      </div>
      <div class="filter">
        <div class="filter-item" v-for="filter in filterOptions" :key="filter.key">
          <div class="name">{{filter.label}}</div>
          <Slider
            class="filter-slider"
            :max="filter.max"
            :min="0"
            :step="filter.step"
            :value="filter.value"
            @update:value="value => updateFilter(filter, value as number)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { ImageElementFilterKeys, ImageElementFilters, PPTImageElement } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import Switch from '@/components/Switch.vue'
import Slider from '@/components/Slider.vue'

interface FilterOption {
  label: string
  key: ImageElementFilterKeys
  default: number
  value: number
  unit: string
  max: number
  step: number
}

const defaultFilters: FilterOption[] = [
  { label: 'Blur', key: 'blur', default: 0, value: 0, unit: 'px', max: 10, step: 1 },
  { label: 'Brightness', key: 'brightness', default: 100, value: 100, unit: '%', max: 200, step: 5 },
  { label: 'Contrast', key: 'contrast', default: 100, value: 100, unit: '%', max: 200, step: 5 },
  { label: 'Grayscale', key: 'grayscale', default: 0, value: 0, unit: '%', max: 100, step: 5 },
  { label: 'Saturation', key: 'saturate', default: 100, value: 100, unit: '%', max: 200, step: 5 },
  { label: 'Hue', key: 'hue-rotate', default: 0, value: 0, unit: 'deg', max: 360, step: 10 },
  { label: 'Sepia', key: 'sepia', default: 0, value: 0, unit: '%', max: 100, step: 5 },
  { label: 'Invert', key: 'invert', default: 0, value: 0, unit: '%', max: 100, step: 5 },
  { label: 'Opacity', key: 'opacity', default: 100, value: 100, unit: '%', max: 100, step: 5 },
]

const presetFilters: {
  label: string
  values: ImageElementFilters
}[] = [
  { label: 'Black and White', values: { 'grayscale': '100%' } },
  { label: 'Retro', values: { 'sepia': '50%', 'contrast': '110%', 'brightness': '90%' } },
  { label: 'Sharpen', values: { 'contrast': '150%' } },
  { label: 'Soft', values: { 'brightness': '110%', 'contrast': '90%' } },
  { label: 'Black and White', values: { 'grayscale': '100%' } },
  { label: 'Retro', values: { 'sepia': '50%', 'contrast': '110%', 'brightness': '90%' } },
  { label: 'Sharpen', values: { 'contrast': '150%' } },
  { label: 'Soft', values: { 'brightness': '110%', 'contrast': '90%' } },
  { label: 'Warm', values: { 'sepia': '30%', 'saturate': '135%' } },
  { label: 'Bright', values: { 'brightness': '110%', 'contrast': '110%' } },
  { label: 'Vivid', values: { 'saturate': '200%' } },
  { label: 'Blur', values: { 'blur': '2px' } },
  { label: 'Invert', values: { 'invert': '100%' } },
]

const slidesStore = useSlidesStore()
const { handleElement, handleElementId } = storeToRefs(useMainStore())

const handleImageElement = handleElement as Ref<PPTImageElement>

const filterOptions = ref<FilterOption[]>(JSON.parse(JSON.stringify(defaultFilters)))
const hasFilters = ref(false)

const { addHistorySnapshot } = useHistorySnapshot()

watch(handleElement, () => {
  if (!handleElement.value || handleElement.value.type !== 'image') return
  
  const filters = handleElement.value.filters
  if (filters) {
    filterOptions.value = defaultFilters.map(item => {
      const filterItem = filters[item.key]
      if (filterItem) return { ...item, value: parseInt(filterItem) }
      return item
    })
    hasFilters.value = true
  }
  else {
    filterOptions.value = JSON.parse(JSON.stringify(defaultFilters))
    hasFilters.value = false
  }
}, { deep: true, immediate: true })

// Convert filter configuration to CSS
const filters2Style = (filters: ImageElementFilters) => {
  let filter = ''
  const keys = Object.keys(filters) as ImageElementFilterKeys[]
  for (const key of keys) {
    filter += `${key}(${filters[key]}) `
  }
  return filter
}

// Set filter
const updateFilter = (filter: FilterOption, value: number) => {
  const _handleElement = handleElement.value as PPTImageElement
  
  const originFilters = _handleElement.filters || {}
  const filters = { ...originFilters, [filter.key]: `${value}${filter.unit}` }
  slidesStore.updateElement({ id: handleElementId.value, props: { filters } })
  addHistorySnapshot()
}

const toggleFilters = (checked: boolean) => {
  if (!handleElement.value) return
  if (checked) {
    slidesStore.updateElement({ id: handleElement.value.id, props: { filters: {} } })
  }
  else {
    slidesStore.removeElementProps({ id: handleElement.value.id, propName: 'filters' })
  }
  addHistorySnapshot()
}

const applyPresetFilters = (filters: ImageElementFilters) => {
  slidesStore.updateElement({ id: handleElementId.value, props: { filters } })
  addHistorySnapshot()
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.switch-wrapper {
  text-align: right;
}
.filter {
  font-size: 12px;
}
.filter-item {
  padding: 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;

  .name {
    width: 60px;
  }
  .filter-slider {
    flex: 1;
    margin: 0 6px;
  }
}
.presets {
  margin-bottom: 5px;
  @include flex-grid-layout();
}
.preset-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  @include flex-grid-layout-children(3, 31%);

  img {
    max-width: 100%;
    max-height: 120px;
  }
  .preset-label {
    font-size: 12px;
    color: #888;
  }
}
</style>