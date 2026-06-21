# 🎨 微醺时刻 · The Sip & Sigh — 美术资源说明 (Asset Guide)

> 目标：**「UI 不是画出来的，而是生成出来的」**。当前**全部界面图形都已用参数化 SVG /
> Canvas 在代码中绘制完成，零外部图片即可完整运行**。
>
> 本文件是一份**完整的视觉清单 + 逐项绘制规格**，方便你为每一个元素手绘 / AI 绘制替换图。
> 分三部分：
> 1. **全量视觉清单** —— 应用里出现的每一类图形、数量、实现文件。
> 2. **逐项绘制规格** —— 每个元素的坐标系、尺寸、配色、风格要点（手绘时照此还原）。
> 3. **可选写实升级资源** —— SVG 难以表达、建议外部生成的部分，含文件名 / 尺寸 / 提示词。

**统一艺术方向（所有图共用）**
> 复古英伦鸡尾酒吧 · 暖琥珀烛光 · 手绘写实（油画质感）· 深桃花心木 · 黄铜与做旧玻璃高光 ·
> 电影级景深 · 明暗对照（chiaroscuro）· 无文字 · 无水印。
> 英文关键词：*warm amber candlelight, vintage British cocktail bar, hand-painted realism,
> dark mahogany wood, brass & aged-glass highlights, cinematic depth of field, oil-painting
> texture, moody chiaroscuro, no text, no watermark.*

调色 Token（务必沿用）见 `src/lib/tokens.ts` 与 `tailwind.config.ts`：
底色 `#0E0B08 / #15110D / #1B150F`，金 `#C8A45D / #E3C684`，琥珀 `#D89C3A / #F0B14B`，
纸 `#E7D6B1`，墨 `#1A1612`，铜 `#9C5A33`。

---

## 一、全量视觉清单（应用当前绘制的全部图形）

| 资源 | 数量 | 实现方式 | 文件 |
|------|------|----------|------|
| 品牌徽标 Logo | 1 | SVG 黄铜徽章 | `src/components/art/Logo.tsx`，favicon `src/app/icon.svg` |
| **酒杯 Glassware** | **36 杯型 / 4 类** | 参数化 SVG（`[y,半宽]` 轮廓 + Catmull-Rom） | `src/components/art/Glass.tsx` + `src/lib/data/glasses.ts` |
| **酒液 Liquid** | **32 色系** | SVG 多档渐变 + 折射 + 液面 | `Glass.tsx`，色系 `src/lib/tokens.ts` |
| **冰 Ice** | 3（冰球 / 方冰 / 碎冰） | 参数化 SVG 折射冰 + 吃水线 | `src/components/art/Ice.tsx` |
| **气泡 Carbonation** | 自动（含气酒款） | 上升白色气泡 + CSS 动效 | `Glass.tsx` |
| **杯中装饰 Garnishes** | **27 种** | SVG，分前后层「真实置于杯中/杯沿」 | `src/components/art/Garnish.tsx` + `src/lib/data/garnish.ts` |
| 酒瓶 Bottles | 4 瓶型 + 纸标签 | 参数化 SVG | `src/components/art/Bottle.tsx` |
| 模式徽章 Mode Emblems | 4（纯饮/酒谱/心事/魔法） | SVG 线描 | `src/components/art/ModeEmblem.tsx` |
| UI 图标 Icons | ~24 枚 | SVG 线描 | `src/components/art/icons.tsx` |
| 场景背景 Scenes | 7 套 | 分层 SVG 景观（按酒类家族） | `src/components/art/SceneBackdrop.tsx` |
| 材质 Textures | 木纹/纸张/琥珀光/胶片颗粒 | CSS + 内联 SVG 噪声 | `src/app/globals.css` |
| 分享酒卡 Share Card | 1 版式 | **Canvas → PNG**（烘焙中文字体） | `src/lib/share.ts` |
| 中文显示字体 | 1 | 自托管 WOFF2「猫啃网风雅宋」 | `public/fonts/maoken-fengyasong.woff2` |

