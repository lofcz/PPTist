<template>
  <div class="table-style-panel">
    <SelectGroup class="row">
      <Select
        style="width: 50%;"
        :value="textAttrs.fontname"
        search
        searchLabel="Search Font"
        @update:value="value => updateTextAttrs({ fontname: value as string })"
        :options="FONTS"
      >
        <template #icon>
          <IconFontSize />
        </template>
      </Select>
      <Select
        style="width: 50%;"
        :value="textAttrs.fontsize"
        search
        searchLabel="Search Font Size"
        @update:value="value => updateTextAttrs({ fontsize: value as string })"
        :options="fontSizeOptions.map(item => ({
          label: item, value: item
        }))"
      >
        <template #icon>
          <IconAddText />
        </template>
      </Select>
    </SelectGroup>

    <ButtonGroup class="row" passive>
      <Popover trigger="click" style="width: 50%;">
        <template #content>
          <ColorPicker
            :modelValue="textAttrs.color"
            @update:modelValue="value => updateTextAttrs({ color: value })"
          />
        </template>
        <TextColorButton first v-tooltip="'Text Color'" :color="textAttrs.color">
          <IconText />
        </TextColorButton>
      </Popover>
      <Popover trigger="click" style="width: 50%;">
        <template #content>
          <ColorPicker
            :modelValue="textAttrs.backcolor"
            @update:modelValue="value => updateTextAttrs({ backcolor: value })"
          />
        </template>
        <TextColorButton last v-tooltip="'Cell Fill'" :color="textAttrs.backcolor">
          <IconFill />
        </TextColorButton>
      </Popover>
    </ButtonGroup>

    <ButtonGroup class="row">
      <CheckboxButton 
        style="flex: 1;"
        :checked="textAttrs.bold"
        v-tooltip="'Bold'"
        @click="updateTextAttrs({ bold: !textAttrs.bold })"
      ><IconTextBold /></CheckboxButton>
      <CheckboxButton 
        style="flex: 1;"
        :checked="textAttrs.em"
        v-tooltip="'Italic'"
        @click="updateTextAttrs({ em: !textAttrs.em })"
      ><IconTextItalic /></CheckboxButton>
      <CheckboxButton 
        style="flex: 1;"
        :checked="textAttrs.underline"
        v-tooltip="'Underline'"
        @click="updateTextAttrs({ underline: !textAttrs.underline })"
      ><IconTextUnderline /></CheckboxButton>
      <CheckboxButton 
        style="flex: 1;"
        :checked="textAttrs.strikethrough"
        v-tooltip="'Strikethrough'"
        @click="updateTextAttrs({ strikethrough: !textAttrs.strikethrough })"
      ><IconStrikethrough /></CheckboxButton>
    </ButtonGroup>

    <RadioGroup 
      class="row" 
      button-style="solid" 
      :value="textAttrs.align"
      @update:value="value => updateTextAttrs({ align: value as TextAlign })"
    >
      <RadioButton value="left" v-tooltip="'Left Align'" style="flex: 1;"><IconAlignTextLeft /></RadioButton>
      <RadioButton value="center" v-tooltip="'Center'" style="flex: 1;"><IconAlignTextCenter /></RadioButton>
      <RadioButton value="right" v-tooltip="'Right Align'" style="flex: 1;"><IconAlignTextRight /></RadioButton>
      <RadioButton value="justify" v-tooltip="'Justify'" style="flex: 1;"><IconAlignTextBoth /></RadioButton>
    </RadioGroup>

    <Divider />

    <ElementOutline :fixed="true" />

    <Divider />

    <div class="row">
      <div style="width: 40%;">Rows:</div>
      <div class="set-count" style="width: 60%;">
        <Button class="btn" :disabled="rowCount <= 1" @click="setTableRow(rowCount - 1)"><IconMinus /></Button>
        <div class="count-text">{{rowCount}}</div>
        <Button class="btn" :disabled="rowCount >= 30" @click="setTableRow(rowCount + 1)"><IconPlus /></Button>
      </div>
    </div>
    <div class="row">
      <div style="width: 40%;">Columns:</div>
      <div class="set-count" style="width: 60%;">
        <Button class="btn" :disabled="colCount <= 1" @click="setTableCol(colCount - 1)"><IconMinus /></Button>
        <div class="count-text">{{colCount}}</div>
        <Button class="btn" :disabled="colCount >= 30" @click="setTableCol(colCount + 1)"><IconPlus /></Button>
      </div>
    </div>

    <Divider />

    <div class="row theme-switch">
      <div style="width: 40%;">Enable Theme Table:</div>
      <div class="switch-wrapper" style="width: 60%;">
        <Switch 
          :value="hasTheme" 
          @update:value="value => toggleTheme(value)" 
        />
      </div>
    </div>

    <template v-if="theme">
      <div class="row">
        <Checkbox 
          @update:value="value => updateTheme({ rowHeader: value })" 
          :value="theme.rowHeader" 
          style="flex: 1;"
        >Header Row</Checkbox>
        <Checkbox 
          @update:value="value => updateTheme({ rowFooter: value })" 
          :value="theme.rowFooter" 
          style="flex: 1;"
        >Summary Row</Checkbox>
      </div>
      <div class="row">
        <Checkbox 
          @update:value="value => updateTheme({ colHeader: value })" 
          :value="theme.colHeader" 
          style="flex: 1;"
        >First Column</Checkbox>
        <Checkbox 
          @update:value="value => updateTheme({ colFooter: value })" 
          :value="theme.colFooter" 
          style="flex: 1;"
        >Last Column</Checkbox>
      </div>
      <div class="row">
        <div style="width: 40%;">Theme Color:</div>
        <Popover trigger="click" style="width: 60%;">
          <template #content>
            <ColorPicker
              :modelValue="theme.color"
              @update:modelValue="value => updateTheme({ color: value })"
            />
          </template>
          <ColorButton :color="theme.color" />
        </Popover>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTTableElement, TableCell, TableCellStyle, TableTheme, TextAlign } from '@/types/slides'
