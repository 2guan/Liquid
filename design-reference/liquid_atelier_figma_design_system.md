# 🍸 流体工坊（The Liquid Atelier）
# Figma级设计系统（Design System v1.0）

---

# 1. 设计系统目标（System Goal）

本设计系统用于：

- 🎨 统一“流体工坊”复古手绘写实风格
- 🧩 支撑Figma组件化搭建
- 🤖 支持AI自动生成UI代码（关键目标）
- 📱 同时适配竖屏 / 横屏 / iPad

---

# 2. 设计原则（Design Principles）

## 2.1 AI可生成原则

所有UI必须满足：

- 组件可枚举（Component-based）
- 属性可配置（Token-driven）
- 布局可JSON化
- 状态机驱动交互

---

## 2.2 美学原则

- Warm Dark Tone（暖黑色基底）
- Amber Light（琥珀色光源）
- Hand-drawn realism（手绘写实）
- Vintage bar texture（复古酒吧材质）
- Cinematic depth（电影级景深）

---

# 3. 设计Tokens（核心）

## 3.1 Color System

```json
{
  "bg_primary": "#0E0B08",
  "bg_secondary": "#15110D",
  "wood": "#3B2A1F",
  "gold": "#C8A45D",
  "amber": "#D89C3A",
  "paper": "#E7D6B1",
  "ink": "#1A1612",
  "glass": "rgba(255,255,255,0.08)"
}
```

---

## 3.2 Typography

| Type | Font | Usage |
|------|------|------|
| Title | Cinzel | 模式标题 |
| Body | Cormorant Garamond | 说明文本 |
| Chinese | Songti SC | 中文正文 |
| UI Label | Inter | 功能UI |

---

## 3.3 Spacing System（8pt）

```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96
```

---

## 3.4 Radius System

```
sm: 6px
md: 12px
lg: 20px
xl: 28px
```

---

# 4. 栅格系统（Grid System）

## 4.1 竖屏（Mobile）

- 4 columns
- margin: 16px
- gutter: 12px

## 4.2 横屏（Tablet）

- 12 columns
- margin: 32px
- gutter: 16px

---

# 5. 核心组件系统（Component Library）

---

## 5.1 Glass Component（酒杯）

### 类型

- Glencairn
- Rocks Glass
- Martini Glass

### Props

```ts
glassType
fillLevel
liquidColor
iceType
reflectionIntensity
```

---

## 5.2 Liquid Component（液体）

### 状态

- still
- pouring
- swirling
- chilled

### 动效规则

- Canvas fluid simulation
- gradient based on spirit type

---

## 5.3 Ice Component（冰块）

### 类型

- sphere
- cube
- crushed

### 状态

- solid
- melting
- cracking

---

## 5.4 Bottle Component（酒瓶）

### Props

- labelTexture
- fillLevel
- tiltAngle
- pourState

---

## 5.5 Card Component（酒卡）

### 用途

- Recipe card
- Journal card
- AI output card

### Layout

```
image
title
subtitle
body
actions
```

---

## 5.6 Mode Selector（模式选择）

- Pure Pour
- Mixology
- Mood Pour
- Zen Atelier

---

# 6. 页面级设计（Screen System）

---

## 6.1 Home Screen

结构：

Sidebar + Mode Cards + Ambient background

状态：

- idle
- hover glow
- selected expand

---

## 6.2 Pure Pour Screen

布局：

```
[Glass Center Canvas]
[Spirit Selector Left]
[Ice Selector Bottom]
[AI Panel Right]
```

---

## 6.3 Mixology Screen

布局：

```
Bottle Shelf (top)
Glass (center)
Measure UI (right)
Recipe book (right panel)
```

---

## 6.4 Mood Pour Screen

结构：

- Text input (old paper style)
- Voice input mic (retro metal)
- AI response unfolding parchment

---

## 6.5 Zen Atelier Screen

结构：

- Free canvas
- Ingredient nodes
- Flow connections
- AI analysis panel

---

# 7. 动效系统（Motion System）

## 7.1 Liquid Physics

- Bezier flow pour
- viscosity variation per alcohol type

---

## 7.2 UI Transition

- fade + blur + paper flip
- camera zoom-in bar style

---

## 7.3 Interaction Feedback

- glass vibration
- ice crack sound sync
- foam shimmer

---

# 8. 组件命名规范（Figma重要）

```
/Component/
  Glass/
  Liquid/
  Ice/
  Bottle/
  Card/

/Screen/
  Home/
  PurePour/
  Mixology/
  Mood/
  Zen/

/Token/
  Color/
  Typography/
  Spacing/
```

---

# 9. AI设计绑定规范（关键）

所有组件必须支持：

## 9.1 JSON驱动UI

```json
{
  "screen": "pure_pour",
  "components": [
    { "type": "glass", "glassType": "glencairn" },
    { "type": "liquid", "color": "amber" },
    { "type": "ice", "type": "sphere" }
  ]
}
```

---

## 9.2 状态机绑定

```
UI = f(state, AI_output)
```

---

# 10. 设计系统总结

> 这是一个为AI时代设计的UI系统：

- UI不是画出来的，而是“生成出来的”
- 组件不是设计的，而是“参数化的”
- 页面不是固定的，而是“状态机驱动的”

---

# 11. v1目标

- 可直接转Figma组件库
- 可直接生成React代码
- 可直接作为AI UI schema