数据规模（供参考）：酒库 **218** 款、配方 **214** 款、风味原料 **237** 种、杯型 **36**。

---

## 二、逐项绘制规格

### 2.0 通用坐标系（重要）
酒杯、冰、装饰都画在一个**宽 200 单位的虚拟画布**里（水平中心 `CX=100`，y 向下增大）。
杯型由一串**竖直轮廓点 `[y, 半宽]`**（杯口→杯底）经 Catmull-Rom 平滑成侧影；杯口是一段
**敞开的椭圆后沿弧**（不是一条直横线）。你手绘替换时按相同比例还原侧影即可无缝替换。

### 2.1 Logo / 品牌徽标
- 黄铜圆形徽章，内含一滴发光琥珀酒液 + 一只酒杯轮廓；浮雕金、深桃花心木底。
- 用途：侧边栏 / 顶栏品牌位、favicon、PWA 图标。
- 尺寸：矢量；位图导出 512×512（见 §3.4）。

### 2.2 酒杯 Glassware（36 杯型 · 4 类）
**渲染特征（写实替换需匹配）**：敞口椭圆杯口（无横线）；**双层蚀刻描边**（暖底
`#6e5a38` + 奶油边 `#EFE2BE`）；**左上柔和窗光反射** + **竖向高光条**（柔晕+亮芯）；
杯底暖色焦散；轻微**手绘墨迹抖动**；细微动效（高光呼吸/液面微闪）。空杯透明、玻璃质感。

需要绘制的 36 杯（按类）——**画法：每个杯型一张空杯、透明背景、正面微俯视**：
- **平底杯 Tumblers（10）**：古典杯 Rocks、双份古典杯 Double Rocks、高球杯 Highball、
  柯林斯杯 Collins、子弹杯 Shot、水桶杯 Bucket、茱莉普杯 Julep Cup、僵尸杯 Zombie、
  皮尔森杯 Pilsner、品脱杯 Pint。
- **高脚杯 Stemware（18）**：马天尼杯 Martini、碟形香槟杯 Coupe、尼克诺拉杯 Nick & Nora、
  鸡尾酒杯 Cocktail、玛格丽特杯 Margarita、白兰地杯 Snifter、酸酒杯 Sour、飓风杯 Hurricane、
  波可格兰德杯 Poco Grande、香槟笛杯 Champagne Flute、红/白葡萄酒杯 Red/White Wine、
  勃艮第杯 Burgundy、波尔多杯 Bordeaux、波特杯 Port、雪莉杯 Sherry、高脚酒杯 Goblet、
  利口杯 Cordial。
- **闻香杯 Nosing（4）**：格兰凯恩杯 Glencairn、NEAT 杯、郁金香闻香杯 Tulip、雪莉闻香杯 Copita。
- **特色杯 Specialty（4）**：提基马克杯 Tiki Mug、铜马克杯 Copper Mug、爱尔兰咖啡杯 Irish
  Coffee、苦艾酒杯 Absinthe。

> 完整轮廓数值见 `GLASS_SPECS`（`src/lib/data/glasses.ts`）。每杯都有 `note` 描述用途。

### 2.3 酒液 Liquid（32 色系）
- 每个色系是 `[高光, 主体, 暗部]` 三色（`liquidRamp`），渲成 5 档竖向渐变 + 折射光柱 +
  杯底焦散光池 + **液面弯月盘 + 亮皮线**。
- **颜色由配料推断**（`inferLiquidFamily`）：基酒家族（威士忌琥珀 / 金酒清透 / 朗姆 / 龙舌兰…）
  外，还有**按调料决定的酒色**：可乐冰茶棕、咖啡、白俄奶咖、橙汁、龙舌兰日出、菠萝、椰林、
  蔓越莓、石榴红、莓果、蓝橙、薄荷绿、番茄、桃/西柚、香槟金、雪莉、可可棕等。
- 手绘时：按「上亮下暗、左上受光、液面一圈弯月高光」绘制；颜色取对应色系三色。