import { FONTS } from '@/configs/font'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import ElementOutline from '../common/ElementOutline.vue'
import ColorButton from '@/components/ColorButton.vue'
import TextColorButton from '@/components/TextColorButton.vue'
import CheckboxButton from '@/components/CheckboxButton.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Divider from '@/components/Divider.vue'
import Switch from '@/components/Switch.vue'
import Checkbox from '@/components/Checkbox.vue'
import Button from '@/components/Button.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import RadioButton from '@/components/RadioButton.vue'
import RadioGroup from '@/components/RadioGroup.vue'
import Select from '@/components/Select.vue'
import SelectGroup from '@/components/SelectGroup.vue'
import Popover from '@/components/Popover.vue'

const slidesStore = useSlidesStore()
const { handleElement, handleElementId, selectedTableCells: selectedCells } = storeToRefs(useMainStore())
const themeColor = computed(() => slidesStore.theme.themeColors[0])

const fontSizeOptions = [
  '12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px',
]

const textAttrs = ref({
  bold: false,
  em: false,
  underline: false,
  strikethrough: false,
  color: '#000',
  backcolor: '',
  fontsize: '12px',
  fontname: '',
  align: 'left',
})

const theme = ref<TableTheme>()
const hasTheme = ref(false)
const rowCount = ref(0)
const colCount = ref(0)
const minRowCount = ref(0)
const minColCount = ref(0)

watch(handleElement, () => {
  if (!handleElement.value || handleElement.value.type !== 'table') return
  
  theme.value = handleElement.value.theme
  hasTheme.value = !!theme.value

  rowCount.value = handleElement.value.data.length
  colCount.value = handleElement.value.data[0].length

  minRowCount.value = handleElement.value.data.length
  minColCount.value = handleElement.value.data[0].length
}, { deep: true, immediate: true })

const { addHistorySnapshot } = useHistorySnapshot()

