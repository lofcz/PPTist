<template>
  <div class="chart-data-editor">
    <div class="editor-content">
      <div class="handler">
        <div class="col-header">
          <div class="col-header-item"
            v-for="colIndex in 7" 
            :key="colIndex"
          >
            <div class="col-key">{{ alphabet[colIndex - 1] }}</div>
          </div>
        </div>
        <div class="row-header">
          <div class="row-header-item"
            v-for="rowIndex in 31" 
            :key="rowIndex"
          >
            <div class="row-key">{{ rowIndex }}</div>
          </div>
        </div>
        <div class="all-header">
          <svg class="triangle" width="8" height="8" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
            <path d="M8,0 L8,8 L0,8 L8,0" fill="#ccc" />
          </svg>
        </div>
      </div>
      <div class="range-box">
        <div 
          class="temp-range" 
          :style="{
            width: tempRangeSize.width + 'px',
            height: tempRangeSize.height + 'px',
          }"
        ></div>
        <div 
          :class="['range-line', line.type]" 
          v-for="line in rangeLines" 
          :key="line.type" 
          :style="line.style"
        ></div>
        <div 
          class="resizable" 
          :style="resizablePointStyle"
          @mousedown.stop="changeSelectRange($event)"
        ></div>
      </div>
      <table>
        <tbody>
          <tr v-for="rowIndex in 31" :key="rowIndex">
            <td 
              v-for="colIndex in 7" 
              :key="colIndex" 
              :class="{ 'head': (colIndex === 1 && rowIndex <= selectedRange[1]) || (rowIndex === 1 && colIndex <= selectedRange[0]) }"
            >
              <input 
                :class="['item', { 'selected': rowIndex <= selectedRange[1] && colIndex <= selectedRange[0] }]"
                :id="`cell-${rowIndex - 1}-${colIndex - 1}`"
                v-if="!(rowIndex === 1 && colIndex === 1)"
                autocomplete="off"
                @focus="focusCell = [rowIndex - 1, colIndex - 1]"
                @paste="$event => handlePaste($event, rowIndex - 1, colIndex - 1)"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="btns">
      <div class="left">
        Chart Type：{{ CHART_TYPE_MAP[chartType] }}
        <Popover trigger="click" placement="top" v-model:value="chartTypeSelectVisible">
          <template #content>
            <PopoverMenuItem
              center
              v-for="item in chartList" 
              :key="item" 
              @click="chartType = item; chartTypeSelectVisible = false"
            >{{CHART_TYPE_MAP[item]}}</PopoverMenuItem>
          </template>
          <span class="change">Change</span>
        </Popover>
      </div>
      <div class="right">
        <Button class="btn" @click="closeEditor()">Cancel</Button>
        <Button class="btn" @click="clear()">Clear Data</Button>
        <Button type="primary" class="btn" @click="getTableData()">Confirm</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ChartData, ChartType } from '@/types/slides'
import { KEYS } from '@/configs/hotkey'
import { CHART_TYPE_MAP } from '@/configs/chart'
import { pasteCustomClipboardString, pasteExcelClipboardString, pasteHTMLTableClipboardString } from '@/utils/clipboard'
import Button from '@/components/Button.vue'
import Popover from '@/components/Popover.vue'
import PopoverMenuItem from '@/components/PopoverMenuItem.vue'

const props = defineProps<{
  type: ChartType
  data: ChartData
}>()

const emit = defineEmits<{
  (event: 'save', payload: {
    data: ChartData
    type: ChartType
  }): void
  (event: 'close'): void
}>()

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CELL_WIDTH = 100
const CELL_HEIGHT = 32

const chartList: ChartType[] = ['bar', 'column', 'line', 'area', 'scatter', 'pie', 'ring', 'radar']
const chartTypeSelectVisible = ref(false)
const selectedRange = ref([0, 0])
const tempRangeSize = ref({ width: 0, height: 0 })
const focusCell = ref<[number, number] | null>(null)
const chartType = ref<ChartType>('bar')

// Position of the border lines of the current selection
const rangeLines = computed(() => {
  const width = selectedRange.value[0] * CELL_WIDTH
  const height = selectedRange.value[1] * CELL_HEIGHT
  return [
    { type: 't', style: {width: width + 'px'} },
    { type: 'b', style: {top: height + 'px', width: width + 'px'} },
    { type: 'l', style: {height: height + 'px'} },
    { type: 'r', style: {left: width + 'px', height: height + 'px'} },
  ]
})

// Position of the scaling point of the current selection
const resizablePointStyle = computed(() => {
  const width = selectedRange.value[0] * CELL_WIDTH
  const height = selectedRange.value[1] * CELL_HEIGHT
  return { left: width + 'px', top: height + 'px' }
})