### 2.4 冰 Ice（3 种 · 清透折射）
- **冰球（大冰球）**：近乎填满杯宽的清冰球；中心一小簇高光、底缘全内反射亮边、一道偏置折射焦散、
  少量小气泡；**吃水线**——没入酒中的下半被酒色染深 + 一圈弯月环。
- **大方冰**：等距立方体、融化圆角、三透明面 + 内部折射裂面 + 受光亮棱；同样有吃水线。
- **碎冰**：约 10 块角度各异的碎晶 + 底部霜雾垫。
- 物理：按杯内壁宽度定大小，浅酒搁底、深酒约 90% 浮沉。透明背景、清冰质感。

### 2.5 气泡 Carbonation
- 含气酒款（香槟/起泡酒/苏打/汤力/可乐/姜啤…）液体里有一串**上升白色气泡**，到液面破裂。
- 手绘动效版可做循环上浮；静态版画成悬浮气泡群。

### 2.6 杯中装饰 Garnishes（27 种）— ⭐ 重点新系统
每个可呈现的配料在成品杯中有**独立装饰**，按物理分两层绘制：
- **杯中漂浮层（back）**：果片/浆果/樱桃/咖啡豆/泡沫/撒粉等——**裁剪在杯腔内、画在杯前壁之前**，
  且**下半被酒色染深（浸没）、底部一抹接触阴影、破水处一道弯月高光**；杯壁窗光会扫过它们。
- **杯沿/出杯层（front）**：盐/糖杯沿结晶、薄荷枝/迷迭香/肉桂棒等高枝——斜插杯口、根部落一道阴影。

**27 种装饰（各画一张小图，透明背景）**：
柑橘轮 citrusWheel（柠檬/青柠/橙/血橙/葡萄柚分色）、柑橘皮卷 citrusTwist、浆果 berry、
带梗樱桃 cherry、果楔 fruitSlice、薄荷枝 mintSprig、针叶香草枝 herbSprig（迷迭香/百里香）、
单叶 leaf（罗勒/紫苏/鼠尾草）、薰衣草穗 lavender、花朵 flower（玫瑰/茉莉/桂花）、
肉桂棒 cinnamonStick、丁香 clove、八角 starAnise、籽粒 seeds（胡椒/豆蔻/芝麻）、
姜片 gingerSlice、辣椒 chili、香草荚 vanillaPod、咖啡豆 coffeeBeans、撒粉 dusting（可可/抹茶/肉豆蔻）、
橄榄 olive、腌洋葱 onion、金箔 goldLeaf、黄瓜片 cucumberSlice、盐边 saltRim、糖边 sugarRim、
泡沫层 foam（蛋白/奶油）、苦精滴 drops。
> 配料→装饰映射与配色见 `src/lib/data/garnish.ts`（`garnishFor` / 27 种 `GarnishKind`）。
> 基酒/利口酒/糖浆/软饮等**液体**不长固体装饰，靠酒色与气泡区分。
> **纯饮**会按基酒自动配一味芳香点缀（威士忌→橙皮、泥煤/金酒→柠檬皮卷、朗姆/龙舌兰→青柠角、奶油系→肉豆蔻）。

### 2.7 酒瓶 Bottles
- 4 种参数化瓶型 + 做旧纸标签；用于酒库 / 纯饮选酒。
- 可选写实化 218 款真实酒瓶见 §3.2。

### 2.8 模式徽章 Mode Emblems（4，**已改名**）
线描小徽章，分别代表四个模式（画成同一线描风格的小图标/纹章）：
| id | 中文 | 英文 | 意象建议 |
|----|------|------|----------|
| pure | **纯饮** | The Pure Pour | 一只闻香杯 / 一滴纯酒落入 |
| mixology | **酒谱** | The Liquid Codex | 翻开的古籍/卷轴 + 调酒匙 |
| mood | **心事** | Whisper of Mood | 心形/涟漪 + 升起的香氛 |
| zen | **魔法** | The Alchemy Atelier | 炼金烧瓶 / 星与液滴 |

