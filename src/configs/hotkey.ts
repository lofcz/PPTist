export const enum KEYS {
  C = 'C',
  X = 'X',
  Z = 'Z',
  Y = 'Y',
  A = 'A',
  G = 'G',
  L = 'L',
  F = 'F',
  D = 'D',
  B = 'B',
  P = 'P',
  O = 'O',
  R = 'R',
  T = 'T',
  MINUS = '-',
  EQUAL = '=',
  DIGIT_0 = '0',
  DELETE = 'DELETE',
  UP = 'ARROWUP',
  DOWN = 'ARROWDOWN',
  LEFT = 'ARROWLEFT',
  RIGHT = 'ARROWRIGHT',
  ENTER = 'ENTER',
  SPACE = ' ',
  TAB = 'TAB',
  BACKSPACE = 'BACKSPACE',
  ESC = 'ESCAPE',
  PAGEUP = 'PAGEUP',
  PAGEDOWN = 'PAGEDOWN',
  F5 = 'F5',
}

interface HotkeyItem {
  type: string
  children: {
    label: string
    value?: string
  }[] 
}

export const HOTKEY_DOC: HotkeyItem[] = [
  {
    type: 'General',
    children: [
      { label: 'Cut', value: 'Ctrl + X' },
      { label: 'Copy', value: 'Ctrl + C' },
      { label: 'Paste', value: 'Ctrl + V' },
      { label: 'Paste as plain text', value: 'Ctrl + Shift + V' },
      { label: 'Quick copy and paste', value: 'Ctrl + D' },
      { label: 'Select all', value: 'Ctrl + A' },
      { label: 'Undo', value: 'Ctrl + Z' },
      { label: 'Redo', value: 'Ctrl + Y' },
      { label: 'Delete', value: 'Delete / Backspace' },
      { label: 'Multiple selection', value: 'Hold Ctrl or Shift' },
      { label: 'Open search and replace', value: 'Ctrl + F' },
      { label: 'Print', value: 'Ctrl + P' },
      { label: 'Close popup', value: 'ESC' },
    ],
  },
  {
    type: 'Slideshow',
    children: [
      { label: 'Start slideshow from beginning', value: 'F5' },
      { label: 'Start slideshow from current slide', value: 'Shift + F5' },
      { label: 'Switch to previous page', value: '↑ / ← / PgUp' },
      { label: 'Switch to next page', value: '↓ / → / PgDown' },
      { label: 'Switch to next page', value: 'Enter / Space' },
      { label: 'Exit slideshow', value: 'ESC' },
    ],
  },
  {
    type: 'Slide Editing',
    children: [
      { label: 'New slide', value: 'Enter' },
      { label: 'Move canvas', value: 'Space + Mouse Drag' },
      { label: 'Zoom canvas', value: 'Ctrl + Mouse Wheel' },
      { label: 'Zoom in canvas', value: 'Ctrl + =' },
      { label: 'Zoom out canvas', value: 'Ctrl + -' },
      { label: 'Fit canvas to current screen', value: 'Ctrl + 0' },
      { label: 'Previous page (no element selected)', value: '↑' },
      { label: 'Next page (no element selected)', value: '↓' },
      { label: 'Previous page', value: 'Mouse Wheel Up / PgUp' },
      { label: 'Next page', value: 'Mouse Wheel Down / PgDown' },
      { label: 'Quickly create text', value: 'Double click on blank area / T' },
      { label: 'Quickly create rectangle', value: 'R' },
      { label: 'Quickly create circle', value: 'O' },
      { label: 'Quickly create line', value: 'L' },
      { label: 'Exit drawing state', value: 'Right mouse click' },
    ],
  },
  {
    type: 'Element Manipulation',
    children: [
      { label: 'Move', value: '↑ / ← / ↓ / →' },
      { label: 'Lock', value: 'Ctrl + L' },
      { label: 'Group', value: 'Ctrl + G' },
      { label: 'Ungroup', value: 'Ctrl + Shift + G' },
      { label: 'Bring to front', value: 'Alt + F' },
      { label: 'Send to back', value: 'Alt + B' },
      { label: 'Lock aspect ratio', value: 'Hold Ctrl or Shift' },
      { label: 'Create horizontal / vertical line', value: 'Hold Ctrl or Shift' },
      { label: 'Switch focus element', value: 'Tab' },
      { label: 'Confirm image cropping', value: 'Enter' },
      { label: 'Complete custom shape drawing', value: 'Enter' },
    ],
  },
  {
    type: 'Table Editing',
    children: [
      { label: 'Focus on next cell', value: 'Tab' },
      { label: 'Move focus cell', value: '↑ / ← / ↓ / →' },
      { label: 'Insert a row above', value: 'Ctrl + ↑' },
      { label: 'Insert a row below', value: 'Ctrl + ↓' },
      { label: 'Insert a column to the left', value: 'Ctrl + ←' },
      { label: 'Insert a column to the right', value: 'Ctrl + →' },
    ],
  },
  {
    type: 'Chart Data Editing',
    children: [
      { label: 'Focus on next row', value: 'Enter' },
    ],
  },
  {
    type: 'Text Editing',
    children: [
      { label: 'Bold', value: 'Ctrl + B' },
      { label: 'Italic', value: 'Ctrl + I' },
      { label: 'Underline', value: 'Ctrl + U' },
      { label: 'Inline code', value: 'Ctrl + E' },
      { label: 'Superscript', value: 'Ctrl + ;' },
      { label: 'Subscript', value: `Ctrl + '` },
      { label: 'Select paragraph', value: `ESC` },
    ],
  },
  {
    type: 'Other Quick Operations',
    children: [
      { label: 'Add image - Paste image from system clipboard' },
      { label: 'Add image - Drag local image to canvas' },
      { label: 'Add image - Paste SVG code in canvas' },
      { label: 'Add image - Paste image link from pexels' },
      { label: 'Add text - Paste text from system clipboard' },
      { label: 'Add text - Drag external selected text to canvas' },
      { label: 'Text editing - Support markdown syntax to create lists and quotes' },
    ],
  },
]