# 🎨 微醺时刻 · 美术资源说明 (Asset Guide)

本项目的目标之一是 **“UI 不是画出来的，而是生成出来的”**。因此，
**几乎全部 UI 图形都已用参数化 SVG / CSS 在代码中绘制完成，无需任何外部图片即可完整运行。**

本文件分两部分：

1. **已内置绘制的资源** —— 你不需要再提供任何东西，开箱即用。
2. **可选的「写实手绘」升级资源** —— 如果你希望达到概念图那种「油画级写实复古酒吧」质感，
   这些是 SVG 无法完美表达、建议用 AI 绘画 / 摄影替换的部分。每一项都给出
   **用途、文件名、尺寸、格式、详细中英文提示词**。

---

## 一、已内置绘制（零外部依赖）✅

| 资源 | 实现方式 | 文件 |
|------|----------|------|
| Logo 徽标 | SVG | `src/components/art/Logo.tsx` |
| 酒杯（格兰凯恩/古典/马天尼/高球/碟形） | 参数化 SVG + 折射液体 | `src/components/art/Glass.tsx`, `glassGeometry.ts` |
| 液体 / 倒酒流 | SVG 渐变 + CSS | `Glass.tsx`, `globals.css` |
| 冰（大冰球/方冰/碎冰） | 参数化 SVG | `src/components/art/Ice.tsx` |
| 酒瓶（4 种瓶型 + 纸标签） | 参数化 SVG | `src/components/art/Bottle.tsx` |
| 模式徽章（纯饮/调酒/微醺/禅意） | SVG 线描 | `src/components/art/ModeEmblem.tsx` |
| 全套 UI 图标（24 枚） | SVG 线描 | `src/components/art/icons.tsx` |
| 场景背景（高地海岸/花园/雪原/沙漠/夜色…7 套） | 分层 SVG 景观 | `src/components/art/SceneBackdrop.tsx` |
| 木纹 / 纸张 / 琥珀光 / 胶片颗粒 材质 | CSS + 内联 SVG 噪声 | `globals.css` |
| 分享酒卡导出图 | 运行时生成 SVG → 下载 | `src/lib/share.ts` |

> 颜色、字号等全部来自设计 Token（`tailwind.config.ts` / `src/lib/tokens.ts`），
> 与设计系统文档 §3 完全一致。

---

## 二、可选写实升级资源（建议外部生成）🖌️

下列资源若提供，会让画面从「精致矢量」升级为「概念图级油画写实」。
**全部为可选项**；不提供时，代码已有等价的 SVG 回退，界面依旧完整美观。

放置目录统一为 `public/art/`。多数为「替换 `SceneBackdrop` 组件渲染结果」即可生效
（见文末「如何接入」）。

通用风格关键词（所有提示词共用，可追加）：
> *warm amber candlelight, vintage British cocktail bar, hand-painted realism,
> dark mahogany wood, brass and aged glass highlights, cinematic depth of field,
> oil-painting texture, moody chiaroscuro, no text, no watermark*

### 2.1 模式场景大图（核心，7 张）

用于 结果页 / 首页 Hero / 日记卡 背景。当前由 `SceneBackdrop` 按酒类家族生成。

| 文件名 | 对应家族 / 场景 | 尺寸 | 格式 |
|--------|----------------|------|------|
| `scene-coast.webp` | 泥煤威士忌 · 孤独高地海岸 | 1600×1000 | WebP/JPG |
| `scene-highland.webp` | 威士忌/白兰地 · 暖色壁炉书房 | 1600×1000 | WebP/JPG |
| `scene-garden.webp` | 金酒/苦艾 · 晨雾植物温室 | 1600×1000 | WebP/JPG |
| `scene-desert.webp` | 龙舌兰/朗姆 · 烈日龙舌兰高原 | 1600×1000 | WebP/JPG |
| `scene-snow.webp` | 伏特加 · 雪原黎明 | 1600×1000 | WebP/JPG |
| `scene-night.webp` | 金巴利/红酒 · 猩红霓虹夜 | 1600×1000 | WebP/JPG |
| `scene-amber.webp` | 默认 · 琥珀微光吧台 | 1600×1000 | WebP/JPG |

提示词示例：

- **scene-coast**：`A lonely Scottish highland sea coast at dusk, dark cliffs, cold
  grey-blue sea with foam, a faint lighthouse beam, mist over rocks, a warm amber
  glow on the horizon, painterly, cinematic, oil-painting realism — 16:10`