// Initialize chart data: format the data and fill it into the DOM
const initData = () => {
  chartType.value = props.type

  const _data: string[][] = []

  const { labels, legends, series } = props.data
  const rowCount = labels.length
  const colCount = series.length

  _data.push(['', ...legends])
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = [labels[rowIndex]]
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      row.push(series[colIndex][rowIndex] + '')
    }
    _data.push(row)
  }

  for (let rowIndex = 0; rowIndex < rowCount + 1; rowIndex++) {
    for (let colIndex = 0; colIndex < colCount + 1; colIndex++) {
      const inputRef = document.querySelector(`#cell-${rowIndex}-${colIndex}`) as HTMLInputElement
      if (!inputRef) continue
      inputRef.value = _data[rowIndex][colIndex] + ''
    }
  }

  selectedRange.value = [colCount + 1, rowCount + 1]
}

onMounted(initData)

// Keyboard listener: Enter moves focus to the next row
const moveNextRow = () => {
  if (!focusCell.value) return

  const [rowIndex, colIndex] = focusCell.value
  const inputRef = document.querySelector(`#cell-${rowIndex + 1}-${colIndex}`) as HTMLInputElement
  inputRef && inputRef.focus()
}

const keyboardListener = (e: KeyboardEvent) => {
  const key = e.key.toUpperCase()
  if (key === KEYS.ENTER) moveNextRow()
}

onMounted(() => {
  document.addEventListener('keydown', keyboardListener)
})
onUnmounted(() => {
  document.removeEventListener('keydown', keyboardListener)
})

// Get the data from the current chart DOM, format it, and pass it out
const getTableData = () => {
  const [col, row] = selectedRange.value

  const labels: string[] = []
  let legends: string[] = []
  let series: number[][] = []

  // The first row is the series name, the first column is the project name, and the actual data starts from the second row and second column
  for (let rowIndex = 1; rowIndex < row; rowIndex++) {
    let labelsItem = `Category${rowIndex}`
    const labelInputRef = document.querySelector(`#cell-${rowIndex}-0`) as HTMLInputElement
    if (labelInputRef && labelInputRef.value) labelsItem = labelInputRef.value
    labels.push(labelsItem)
  }
  for (let colIndex = 1; colIndex < col; colIndex++) {
    let legendsItem = `Series${colIndex}`
    const labelInputRef = document.querySelector(`#cell-0-${colIndex}`) as HTMLInputElement
    if (labelInputRef && labelInputRef.value) legendsItem = labelInputRef.value
    legends.push(legendsItem)
  }

  for (let colIndex = 1; colIndex < col; colIndex++) {
    const seriesItem = []
    for (let rowIndex = 1; rowIndex < row; rowIndex++) {
      const valueInputRef = document.querySelector(`#cell-${rowIndex}-${colIndex}`) as HTMLInputElement
      let value = 0
      if (valueInputRef && valueInputRef.value && !!(+valueInputRef.value)) {
        value = +valueInputRef.value
      }
      seriesItem.push(value)
    }
    series.push(seriesItem)
  }

  // Some special chart types require separate data processing
  // Scatter plots have only two columns of data
  if (chartType.value === 'scatter') {
    if (legends.length > 2) {
      legends = legends.slice(0, 2)
      series = series.slice(0, 2)
    }
    if (legends.length < 2) {
      legends.push('Y')
      series.push(series[0])
    }
  }
  // Pie charts and ring charts have only one column of data
  if (chartType.value === 'ring' || chartType.value === 'pie') {
    if (legends.length > 1) {
      legends = legends.slice(0, 1)
      series = series.slice(0, 1)
    }
  }

  emit('save', { data: { labels, legends, series }, type: chartType.value })
}

// Clear table data
const clear = () => {
  for (let rowIndex = 1; rowIndex < 31; rowIndex++) {
    for (let colIndex = 1; colIndex < 7; colIndex++) {
      const inputRef = document.querySelector(`#cell-${rowIndex}-${colIndex}`) as HTMLInputElement
      if (!inputRef) continue
      inputRef.value = ''
    }
  }
}

const fillTableData = (data: string[][], rowIndex: number, colIndex: number) => {
  const maxRow = rowIndex + data.length
  const maxCol = colIndex + data[0].length
  for (let i = rowIndex; i < maxRow; i++) {
    for (let j = colIndex; j < maxCol; j++) {
      const inputRef = document.querySelector(`#cell-${i}-${j}`) as HTMLInputElement
      if (!inputRef) continue
      inputRef.value = data[i - rowIndex][j - colIndex]
    }
  }
}

// Custom paste event (try to read table data from the clipboard)
const handlePaste = (e: ClipboardEvent, rowIndex: number, colIndex: number) => {
  e.preventDefault()

  if (!e.clipboardData) return

  const clipboardDataFirstItem = e.clipboardData.items[0]

  if (clipboardDataFirstItem && clipboardDataFirstItem.kind === 'string') {
    if (clipboardDataFirstItem.type === 'text/plain') {
      clipboardDataFirstItem.getAsString(text => {
        const clipboardData = pasteCustomClipboardString(text)
        if (typeof clipboardData === 'object') return
   
        const excelData = pasteExcelClipboardString(text)
        if (excelData) {
          fillTableData(excelData, rowIndex, colIndex)
          return
        }
  
        document.execCommand('insertText', false, text)
      })
    }
    else if (clipboardDataFirstItem.type === 'text/html') {
      clipboardDataFirstItem.getAsString(html => {
        const htmlData = pasteHTMLTableClipboardString(html)
        if (htmlData) fillTableData(htmlData, rowIndex, colIndex)
      }) 
    }
  }
}