### 2.9 UI 图标 Icons（~24 枚）
统一**线描风格**（1.5–2px 描边、金色 `#C8A45D`、圆角）：返回、关闭、搜索、设置、声音开/关、
奖杯、日记、酒库、锁、分享、收藏、搅拌、加号等。透明背景、24×24 网格。

### 2.10 场景背景 Scenes（7 套）
分层 SVG 景观，按酒类家族切换，用于 结果页 / 首页 Hero / 日记卡背景。详见 §3.1（含尺寸与提示词）：
coast 高地海岸、highland 壁炉书房、garden 植物温室、desert 龙舌兰高原、snow 雪原黎明、
night 猩红霓虹夜、amber 琥珀吧台（默认）。

### 2.11 材质 Textures
木纹 wood-panel、纸张 paper-texture、琥珀光晕、胶片颗粒——现由 CSS + 内联 SVG 噪声生成
（`globals.css`）。如要替换为高清贴图：木纹 1024×1024 可平铺、纸纹 1024×1024 可平铺，PNG。

### 2.12 分享酒卡 Share Card（导出 PNG）
**Canvas 绘制 → PNG 导出**（把页面中文字体「风雅宋」烘焙进像素，便携可分享）。版式（自上而下、
画布高度随内容自适应）：品牌小字「微醺时刻 · THE SIP & SIGH」→ **真实杯型**（含冰/光影/气泡/装饰，
与页面一致）→ 中英酒名 → 「专属配方 · THE RECIPE」分隔 + 配料左名右量 → 杯型·冰 → 「微醺絮语 ·
THE STORY」+ 故事 → 落款笔名 → 底部「SAVOUR THE MOMENT · 微醺时刻」。深底 + 双金线框。
> 若要套用插画风酒卡模板，导出尺寸建议 720×(自适应)，2× 渲染。

### 2.13 中文显示字体
自托管「**猫啃网风雅宋**」WOFF2（`public/fonts/maoken-fengyasong.woff2`，`@font-face` 见
`globals.css`，Tailwind `font-cn`）。如换字体只需替换该文件与 `font-family` 名。

---

## 三、可选写实升级资源（建议外部生成）🖌️

下列资源若提供，会把画面从「精致矢量」升级为「概念图级油画写实」。**全部可选**，缺图时代码有等价
SVG 兜底。放置目录统一 `public/art/`。

### 3.1 模式场景大图（核心，7 张）
| 文件名 | 家族 / 场景 | 尺寸 | 格式 |
|--------|-------------|------|------|
| `scene-coast.webp` | 泥煤威士忌 · 孤独高地海岸 | 1600×1000 | WebP/JPG |
| `scene-highland.webp` | 威士忌/白兰地 · 暖色壁炉书房 | 1600×1000 | WebP/JPG |
| `scene-garden.webp` | 金酒/苦艾 · 晨雾植物温室 | 1600×1000 | WebP/JPG |
| `scene-desert.webp` | 龙舌兰/朗姆 · 烈日龙舌兰高原 | 1600×1000 | WebP/JPG |
| `scene-snow.webp` | 伏特加 · 雪原黎明 | 1600×1000 | WebP/JPG |
| `scene-night.webp` | 金巴利/红酒 · 猩红霓虹夜 | 1600×1000 | WebP/JPG |
| `scene-amber.webp` | 默认 · 琥珀微光吧台 | 1600×1000 | WebP/JPG |

提示词：
- **coast**：`A lonely Scottish highland sea coast at dusk, dark cliffs, cold grey-blue sea with foam, a faint lighthouse beam, mist over rocks, warm amber glow on the horizon, painterly, cinematic oil-painting realism — 16:10`
- **highland**：`Cozy vintage study with a crackling fireplace, mahogany bookshelves, golden amber firelight, soft smoke, deep warm shadows, painterly — 16:10`
- **garden**：`A misty botanical greenhouse at dawn, juniper and citrus branches, dew, soft green light through old glass panes, fresh and luminous — 16:10`
- **desert**：`A sunlit agave plateau under a blazing sky, silver-green agave fields, distant cactus, dry warm haze, golden hour, painterly — 16:10`
- **snow**：`A silent snowfield at first light, birch trees, frost, pale blue-white with a faint warm sun, minimal, serene, painterly — 16:10`
- **night**：`A crimson neon city plaza at night, rain-slick stone, glowing red and amber reflections, intimate and a little dangerous, painterly — 16:10`
- **amber**：`A close-up vintage bar counter in warm amber candlelight, brass, aged glass, bokeh bottles behind, cinematic, painterly — 16:10`