- **scene-highland**：`Cozy vintage study with a crackling fireplace, mahogany
  bookshelves, golden amber firelight, soft smoke, deep warm shadows, painterly — 16:10`
- **scene-garden**：`A misty botanical greenhouse at dawn, juniper and citrus
  branches, dew, soft green light through old glass panes, fresh and luminous — 16:10`
- **scene-desert**：`A sunlit agave plateau under a blazing sky, silver-green
  agave fields, distant cactus, dry warm haze, golden hour, painterly — 16:10`
- **scene-snow**：`A silent snowfield at first light, birch trees, frost, pale
  blue-white tones with a faint warm sun, minimal, serene, painterly — 16:10`
- **scene-night**：`A crimson neon city plaza at night, rain-slick stone, glowing
  red and amber reflections, intimate and a little dangerous, painterly — 16:10`
- **scene-amber**：`A close-up vintage bar counter bathed in warm amber candlelight,
  brass, aged glass, bokeh bottles in the background, cinematic, painterly — 16:10`

### 2.2 写实酒瓶（可选，12 支）

当前由 `Bottle.tsx` 矢量绘制。若要陈列真实酒款：

- 文件：`public/art/bottle-<spiritId>.webp`（spiritId 见 `src/lib/data/spirits.ts`，
  如 `bottle-talisk.10.webp`）
- 尺寸：**600×1400**，**透明背景 PNG/WebP**，瓶身居中
- 提示词：`A single <spirit name> bottle, studio product shot, transparent
  background, warm rim light, aged paper label, photorealistic, centered, no
  reflection floor`（把 `<spirit name>` 换成对应英文名）

### 2.3 写实酒杯（可选）

当前矢量绘制已足够。如需照片级：

- 文件：`public/art/glass-<type>.webp`（type: glencairn/rocks/martini/highball/coupe）
- 尺寸：**800×1100**，**透明背景**
- 提示词：`An empty <glass type> cocktail glass, studio shot, transparent
  background, soft amber key light, crisp glass refraction, photorealistic`

### 2.4 应用图标 / 社交分享图（建议提供）

| 文件 | 用途 | 尺寸 |
|------|------|------|
| `public/favicon.ico` | 浏览器标签 | 32×32, 48×48 |
| `public/icon.png` | PWA / 书签 | 512×512 |
| `public/apple-icon.png` | iOS 添加到主屏 | 180×180 |
| `public/og-image.png` | 链接分享预览 | 1200×630 |

提示词：`The Sip & Sigh app icon — a brass medallion enclosing a glowing amber
liquid drop and a cocktail glass, dark mahogany background, embossed gold, luxury,
minimal — square`

### 2.5 动效素材（可选 · Lottie/视频）

设计文档提到「Canvas 流体模拟 / 冰块裂纹 Shader / Lottie 辅助动画」。
本项目已用 Framer Motion + CSS + rAF 实现倒酒、霜化、扩散等核心动效；
若想更进一步：

- `public/lottie/pour.json` —— 琥珀色倒酒流体，循环，透明背景
- `public/lottie/ice-crack.json` —— 冰块裂纹一次性动画
- `public/lottie/foam-shimmer.json` —— 泡沫微光循环

提示词（用于 AI 生成 Lottie 的描述）：`amber liquid pouring stream, smooth bezier
flow, looping, transparent background, minimal, warm gold`

---

## 三、如何接入外部图片

以「场景大图」为例，替换 `SceneBackdrop` 的使用处即可（结果页 / 首页 / 日记卡）：

```tsx
// 之前（矢量回退）
<SceneBackdrop family={result.family} className="h-full w-full" />

// 之后（写实图，二选一或图片优先 + 矢量兜底）
import Image from "next/image";
const SCENE_SRC: Record<string, string> = {
  coast: "/art/scene-coast.webp",
  highland: "/art/scene-highland.webp",
  // …其余家族映射见 SceneBackdrop.tsx 的 SCENE_BY_FAMILY
};
<Image src={SCENE_SRC[sceneKey]} alt="" fill className="object-cover" />
```

> 建议保留 `SceneBackdrop` 作为图片加载失败 / 缺图时的兜底，做到「有图更美、无图也完整」。

真正的 LLM 文案（替换离线诗人）只需设置环境变量，无需改任何界面：

```bash
# .env.local
NEXT_PUBLIC_AI_ENDPOINT=https://your-fastapi-host
```

后端只要按 `CocktailResult` JSON 契约返回（见 `src/types/index.ts`），全站立即接入真实 AI。
