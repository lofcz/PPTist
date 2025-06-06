<template>
  <div class="text-style-panel">
    <div class="preset-style">
      <div 
        class="preset-style-item"
        v-for="item in presetStyles"
        :key="item.label"
        :style="item.style"
        @click="emitBatchRichTextCommand(item.cmd)"
      >{{item.label}}</div>
    </div>

    <Divider />
    <RichTextBase />
    <Divider />

    <div class="row">
      <div style="width: 40%;">Line Spacing:</div>
      <Select style="width: 60%;"
        :value="lineHeight || 1"
        @update:value="value => updateLineHeight(value as number)"
        :options="lineHeightOptions.map(item => ({
          label: item + 'x', value: item
        }))"
      >
        <template #icon>
          <IconRowHeight />
        </template>
      </Select>
    </div>
    <div class="row">
      <div style="width: 40%;">Paragraph Spacing:</div>
      <Select style="width: 60%;"
        :value="paragraphSpace || 0"
        @update:value="value => updateParagraphSpace(value as number)"
        :options="paragraphSpaceOptions.map(item => ({
          label: item + 'px', value: item
        }))"
      >
        <template #icon>
          <IconVerticalSpacingBetweenItems />
        </template>
      </Select>
    </div>
    <div class="row">
      <div style="width: 40%;">Letter Spacing:</div>
      <Select style="width: 60%;"
        :value="wordSpace || 0"
        @update:value="value => updateWordSpace(value as number)"
        :options="wordSpaceOptions.map(item => ({
          label: item + 'px', value: item
        }))"
      >
        <template #icon>
          <IconFullwidth />
        </template>
      </Select>
    </div>
    <div class="row">
      <div style="width: 40%;">Text Box Fill:</div>
      <Popover trigger="click" style="width: 60%;">
        <template #content>
          <ColorPicker
            :modelValue="fill"
            @update:modelValue="value => updateFill(value)"
          />
        </template>
        <ColorButton :color="fill" />
      </Popover>
    </div>

    <Divider />
    <ElementOutline />
    <Divider />
    <ElementShadow />
    <Divider />
    <ElementOpacity />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTTextElement } from '@/types/slides'
import emitter, { EmitterEvents, type RichTextAction } from '@/utils/emitter'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import ElementOpacity from '../common/ElementOpacity.vue'
import ElementOutline from '../common/ElementOutline.vue'
import ElementShadow from '../common/ElementShadow.vue'
import RichTextBase from '../common/RichTextBase.vue'
import ColorButton from '@/components/ColorButton.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Divider from '@/components/Divider.vue'
import Select from '@/components/Select.vue'
import Popover from '@/components/Popover.vue'

// Note: There is a bug that causes the visible area positioning of the canvas to be incorrect if the text box height increases after the text is bolded.
// Therefore, when executing preset style commands, place the bold command as early as possible to avoid increasing the font size before bolding.
const presetStyles = [
  {
    label: 'Heading',
    style: {
      fontSize: '24px',
      fontWeight: 700,
    },
    cmd: [
      { command: 'clear' },
      { command: 'bold' },
      { command: 'fontsize', value: '66px' },
      { command: 'align', value: 'center' },
    ],
  },
  {
    label: 'Subheading',
    style: {
      fontSize: '16px',
      fontWeight: 700,
    },
    cmd: [
      { command: 'clear' },
      { command: 'bold' },
      { command: 'fontsize', value: '40px' },
      { command: 'align', value: 'center' },
    ],
  },
  {
    label: 'Default',
    style: {
      fontSize: '20px',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '20px' },
    ],
  },
  {
    label: 'Smaller',
    style: {
      fontSize: '18px',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '18px' },
    ],
  },
  {
    label: 'Comment 1',
    style: {
      fontSize: '16px',
      fontStyle: 'italic',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '16px' },
      { command: 'em' },
    ],
  },
  {
    label: 'Comment 2',
    style: {
      fontSize: '16px',
      textDecoration: 'underline',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '16px' },
      { command: 'underline' },
    ],
  },
]

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { handleElement, handleElementId } = storeToRefs(mainStore)

const { addHistorySnapshot } = useHistorySnapshot()

const updateElement = (props: Partial<PPTTextElement>) => {
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}

const fill = ref<string>('#000')
const lineHeight = ref<number>()
const wordSpace = ref<number>()
const paragraphSpace = ref<number>()

watch(handleElement, () => {
  if (!handleElement.value || handleElement.value.type !== 'text') return

  fill.value = handleElement.value.fill || '#fff'
  lineHeight.value = handleElement.value.lineHeight || 1.5
  wordSpace.value = handleElement.value.wordSpace || 0
  paragraphSpace.value = handleElement.value.paragraphSpace === undefined ? 5 : handleElement.value.paragraphSpace
  emitter.emit(EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE)
}, { deep: true, immediate: true })

const lineHeightOptions = [0.9, 1.0, 1.15, 1.2, 1.4, 1.5, 1.8, 2.0, 2.5, 3.0]
const wordSpaceOptions = [0, 1, 2, 3, 4, 5, 6, 8, 10]
const paragraphSpaceOptions = [0, 5, 10, 15, 20, 25, 30, 40, 50, 80]

// Set line height
const updateLineHeight = (value: number) => {
  updateElement({ lineHeight: value })
}

// Set paragraph spacing
const updateParagraphSpace = (value: number) => {
  updateElement({ paragraphSpace: value })
}

// Set letter spacing
const updateWordSpace = (value: number) => {
  updateElement({ wordSpace: value })
}

// Set text box fill
const updateFill = (value: string) => {
  updateElement({ fill: value })
}

// Send rich text setting command (batch)
const emitBatchRichTextCommand = (action: RichTextAction[]) => {
  emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action })
}
</script>

<style lang="scss" scoped>
.text-style-panel {
  user-select: none;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.preset-style {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.preset-style-item {
  width: 50%;
  height: 50px;
  border: solid 1px #d6d6d6;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: all $transitionDelay;

  &:hover {
    border-color: $themeColor;
    color: $themeColor;
    z-index: 1;
  }

  &:nth-child(2n) {
    margin-left: -1px;
  }
  &:nth-child(n+3) {
    margin-top: -1px;
  }
}
</style>