### 3.2 写实酒瓶（可选，最多 218 支）
- 文件：`public/art/bottle-<spiritId>.webp`（id 见 `src/lib/data/spirits.ts`，形如 `cat-i`）。
- 尺寸 **600×1400**，**透明背景**，瓶身居中、无落地倒影。
- 提示词：`A single <spirit name> bottle, studio product shot, transparent background, warm rim light, aged paper label, photorealistic, centered`。

### 3.3 写实酒杯（可选）
- 文件：`public/art/glass-<glassId>.webp`（id 见 `glasses.ts`，如 `rocks/martini/coupe/highball/glencairn`…）。
- 尺寸 **800×1100**，**透明背景**、空杯。
- 提示词：`An empty <glass type> glass, studio shot, transparent background, soft amber key light, crisp glass refraction, photorealistic`。
- 进阶：若要写实冰/装饰图层，可单独出 `ice-sphere/cube/crushed`、`garnish-<kind>` 透明 PNG，叠在液面上。

### 3.4 应用图标 / 社交分享图（建议提供）
| 文件 | 用途 | 尺寸 |
|------|------|------|
| `public/favicon.ico` | 浏览器标签 | 32 / 48 |
| `public/icon.png` | PWA / 书签 | 512×512 |
| `public/apple-icon.png` | iOS 主屏 | 180×180 |
| `public/og-image.png` | 链接分享预览 | 1200×630 |

提示词：`The Sip & Sigh app icon — a brass medallion enclosing a glowing amber liquid drop and a cocktail glass, dark mahogany background, embossed gold, luxury, minimal — square`。

### 3.5 动效素材（可选 · Lottie/视频）
核心动效已用 Framer Motion + CSS + rAF 实现（倒酒/霜化/扩散/气泡）。如要更进一步：
- `public/lottie/pour.json` 琥珀倒酒流体（循环、透明底）
- `public/lottie/ice-crack.json` 冰裂一次性
- `public/lottie/foam-shimmer.json` 泡沫微光循环

---

## 四、如何接入外部图片

以「场景大图」为例，替换 `SceneBackdrop` 使用处（结果页 / 首页 / 日记卡）：

```tsx
// 之前（矢量兜底）
<SceneBackdrop family={result.family} className="h-full w-full" />

// 之后（写实图优先 + 矢量兜底）
import Image from "next/image";
const SCENE_SRC: Record<string, string> = {
  coast: "/art/scene-coast.webp", highland: "/art/scene-highland.webp",
  // …其余家族映射见 SceneBackdrop.tsx 的 SCENE_BY_FAMILY
};
<Image src={SCENE_SRC[sceneKey]} alt="" fill className="object-cover" />
```

- **酒瓶 / 酒杯**：在对应组件里「图片优先、SVG 兜底」——`public/art/bottle-<id>.webp` 存在则用图，否则
  渲染 `Bottle.tsx` / `Glass.tsx`。
- **装饰 / 冰**：如改用透明 PNG 图层，叠在液面对应位置即可（位置参数见 `Garnish.tsx` / `Ice.tsx`）。
- 建议始终保留参数化 SVG 作为缺图兜底，做到「**有图更美、无图也完整**」。

> 真正的 LLM 文案（替换离线诗人）只需后端按 `CocktailResult` JSON 契约返回（见
> `src/types/index.ts`），或设 `NEXT_PUBLIC_AI_ENDPOINT`，无需改任何界面。
