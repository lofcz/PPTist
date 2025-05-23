<template>
  <div 
    class="editable-element-table"
    ref="elementRef"
    :class="{ 'lock': elementInfo.lock }"
    :style="{
      top: elementInfo.top + 'px',
      left: elementInfo.left + 'px',
      width: elementInfo.width + 'px',
    }"
  >
    <div
      class="rotate-wrapper"
      :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
    >
      <div 
        class="element-content" 
        v-contextmenu="contextmenus"
      >
        <EditableTable 
          @mousedown.stop
          :data="elementInfo.data"
          :width="elementInfo.width"
          :cellMinHeight="elementInfo.cellMinHeight"
          :colWidths="elementInfo.colWidths"
          :outline="elementInfo.outline"
          :theme="elementInfo.theme"
          :editable="editable"
          @change="data => updateTableCells(data)"
          @changeColWidths="widths => updateColWidths(widths)"
          @changeSelectedCells="cells => updateSelectedCells(cells)"
        />
        <div 
          class="table-mask" 
          :class="{ 'lock': elementInfo.lock }"
          v-if="!editable || elementInfo.lock"
          @dblclick="startEdit()"
          @mousedown="$event => handleSelectElement($event)"
          @touchstart="$event => handleSelectElement($event)"
        >
          <div class="mask-tip" v-if="handleElementId === elementInfo.id" :style="{ transform: `scale(${ 1 / canvasScale })` }">Double click to edit</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTTableElement, TableCell } from '@/types/slides'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import EditableTable from './EditableTable.vue'

const props = defineProps<{
  elementInfo: PPTTableElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTTableElement, canMove?: boolean) => void
  contextmenus: () => ContextmenuItem[] | null
}>()

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { canvasScale, handleElementId, isScaling } = storeToRefs(mainStore)

const elementRef = ref<HTMLElement>()

const { addHistorySnapshot } = useHistorySnapshot()

const handleSelectElement = (e: MouseEvent | TouchEvent) => {
  if (props.elementInfo.lock) return
  e.stopPropagation()

  props.selectElement(e, props.elementInfo)
}

// Update the editable state of the table. Global shortcuts need to be disabled when the table is in the editing state.
const editable = ref(false)

watch(handleElementId, () => {
  if (handleElementId.value !== props.elementInfo.id) editable.value = false
})

watch(editable, () => {
  mainStore.setDisableHotkeysState(editable.value)
})

const startEdit = () => {
  if (!props.elementInfo.lock) editable.value = true
}

// Listen for changes in the size of the table element. When the height changes, update the height to vuex.
// If the height change is occurring during a scaling operation, wait for the scaling operation to complete before updating.
const realHeightCache = ref(-1)

watch(isScaling, () => {
  if (handleElementId.value !== props.elementInfo.id) return

  if (isScaling.value) editable.value = false

  if (!isScaling.value && realHeightCache.value !== -1) {
    slidesStore.updateElement({
      id: props.elementInfo.id,
      props: { height: realHeightCache.value },
    })
    realHeightCache.value = -1
  }
})

const updateTableElementHeight = (entries: ResizeObserverEntry[]) => {
  const contentRect = entries[0].contentRect
  if (!elementRef.value) return

  const realHeight = contentRect.height

  if (props.elementInfo.height !== realHeight) {
    if (!isScaling.value) {
      slidesStore.updateElement({
        id: props.elementInfo.id,
        props: { height: realHeight },
      })
    }
    else realHeightCache.value = realHeight
  }
}

const resizeObserver = new ResizeObserver(updateTableElementHeight)

onMounted(() => {
  if (elementRef.value) resizeObserver.observe(elementRef.value)
})
onUnmounted(() => {
  if (elementRef.value) resizeObserver.unobserve(elementRef.value)
})

// Update table content data
const updateTableCells = (data: TableCell[][]) => {
  slidesStore.updateElement({
    id: props.elementInfo.id, 
    props: { data },
  })
  addHistorySnapshot()
}

// Update the column width data of the table
const updateColWidths = (widths: number[]) => {
  const width = widths.reduce((a, b) => a + b)
  const colWidths = widths.map(item => item / width)

  slidesStore.updateElement({
    id: props.elementInfo.id, 
    props: { width, colWidths },
  })
  addHistorySnapshot()
}

// Update the currently selected cells in the table
const updateSelectedCells = (cells: string[]) => {
  nextTick(() => mainStore.setSelectedTableCells(cells))
}
</script>

<style lang="scss" scoped>
.editable-element-table {
  position: absolute;

  &.lock .element-content {
    cursor: default;
  }
}
.rotate-wrapper {
  width: 100%;
  height: 100%;
}
.element-content {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: move;
}
.table-mask {
  @include absolute-0();

  opacity: 0;
  transition: opacity $transitionDelay;

  .mask-tip {
    position: absolute;
    top: 5px;
    left: 5px;
    background-color: rgba($color: #000, $alpha: .5);
    color: #fff;
    padding: 6px 12px;
    font-size: 12px;
    transform-origin: 0 0;
  }

  &:hover:not(.lock) {
    opacity: .9;
  }
}
</style>