// Close the chart data editor
const closeEditor = () => emit('close')

// Mouse drag to modify the selected data range
const changeSelectRange = (e: MouseEvent) => {
  let isMouseDown = true

  const startPageX = e.pageX
  const startPageY = e.pageY

  const originWidth = selectedRange.value[0] * CELL_WIDTH
  const originHeight = selectedRange.value[1] * CELL_HEIGHT

  document.onmousemove = e => {
    if (!isMouseDown) return

    const currentPageX = e.pageX
    const currentPageY = e.pageY

    const x = currentPageX - startPageX
    const y = currentPageY - startPageY

    const width = originWidth + x
    const height = originHeight + y

    tempRangeSize.value = { width, height }
  }

  document.onmouseup = e => {
    isMouseDown = false
    document.onmousemove = null
    document.onmouseup = null

    const endPageX = e.pageX
    const endPageY = e.pageY

    if (startPageX === endPageX && startPageY === endPageY) return

    // When the dragging ends, if the range exceeds half of the grid, it will automatically expand to the next grid (for example, if it is dragged to a position of more than one and a half grids, it will automatically expand to two grids, the same applies to horizontal and vertical)
    let width = tempRangeSize.value.width
    let height = tempRangeSize.value.height
    if (width % CELL_WIDTH > CELL_WIDTH * 0.5) width = width + (CELL_WIDTH - width % CELL_WIDTH)
    if (height % CELL_HEIGHT > CELL_HEIGHT * 0.5) height = height + (CELL_HEIGHT - height % CELL_HEIGHT)

    let row = Math.round(height / CELL_HEIGHT)
    let col = Math.round(width / CELL_WIDTH)

    if (row < 3) row = 3
    if (col < 2) col = 2

    selectedRange.value = [col, row]
    tempRangeSize.value = { width: 0, height: 0 }
  }
}
</script>

<style lang="scss" scoped>
.chart-data-editor {
  width: 600px;
  position: relative;
}
.editor-content {
  width: 100%;
  height: 360px;
  position: relative;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding-left: 30px;
  padding-top: 20px;

  @include overflow-overlay();
}
.range-box {
  position: absolute;
  top: 20px;
  left: 30px;
  z-index: 100;
  user-select: none;
}
.temp-range {
  width: 0;
  height: 0;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba($color: #888, $alpha: .3);
}
.range-line {
  width: 0;
  height: 0;
  position: absolute;
  left: 0;
  top: 0;
  border: 0 solid $themeColor;

  &.t {
    border-top-width: 1px;
  }
  &.b {
    border-bottom-width: 1px;
  }
  &.l {
    border-left-width: 1px;
  }
  &.r {
    border-right-width: 1px;
  }
}
.resizable {
  position: absolute;
  width: 12px;
  height: 12px;
  left: 0;
  top: 0;
  margin: -9px 0 0 -9px;
  cursor: nwse-resize;

  &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 12px;
    right: 0;
    top: 0;
    background-color: $themeColor;
  }
  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 4px;
    right: 0;
    bottom: 0;
    background-color: $themeColor;
  }
}
table {
  width: 100%;
  height: 100%;
  user-select: none;
  table-layout: fixed;

  td {
    text-align: center;
    border: 1px solid #ccc;
    vertical-align: middle;
    width: 100px;
    height: 32px;

    &.head {
      background-color: rgba($color: $themeColor, $alpha: .08);
    }
  }
  .item {
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    padding: 0;
    font-size: 13px;
    text-align: center;
    background-color: transparent;
  }
}
.btns {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;

  .btn {
    margin-left: 10px;
  }

  .left {
    display: flex;
    align-items: center;
    font-size: 12px;

    .change {
      color: #ccc;
      margin-left: 5px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.col-header {
  width: auto;
  height: 20px;
  position: absolute;
  top: 0;
  left: 30px;
  display: flex;
  border: 1px solid #ccc;
  border-bottom: 0;
  border-right: 0;
  background-color: $lightGray;
}
.col-header-item {
  width: 100px;
  position: relative;
  border-right: 1px solid #ccc;
}
.col-key {
  font-size: 10px;
  text-align: center;
  line-height: 20px;
}
.row-header {
  height: auto;
  width: 30px;
  position: absolute;
  top: 20px;
  left: 0;
  border: 1px solid #ccc;
  border-bottom: 0;
  border-right: 0;
  background-color: $lightGray;
}
.row-header-item {
  height: 32px;
  position: relative;
  border-bottom: 1px solid #ccc;
}
.row-key {
  height: 100%;
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.all-header {
  width: 30px;
  height: 20px;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid #ccc;
  border-bottom: 0;
  border-right: 0;
  background-color: $lightGray;

  .triangle {
    position: absolute;
    bottom: 4px;
    right: 4px;
  }
}
</style>