// Update the text style state of the currently selected cell
const updateTextAttrState = () => {
  if (!handleElement.value || handleElement.value.type !== 'table') return

  let rowIndex = 0
  let colIndex = 0
  if (selectedCells.value.length) {
    const selectedCell = selectedCells.value[0]
    rowIndex = +selectedCell.split('_')[0]
    colIndex = +selectedCell.split('_')[1]
  }
  const style = handleElement.value.data[rowIndex][colIndex].style

  if (!style) {
    textAttrs.value = {
      bold: false,
      em: false,
      underline: false,
      strikethrough: false,
      color: '#000',
      backcolor: '',
      fontsize: '12px',
      fontname: '',
      align: 'left',
    }
  }
  else {
    textAttrs.value = {
      bold: !!style.bold,
      em: !!style.em,
      underline: !!style.underline,
      strikethrough: !!style.strikethrough,
      color: style.color || '#000',
      backcolor: style.backcolor || '',
      fontsize: style.fontsize || '12px',
      fontname: style.fontname || '',
      align: style.align || 'left',
    }
  }
}

onMounted(() => {
  if (selectedCells.value.length) updateTextAttrState()
})

watch(selectedCells, updateTextAttrState)

const updateElement = (props: Partial<PPTTableElement>) => {
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}

// Set cell content text style
const updateTextAttrs = (textAttrProp: Partial<TableCellStyle>) => {
  const _handleElement = handleElement.value as PPTTableElement

  const data: TableCell[][] = JSON.parse(JSON.stringify(_handleElement.data))

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (!selectedCells.value.length || selectedCells.value.includes(`${i}_${j}`)) {
        const style = data[i][j].style || {}
        data[i][j].style = { ...style, ...textAttrProp }
      }
    }
  }
  updateElement({ data })
  updateTextAttrState()
}

// Update table theme: theme color, header row, summary row, first column, last column
const updateTheme = (themeProp: Partial<TableTheme>) => {
  if (!theme.value) return
  const _theme = { ...theme.value, ...themeProp }
  updateElement({ theme: _theme })
}

// Enable/disable table theme
const toggleTheme = (checked: boolean) => {
  if (checked) {
    const props = {
      theme: {
        color: themeColor.value,
        rowHeader: true,
        rowFooter: false,
        colHeader: false,
        colFooter: false,
      }
    }
    updateElement(props)
  }
  else {
    slidesStore.removeElementProps({ id: handleElementId.value, propName: 'theme' })
    addHistorySnapshot()
  }
}

// Set the number of table rows
const setTableRow = (value: number) => {
  const _handleElement = handleElement.value as PPTTableElement
  const rowCount = _handleElement.data.length

  if (value > rowCount) {
    const rowCells: TableCell[] = new Array(colCount.value).fill({ id: nanoid(10), colspan: 1, rowspan: 1, text: '' })
    const newTableCells: TableCell[][] = new Array(value - rowCount).fill(rowCells)
  
    const tableCells: TableCell[][] = JSON.parse(JSON.stringify(_handleElement.data))
    tableCells.push(...newTableCells)
  
    updateElement({ data: tableCells })
  }
  else {
    const tableCells: TableCell[][] = _handleElement.data.slice(0, value)
    updateElement({ data: tableCells })
  }
}

// Set the number of table columns
const setTableCol = (value: number) => {
  const _handleElement = handleElement.value as PPTTableElement
  const colCount = _handleElement.data[0].length

  let tableCells = _handleElement.data
  let colSizeList = _handleElement.colWidths.map(item => item * _handleElement.width)

  if (value > colCount) {
    tableCells = tableCells.map(item => {
      const cells: TableCell[] = new Array(value - colCount).fill({ id: nanoid(10), colspan: 1, rowspan: 1, text: '' })
      item.push(...cells)
      return item
    })
  
    const newColSizeList: number[] = new Array(value - colCount).fill(100)
    colSizeList.push(...newColSizeList)
  }
  else {
    tableCells = tableCells.map(item => item.slice(0, value))
    colSizeList = colSizeList.slice(0, value)
  }

  const width = colSizeList.reduce((a, b) => a + b)
  const colWidths = colSizeList.map(item => item / width)

  const props = {
    width,
    data: tableCells,
    colWidths,
  }
  updateElement(props)
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.theme-switch {
  margin-bottom: 18px;
}
.switch-wrapper {
  text-align: right;
}
.set-count {
  display: flex;
  justify-content: center;
  align-items: center;

  .btn {
    padding: 0 8px;
  }

  .count-text {
    flex: 1;
    text-align: center;
    margin: 0 8px;
  }
}
</style>