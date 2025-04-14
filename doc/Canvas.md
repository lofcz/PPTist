## Canvas and Elements

#### Basic Structure of the Editor
```
└── Editor
    ├── Top Menu Bar
    ├── Left Sidebar
    ├── Right Sidebar
    ├── Toolbar (Upper/Central) / Insert Bar
    ├── Bottom Speaker Notes
    └── Canvas
         ├── Visible Area
         │    ├── Editable Elements
         │    └── Mouse Selection Box / Marquee
         │
         └── Canvas Tools
              ├── Guides / Reference Lines
              ├── Rulers
              ├── Element Control Handles Layer (e.g., drag/resize points)
              ├── Snapping / Alignment Guides
              └── Visible Area Background
```

#### Basic Principles of the Canvas
Let's focus on the relatively complex [Canvas] part. Each element within the canvas is described by a set of data, for example:
```typescript
interface PPTBaseElement {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}
```
As the names suggest, left represents the element's distance from the canvas's top-left corner, width represents the element's width, and so on.
The key point to understand is: the visible area defaults to a base aspect ratio corresponding to 1000 pixels wide and 562.5 pixels high. This means that regardless of the actual size of the canvas and the visible area, an element defined as `{ width: 1000px, height: 562.5px, left: 0, top: 0 }` will always precisely fill the entire visible area.
The implementation method is very simple: assume the actual width of the visible area is 1200px. Calculate the scaling ratio at this point as 1200 / 1000 = 1.2. Then, simply scale all elements within the visible area by a factor of 1.2.
Similarly, the [Thumbnail] and [Slide Show View / Presentation Page] are essentially just visible areas with smaller or larger actual sizes.

#### Elements within the Canvas
Besides the position and size information mentioned above, elements can carry more data. Take a text element as an example:
```typescript
interface PPTTextElement {
  type: 'text';
  id: string;
  left: number;
  top: number;
  lock?: boolean;
  groupId?: string;
  width: number;
  height: number;
  link?: string;
  content: string;
  rotate: number;
  defaultFontName: string;
  defaultColor: string;
  outline?: PPTElementOutline;
  fill?: string;
  lineHeight?: number;
  wordSpace?: number;
  opacity?: number;
  shadow?: PPTElementShadow;
}
```
You can define a `rotate` property to represent the text box's rotation angle, define an `opacity` property to represent its transparency, etc. During implementation, you simply need to render the element component according to the data you have defined. The essence of editing elements is modifying this data.
The above describes the most basic composition of a canvas.
