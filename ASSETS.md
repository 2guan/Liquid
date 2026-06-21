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
| **酒液 Liquid** | **218 款酒 + 214 配方**（32 色系调色板） | SVG 多档渐变 + 折射 + 液面 | `Glass.tsx`；酒款 `src/lib/data/spirits.ts`、配方 `recipes.ts`；色系 `tokens.ts` |
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

### 2.3 酒液 Liquid（逐一按酒款描述，而非泛色块）
酒液**不是 32 个通用色块** —— **每一款酒都有自己的品牌、酒名、产地、酒精度与风味**：
- **218 款酒库**（纯饮 / 调酒基酒）——逐瓶清单见**文末「附录 A · 218 款酒库总目录」**；数据源
  `src/lib/data/spirits.ts`。
- **214 款配方鸡尾酒**——每款有独立酒名 / 杯型 / 冰 / 配料 / 品鉴，数据源 `src/lib/data/recipes.ts`。
- 风味原料 237 种见 `src/lib/data/flavors.ts`。

每杯酒液的颜色由该酒款所属「**色系**」决定（`liquidRamp` 的一档 `[高光, 主体, 暗部]` 三色），
并由配料动态推断（`inferLiquidFamily`）。**绘制时请按对应酒款的真实色泽**（见附录每行末的 `色系`）。
- 渲染：5 档竖向渐变 + 折射光柱 + 杯底焦散光池 + **液面弯月盘 + 亮皮线**；上亮下暗、左上受光。
- **32 档色系调色板**：基酒家族（威士忌琥珀 / 金酒·伏特加清透 / 朗姆 / 龙舌兰 / 白兰地 / 味美思 /
  雪莉酒红 / 苦味红 campari / 奶霜 cream / 苦艾绿 absinthe…）+ 调料色（可乐冰茶棕、咖啡、白俄奶咖、
  橙汁、龙舌兰日出、菠萝黄、椰林、蔓越莓、石榴红、莓果、蓝橙、薄荷绿、番茄、桃/西柚、香槟金、可可棕…）。

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

---

## 附录 A · 218 款酒库总目录（逐瓶品牌与酒名）

> 数据源 `src/lib/data/spirits.ts`（9 大类）。格式：**中文名** / English — 产地 · ABV ·
> 色系（决定酒液颜色，见 §2.3）· 风味。绘制每支酒瓶 / 每杯纯饮酒液时按此逐项还原。

**威士忌 Whisky（29）**

- **麦卡伦 12 年雪莉桶** / Macallan 12 Sherry — 苏格兰·斯佩塞 · ABV 40% · 色系 `whisky` · 干果、生姜与橡木
- **格兰菲迪 12 年** / Glenfiddich 12 — 苏格兰·斯佩塞 · ABV 40% · 色系 `whisky` · 青苹果、梨与橡木
- **格兰利威 12 年** / Glenlivet 12 — 苏格兰·斯佩塞 · ABV 40% · 色系 `whisky` · 花香、菠萝与香草
- **泰斯卡 10 年** / Talisker 10 — 苏格兰·斯凯岛 · ABV 45.8% · 色系 `whiskyPeat` · 海盐、黑胡椒与篝火烟熏
- **拉弗格 10 年** / Laphroaig 10 — 苏格兰·艾雷岛 · ABV 40% · 色系 `whiskyPeat` · 强烈泥煤、碘酒与海藻
- **阿德贝哥 10 年** / Ardbeg 10 — 苏格兰·艾雷岛 · ABV 46% · 色系 `whiskyPeat` · 烟熏、柑橘与黑巧克力
- **拉加维林 16 年** / Lagavulin 16 — 苏格兰·艾雷岛 · ABV 43% · 色系 `whiskyPeat` · 深沉泥煤、雪莉与海风
- **波摩 12 年** / Bowmore 12 — 苏格兰·艾雷岛 · ABV 40% · 色系 `whiskyPeat` · 温和泥煤、蜂蜜与柠檬
- **高原骑士 12 年** / Highland Park 12 — 苏格兰·奥克尼 · ABV 40% · 色系 `whisky` · 石楠蜜、轻烟与柑橘
- **格兰杰经典** / Glenmorangie Original — 苏格兰·高地 · ABV 40% · 色系 `whisky` · 柑橘、桃子与香草
- **大摩 12 年** / Dalmore 12 — 苏格兰·高地 · ABV 40% · 色系 `whisky` · 橙皮、巧克力与雪莉
- **云顶 10 年** / Springbank 10 — 苏格兰·坎贝尔镇 · ABV 46% · 色系 `whisky` · 海盐、果干与一缕烟
- **尊尼获加黑牌** / Johnnie Walker Black — 苏格兰·调和 · ABV 40% · 色系 `whisky` · 烟熏、果干与香料
- **芝华士 12 年** / Chivas Regal 12 — 苏格兰·调和 · ABV 40% · 色系 `whisky` · 蜂蜜、苹果与香草
- **百龄坛特醇** / Ballantine's Finest — 苏格兰·调和 · ABV 40% · 色系 `whisky` · 圆润、青苹果与香草
- **美格波本** / Maker's Mark — 美国·肯塔基 · ABV 45% · 色系 `whisky` · 焦糖、小麦与香草
- **布雷特波本** / Bulleit Bourbon — 美国·肯塔基 · ABV 45% · 色系 `whisky` · 高黑麦比例、辛香与橡木
- **四玫瑰** / Four Roses — 美国·肯塔基 · ABV 40% · 色系 `whisky` · 花香、梨与轻盈辛香
- **伍德福德珍藏** / Woodford Reserve — 美国·肯塔基 · ABV 45.2% · 色系 `whisky` · 干果、可可与香料
- **野火鸡 101** / Wild Turkey 101 — 美国·肯塔基 · ABV 50.5% · 色系 `whisky` · 高强度、焦糖与黑胡椒
- **瑞顿房黑麦** / Rittenhouse Rye — 美国·黑麦 · ABV 50% · 色系 `whisky` · 辛辣黑麦、肉桂与橡木
- **杰克丹尼** / Jack Daniel's — 美国·田纳西 · ABV 40% · 色系 `whisky` · 枫糖、香蕉与炭滤甜香
- **尊美醇** / Jameson — 爱尔兰·调和 · ABV 40% · 色系 `whisky` · 顺滑、青苹果与奶油
- **红馥三桶** / Redbreast 12 — 爱尔兰·单一壶式 · ABV 40% · 色系 `whisky` · 丰润果干、雪莉与香料
- **山崎 12 年** / Yamazaki 12 — 日本·山崎 · ABV 43% · 色系 `whisky` · 蜜桃、柿子与一缕熏香
- **白州 12 年** / Hakushu 12 — 日本·白州 · ABV 43% · 色系 `whisky` · 青草、青苹果与轻烟
- **响·和风韵律** / Hibiki Harmony — 日本·调和 · ABV 43% · 色系 `whisky` · 蜂蜜、橘皮与檀香
- **知多** / Chita — 日本·谷物 · ABV 43% · 色系 `whisky` · 清淡、蜂蜜与橡木
- **噶玛兰经典独奏** / Kavalan Solist — 中国台湾·宜兰 · ABV 58% · 色系 `whisky` · 热带水果、椰子与雪莉

**金酒 Gin（26）**

- **哥顿金酒** / Gordon's — 英国·伦敦 · ABV 37.5% · 色系 `gin` · 经典杜松、柑橘与芫荽
- **必富达 24** / Beefeater 24 — 英国·伦敦 · ABV 45% · 色系 `gin` · 煎茶、柚子与杜松
- **添加利** / Tanqueray — 英国·伦敦 · ABV 43.1% · 色系 `gin` · 干冽杜松、四味草本
- **添加利 No.TEN** / Tanqueray No.TEN — 英国·伦敦 · ABV 47.3% · 色系 `gin` · 鲜柑橘、洋甘菊与杜松
- **孟买蓝宝石** / Bombay Sapphire — 英国·伦敦 · ABV 47% · 色系 `gin` · 十味植物、轻盈花香
- **亨利爵士** / Hendrick's — 苏格兰 · ABV 41.4% · 色系 `gin` · 黄瓜与玫瑰的优雅
- **纪凡花园** / G'Vine Floraison — 法国 · ABV 40% · 色系 `gin` · 葡萄花、生姜与杜松
- **蒙基 47** / Monkey 47 — 德国·黑森林 · ABV 47% · 色系 `gin` · 47 味植物、越橘与云杉
- **纪念碑谷** / The Botanist — 苏格兰·艾雷岛 · ABV 46% · 色系 `gin` · 22 味手摘草本
- **希普史密斯** / Sipsmith — 英国·伦敦 · ABV 41.6% · 色系 `gin` · 传统铜壶、柑橘与杜松
- **六·季之味** / Roku Gin — 日本·大阪 · ABV 43% · 色系 `gin` · 樱花、玉露与柚子
- **季之美** / Ki No Bi — 日本·京都 · ABV 45.7% · 色系 `gin` · 柚子、玉露与山椒
- **普利茅斯** / Plymouth — 英国·普利茅斯 · ABV 41.2% · 色系 `gin` · 柔和、根茎与柑橘
- **瑞典之手** / Hernö — 瑞典 · ABV 40.5% · 色系 `gin` · 牧草、香草与杜松
- **布鲁克林金酒** / Greenhook Ginsmiths — 美国·纽约 · ABV 47% · 色系 `gin` · 洋甘菊、接骨木与杜松
- **海曼老汤姆** / Hayman's Old Tom — 英国·伦敦 · ABV 41.4% · 色系 `gin` · 微甜老汤姆风格、杜松与柑橘
- **奇异鸟** / Four Pillars Rare Dry — 澳大利亚 · ABV 41.8% · 色系 `gin` · 本土胡椒、橙与杜松
- **纪凡珍珠** / G'Vine Nouaison — 法国 · ABV 43.9% · 色系 `gin` · 葡萄、肉豆蔻与杜松
- **黑刺李金酒** / Sloe Gin — 英国 · ABV 26% · 色系 `wine` · 黑刺李浸渍、杏仁与酸甜
- **马丁米勒** / Martin Miller's — 英国/冰岛 · ABV 40% · 色系 `gin` · 冰岛泉水、黄瓜与柑橘
- **伦敦一号** / The London No.1 — 西班牙 · ABV 47% · 色系 `gin` · 佛手柑、当归与蓝色
- **纪龙德** / Citadelle — 法国 · ABV 44% · 色系 `gin` · 19 味植物、香料与紫罗兰
- **威廉切斯** / Chase GB — 英国 · ABV 40% · 色系 `gin` · 苹果基酒、啤酒花与生姜
- **塔崔** / Tarquin's — 英国·康沃尔 · ABV 42% · 色系 `gin` · 紫罗兰、橙花与杜松
- **纪伊** / Ki No Tea — 日本·京都 · ABV 45.1% · 色系 `gin` · 玉露与抹茶的茶感金酒
- **奥普尔** / Opihr — 英国 · ABV 40% · 色系 `gin` · 东方香料、孜然与橙

**朗姆酒 Rum（25）**

- **百加得白朗姆** / Bacardi Carta Blanca — 波多黎各 · ABV 37.5% · 色系 `rum` · 清爽、香草与杏仁
- **哈瓦那俱乐部 3 年** / Havana Club 3 — 古巴 · ABV 40% · 色系 `rum` · 甘蔗、香草与轻盈
- **摩根船长** / Captain Morgan — 牙买加 · ABV 35% · 色系 `rum` · 香料、香草与焦糖
- **外交官典藏** / Diplomático Reserva — 委内瑞拉 · ABV 40% · 色系 `rum` · 太妃糖、橙皮与可可
- **萨凯帕 23** / Ron Zacapa 23 — 危地马拉 · ABV 40% · 色系 `rum` · 蜂蜜、太妃与橡木
- **阿普尔顿庄园 12 年** / Appleton Estate 12 — 牙买加 · ABV 43% · 色系 `rum` · 橙皮、可可与橡木酯香
- **美雅士黑朗姆** / Myers's Dark — 牙买加 · ABV 40% · 色系 `rum` · 糖蜜、咖啡与焦糖
- **古巴朗姆 7 年** / Havana Club 7 — 古巴 · ABV 40% · 色系 `rum` · 可可、烟草与香草
- **普雷森 12 年** / Plantation XO 20th — 巴巴多斯 · ABV 40% · 色系 `rum` · 香草、可可与橙
- **飞行荷兰人** / Flor de Caña 12 — 尼加拉瓜 · ABV 40% · 色系 `rum` · 香草、坚果与橡木
- **登赫普诺斯** / El Dorado 15 — 圭亚那 · ABV 40% · 色系 `rum` · 浓郁糖蜜、太妃与香料
- **朗姆酒之火** / Wray & Nephew — 牙买加 · ABV 63% · 色系 `rum` · 高强度白朗姆、酯香浓烈
- **圣詹姆斯农业** / Rhum St James — 马提尼克 · ABV 40% · 色系 `rum` · 甘蔗汁、青草与矿物
- **克莱蒙农业** / Clément VSOP — 马提尼克 · ABV 40% · 色系 `rum` · 香蕉、香草与橡木
- **普赛尔海军** / Pusser's Navy — 英属维京 · ABV 40% · 色系 `rum` · 浓郁糖蜜、太妃与海军风
- **巴邦库农业** / Damoiseau — 瓜德罗普 · ABV 40% · 色系 `rum` · 热带果、甘蔗与香料
- **古铜十年** / Mount Gay XO — 巴巴多斯 · ABV 43% · 色系 `rum` · 香蕉、杏仁与橡木
- **巴西卡莎萨** / Leblon Cachaça — 巴西 · ABV 40% · 色系 `rum` · 新鲜甘蔗汁、青草
- **椰子朗姆** / Malibu — 加勒比 · ABV 21% · 色系 `rum` · 椰子奶香、甜美
- **金酒桶陈** / Goslings Black Seal — 百慕大 · ABV 40% · 色系 `rum` · 黑朗姆、焦糖与香料
- **夜店白** / Brugal Añejo — 多米尼加 · ABV 38% · 色系 `rum` · 干爽、橡木与香草
- **甘蔗之心** / Dictador 12 — 哥伦比亚 · ABV 40% · 色系 `rum` · 咖啡、可可与橡木
- **农业陈酿** / Neisson Réserve — 马提尼克 · ABV 42% · 色系 `rum` · 甘蔗、香料与可可
- **特立尼达** / Angostura 1919 — 特立尼达 · ABV 40% · 色系 `rum` · 太妃、烟熏与橡木
- **海盗船长金** / Kraken — 加勒比 · ABV 40% · 色系 `rum` · 黑朗姆、香料与焦糖

**龙舌兰 Agave（22）**

- **豪帅银快活** / Jose Cuervo Silver — 墨西哥·哈利斯科 · ABV 38% · 色系 `tequila` · 青草、柑橘与胡椒
- **懒虫银** / Camino Real — 墨西哥 · ABV 35% · 色系 `tequila` · 轻盈、柑橘与龙舌兰
- **唐胡里奥珍藏** / Don Julio Blanco — 墨西哥·哈利斯科 · ABV 38% · 色系 `tequila` · 柑橘、龙舌兰与一缕黑胡椒
- **培恩银** / Patrón Silver — 墨西哥·哈利斯科 · ABV 40% · 色系 `tequila` · 柑橘、龙舌兰与微甜
- **培恩陈年** / Patrón Añejo — 墨西哥·哈利斯科 · ABV 40% · 色系 `tequila` · 烤龙舌兰、香草与柑橘
- **唐胡里奥 1942** / Don Julio 1942 — 墨西哥·哈利斯科 · ABV 38% · 色系 `tequila` · 焦糖、香草与烤龙舌兰
- **豪帅微陈** / Cuervo Reposado — 墨西哥 · ABV 38% · 色系 `tequila` · 橡木、香草与龙舌兰
- **奥乔白** / Ocho Plata — 墨西哥·高地 · ABV 40% · 色系 `tequila` · 鲜龙舌兰、白胡椒与柑橘
- **卡萨米戈斯** / Casamigos Blanco — 墨西哥 · ABV 40% · 色系 `tequila` · 香草、柑橘与温和
- **富特纳** / Fortaleza Blanco — 墨西哥·高地 · ABV 40% · 色系 `tequila` · 煮龙舌兰、橄榄与柑橘
- **特拉萨纳斯** / Tapatío — 墨西哥·高地 · ABV 40% · 色系 `tequila` · 胡椒、柑橘与矿物
- **阿沃龙梅斯卡尔** / Del Maguey Vida — 墨西哥·瓦哈卡 · ABV 42% · 色系 `tequila` · 烟熏、青草与矿物
- **蒙特罗伯斯** / Montelobos Mezcal — 墨西哥·瓦哈卡 · ABV 43.2% · 色系 `tequila` · 强烈烟熏、热带果与胡椒
- **邪恶梅斯卡尔** / Ilegal Joven — 墨西哥·瓦哈卡 · ABV 40% · 色系 `tequila` · 烟熏、柑橘与香草
- **阿玛拉斯** / Amarás Espadín — 墨西哥·瓦哈卡 · ABV 42% · 色系 `tequila` · 烟熏、苹果与矿物
- **埃斯波隆白** / Espolòn Blanco — 墨西哥·高地 · ABV 40% · 色系 `tequila` · 明亮柑橘、胡椒与龙舌兰
- **懒人金** / Sauza Gold — 墨西哥 · ABV 38% · 色系 `tequila` · 焦糖、橡木与龙舌兰
- **1800 珍藏** / 1800 Reposado — 墨西哥 · ABV 40% · 色系 `tequila` · 橡木、香草与烤龙舌兰
- **格兰卡西** / Gran Centenario — 墨西哥 · ABV 38% · 色系 `tequila` · 花香、龙舌兰与橡木
- **卡萨诺布雷** / Casa Noble Crystal — 墨西哥·高地 · ABV 40% · 色系 `tequila` · 柑橘、花香与龙舌兰
- **索托尔** / Sotol Por Siempre — 墨西哥·奇瓦瓦 · ABV 45% · 色系 `tequila` · 青草、矿物与野生沙漠植物
- **拉拉哈塔** / La Rojeña — 墨西哥 · ABV 40% · 色系 `tequila` · 烤龙舌兰、香草与柑橘

**伏特加 Vodka（22）**

- **灰雁原味** / Grey Goose — 法国 · ABV 40% · 色系 `vodka` · 干净、微甜的小麦芯
- **绝对伏特加** / Absolut — 瑞典 · ABV 40% · 色系 `vodka` · 顺滑、谷物与微甜
- **雪树** / Belvedere — 波兰 · ABV 40% · 色系 `vodka` · 黑麦、奶油与白胡椒
- **哥俄斯卡** / Wyborowa — 波兰 · ABV 40% · 色系 `vodka` · 黑麦、矿物与干爽
- **皇冠伏特加** / Smirnoff No.21 — 俄式·全球 · ABV 40% · 色系 `vodka` · 中性、干净与圆润
- **斯托利** / Stolichnaya — 俄式 · ABV 40% · 色系 `vodka` · 小麦黑麦、微甜与胡椒
- **芬兰地** / Finlandia — 芬兰 · ABV 40% · 色系 `vodka` · 大麦、冰川水与纯净
- **瑞典皇室** / Purity — 瑞典 · ABV 40% · 色系 `vodka` · 小麦大麦、丝滑矿物
- **俄国标准** / Russian Standard — 俄罗斯 · ABV 40% · 色系 `vodka` · 冬小麦、清冽与圆润
- **蓝天伏特加** / Skyy — 美国 · ABV 40% · 色系 `vodka` · 四重蒸馏、干净顺滑
- **提托手工** / Tito's Handmade — 美国·德州 · ABV 40% · 色系 `vodka` · 玉米基、微甜柔顺
- **坎特一号** / Ketel One — 荷兰 · ABV 40% · 色系 `vodka` · 小麦、柑橘与蜂蜜尾
- **雪树黑麦** / Belvedere Rye — 波兰 · ABV 40% · 色系 `vodka` · 黑麦面包、奶油与香草
- **北极冰** / Iceberg — 加拿大 · ABV 40% · 色系 `vodka` · 冰山水、极致纯净
- **乌克兰之魂** / Khor — 乌克兰 · ABV 40% · 色系 `vodka` · 小麦、温和与微甜
- **日本灰** / Haku — 日本 · ABV 40% · 色系 `vodka` · 白米、微甜与丝滑
- **雪山伏特加** / Snow Queen — 哈萨克 · ABV 40% · 色系 `vodka` · 有机小麦、纯净柔和
- **黑标榛子** / Nemiroff — 乌克兰 · ABV 40% · 色系 `vodka` · 蜂蜜与谷物的乌克兰风
- **珍露伏特加** / Ciroc — 法国 · ABV 40% · 色系 `vodka` · 葡萄基、清新花果
- **奥肯** / U'Luvka — 波兰 · ABV 40% · 色系 `vodka` · 黑麦小麦、优雅丝滑
- **瑞典之水** / Svedka — 瑞典 · ABV 40% · 色系 `vodka` · 顺滑、中性与价比
- **伦敦干杯** / Chase Vodka — 英国 · ABV 40% · 色系 `vodka` · 土豆基、奶油与坚果

**白兰地 Brandy（22）**

- **轩尼诗 VSOP** / Hennessy V.S.O.P — 法国·干邑 · ABV 40% · 色系 `brandy` · 烤杏仁、丁香与蜜饯
- **人头马 VSOP** / Rémy Martin VSOP — 法国·干邑 · ABV 40% · 色系 `brandy` · 杏、香草与橡木
- **马爹利蓝带** / Martell Cordon Bleu — 法国·干邑 · ABV 40% · 色系 `brandy` · 蜜饯、肉桂与可可
- **卡慕 VSOP** / Camus VSOP — 法国·干邑 · ABV 40% · 色系 `brandy` · 花香、果干与香草
- **御鹿 VSOP** / Hine VSOP — 法国·干邑 · ABV 40% · 色系 `brandy` · 细腻花香、蜜与香料
- **轩尼诗 XO** / Hennessy X.O — 法国·干邑 · ABV 40% · 色系 `brandy` · 丰润果干、可可与雪松
- **人头马路易十三** / Louis XIII — 法国·干邑 · ABV 40% · 色系 `brandy` · 极致复杂、檀香与蜜饯
- **拿破仑雅文邑** / Janneau VSOP — 法国·雅文邑 · ABV 40% · 色系 `brandy` · 李子、烤面包与香料
- **达诺世家雅文邑** / Darroze — 法国·雅文邑 · ABV 43% · 色系 `brandy` · 果干、烟草与焦糖
- **布勒登卡尔瓦多斯** / Boulard Calvados — 法国·诺曼底 · ABV 40% · 色系 `brandy` · 烤苹果、梨与橡木
- **杜彭卡尔瓦多斯** / Dupont Calvados — 法国·诺曼底 · ABV 42% · 色系 `brandy` · 新鲜苹果、花香与香料
- **皮斯科珍藏** / Pisco Portón — 秘鲁 · ABV 43% · 色系 `brandy` · 葡萄花、青草与花香
- **格拉巴** / Nonino Grappa — 意大利 · ABV 42% · 色系 `brandy` · 葡萄渣、花香与果香
- **西班牙白兰地** / Cardenal Mendoza — 西班牙·赫雷斯 · ABV 40% · 色系 `brandy` · 雪莉桶、果干与可可
- **托雷斯 10** / Torres 10 — 西班牙 · ABV 38% · 色系 `brandy` · 香草、肉桂与橙皮
- **德国樱桃白兰地** / Kirschwasser — 德国/瑞士 · ABV 40% · 色系 `brandy` · 樱桃核、杏仁与干爽
- **梅塔莎** / Metaxa 12 — 希腊 · ABV 40% · 色系 `brandy` · 玫瑰花瓣、葡萄干与香料
- **库瓦西耶 VSOP** / Courvoisier VSOP — 法国·干邑 · ABV 40% · 色系 `brandy` · 桃、杏与烤面包
- **夏朗德皮诺** / Pineau des Charentes — 法国 · ABV 17% · 色系 `wine` · 葡萄汁加干邑、蜜甜
- **秘鲁阿乔莱多** / Acholado Pisco — 秘鲁 · ABV 41% · 色系 `brandy` · 多品种葡萄、花果香
- **智利皮斯科** / Capel Pisco — 智利 · ABV 40% · 色系 `brandy` · 麝香葡萄、花香与柑橘
- **苹果杰克** / Laird's Applejack — 美国 · ABV 40% · 色系 `brandy` · 苹果、橡木与香料

**利口酒 Liqueur（26）**

- **君度橙酒** / Cointreau — 法国 · ABV 40% · 色系 `default` · 甜橙、清爽与柑橘
- **金万利** / Grand Marnier — 法国 · ABV 40% · 色系 `brandy` · 橙皮、干邑与焦糖
- **黑樱桃利口酒** / Luxardo Maraschino — 意大利 · ABV 32% · 色系 `default` · 樱桃核、杏仁与花香
- **阿玛雷托** / Disaronno Amaretto — 意大利 · ABV 28% · 色系 `brandy` · 杏仁、焦糖与杏核
- **卡鲁哇咖啡** / Kahlúa — 墨西哥 · ABV 20% · 色系 `whisky` · 咖啡、焦糖与可可
- **蒂亚玛丽亚** / Tia Maria — 牙买加 · ABV 20% · 色系 `whisky` · 冷萃咖啡、香草与朗姆
- **圣杰曼接骨木** / St-Germain — 法国 · ABV 20% · 色系 `default` · 接骨木花、荔枝与梨
- **黑加仑利口酒** / Crème de Cassis — 法国·第戎 · ABV 15% · 色系 `wine` · 黑加仑、莓果与酸甜
- **香博覆盆子** / Chambord — 法国 · ABV 16.5% · 色系 `campari` · 覆盆子、黑莓与蜂蜜
- **紫罗兰利口酒** / Crème de Violette — 法国 · ABV 20% · 色系 `wine` · 紫罗兰、花香与莓果
- **薄荷利口酒** / Get 27 Menthe — 法国 · ABV 21% · 色系 `absinthe` · 薄荷、清凉与甜
- **可可利口酒** / Crème de Cacao — 法国 · ABV 25% · 色系 `whisky` · 可可、香草与甜
- **绿查特酒** / Chartreuse Verte — 法国 · ABV 55% · 色系 `absinthe` · 130 味草本、薄荷与辛香
- **黄查特酒** / Chartreuse Jaune — 法国 · ABV 40% · 色系 `tequila` · 蜂蜜、藏红花与草本
- **修道院酒** / Bénédictine — 法国 · ABV 40% · 色系 `tequila` · 蜂蜜、草本与香料
- **金巴利** / Campari — 意大利·米兰 · ABV 25% · 色系 `campari` · 苦橙、龙胆与红色浆果
- **阿佩罗** / Aperol — 意大利·帕多瓦 · ABV 11% · 色系 `campari` · 苦橙、大黄与微甜
- **菲奈特布兰卡** / Fernet-Branca — 意大利·米兰 · ABV 39% · 色系 `absinthe` · 薄荷、草本与强烈苦韵
- **茴香酒** / Sambuca — 意大利 · ABV 38% · 色系 `default` · 茴香、甘草与甜
- **保乐苦艾酒** / Pernod Absinthe — 法国 · ABV 68% · 色系 `absinthe` · 茴香、苦艾与薄荷
- **贝利甜酒** / Baileys — 爱尔兰 · ABV 17% · 色系 `cream` · 奶油、可可与威士忌
- **榛子利口酒** / Frangelico — 意大利 · ABV 20% · 色系 `brandy` · 榛子、可可与香草
- **杜林标** / Drambuie — 苏格兰 · ABV 40% · 色系 `tequila` · 蜂蜜、香料与威士忌
- **南方安逸** / Southern Comfort — 美国 · ABV 35% · 色系 `whisky` · 桃、香料与果甜
- **蓝橙库拉索** / Blue Curaçao — 荷属库拉索 · ABV 20% · 色系 `gin` · 苦橙、甜与亮蓝
- **姜味利口酒** / Domaine de Canton — 法国 · ABV 28% · 色系 `tequila` · 生姜、蜂蜜与干邑

**加强酒 Fortified（22）**

- **卡帕诺红味美思** / Carpano Antica — 意大利·都灵 · ABV 16.5% · 色系 `vermouth` · 香草、可可与苦橙皮
- **诺瓦丽干味美思** / Noilly Prat Dry — 法国 · ABV 18% · 色系 `vermouth` · 草本、花香与干爽
- **马天尼红味美思** / Martini Rosso — 意大利 · ABV 15% · 色系 `vermouth` · 焦糖、香草与苦橙
- **马天尼白味美思** / Martini Bianco — 意大利 · ABV 15% · 色系 `vermouth` · 香草、花香与微甜
- **科奇美国佬** / Cocchi Americano — 意大利 · ABV 16.5% · 色系 `vermouth` · 龙胆、柑橘与草本
- **利莱白** / Lillet Blanc — 法国·波尔多 · ABV 17% · 色系 `vermouth` · 蜜橙、花香与微苦
- **杜本内** / Dubonnet — 法国 · ABV 15% · 色系 `vermouth` · 草本、苦橙与可可
- **潘脱米** / Punt e Mes — 意大利 · ABV 16% · 色系 `vermouth` · 甜味美思加苦韵
- **菲诺雪莉** / Tio Pepe Fino — 西班牙·赫雷斯 · ABV 15% · 色系 `wine` · 杏仁、海盐与干爽
- **阿蒙提亚多雪莉** / Lustau Amontillado — 西班牙·赫雷斯 · ABV 18.5% · 色系 `wine` · 榛子、焦糖与坚果
- **欧罗索雪莉** / Lustau Oloroso — 西班牙·赫雷斯 · ABV 20% · 色系 `wine` · 核桃、无花果与橡木
- **佩德罗-希梅内斯** / Pedro Ximénez — 西班牙·赫雷斯 · ABV 17% · 色系 `wine` · 葡萄干、糖蜜与无花果
- **茶色波特 10 年** / Taylor's Tawny 10 — 葡萄牙·杜罗 · ABV 20% · 色系 `wine` · 焦糖、坚果与干果
- **红宝石波特** / Graham's Ruby — 葡萄牙·杜罗 · ABV 20% · 色系 `wine` · 黑莓、李子与甜
- **年份波特** / Vintage Port — 葡萄牙·杜罗 · ABV 20% · 色系 `wine` · 浓郁黑果、单宁与巧克力
- **马德拉** / Blandy's Madeira — 葡萄牙·马德拉 · ABV 19% · 色系 `wine` · 焦糖、坚果与烟熏
- **玛萨拉** / Florio Marsala — 意大利·西西里 · ABV 18% · 色系 `wine` · 焦糖、杏与坚果
- **苏兹龙胆** / Suze — 法国 · ABV 15% · 色系 `tequila` · 龙胆草本、柑橘与苦
- **莎都斯朝鲜蓟** / Cynar — 意大利 · ABV 16.5% · 色系 `absinthe` · 朝鲜蓟、草本与苦甜
- **阿佩里蒂沃** / Select Aperitivo — 意大利·威尼斯 · ABV 17.5% · 色系 `campari` · 大黄、龙胆与苦橙
- **白味美思干型** / Dolin Dry — 法国·尚贝里 · ABV 17.5% · 色系 `vermouth` · 高山草本、花香与干爽
- **布兰卡薄荷** / Branca Menta — 意大利 · ABV 28% · 色系 `absinthe` · 浓郁薄荷与草本苦

**世界与中式 World & Baijiu（24）**

- **茅台飞天** / Moutai — 中国·贵州 · ABV 53% · 色系 `vodka` · 酱香、曲香与回甘
- **五粮液** / Wuliangye — 中国·四川 · ABV 52% · 色系 `vodka` · 浓香、窖香与醇厚
- **泸州老窖** / Luzhou Laojiao — 中国·四川 · ABV 52% · 色系 `vodka` · 窖香浓郁、绵甜净爽
- **汾酒青花** / Fenjiu — 中国·山西 · ABV 53% · 色系 `vodka` · 清香、纯净与甘冽
- **洋河蓝色经典** / Yanghe — 中国·江苏 · ABV 52% · 色系 `vodka` · 绵柔、窖香与甜润
- **剑南春** / Jiannanchun — 中国·四川 · ABV 52% · 色系 `vodka` · 浓香、芳香与醇和
- **古井贡酒** / Gujing Gongjiu — 中国·安徽 · ABV 50% · 色系 `vodka` · 浓香、花果与绵甜
- **西凤酒** / Xifeng — 中国·陕西 · ABV 52% · 色系 `vodka` · 凤香、醇厚与挺爽
- **韩国真露** / Jinro Soju — 韩国 · ABV 16.9% · 色系 `vodka` · 清淡、微甜与柔顺
- **日本米烧酒** / Iichiko Shochu — 日本·大分 · ABV 25% · 色系 `vodka` · 麦香、清雅与柔和
- **日本芋烧酒** / Satsuma Imo Shochu — 日本·鹿儿岛 · ABV 25% · 色系 `vodka` · 红薯、土香与醇厚
- **清酒大吟酿** / Dassai 23 — 日本·山口 · ABV 16% · 色系 `wine` · 花香、瓜果与丝滑
- **挪威阿夸维特** / Linie Aquavit — 挪威 · ABV 41.5% · 色系 `vodka` · 葛缕子、茴香与香料
- **德国杜松酒** / Steinhäger — 德国 · ABV 38% · 色系 `gin` · 纯杜松、干爽与草本
- **希腊茴香酒** / Ouzo 12 — 希腊 · ABV 38% · 色系 `default` · 茴香、甘草与清甜
- **土耳其拉克** / Yeni Rakı — 土耳其 · ABV 45% · 色系 `default` · 茴香、葡萄与浓烈
- **法国茴香酒** / Pastis 51 — 法国·马赛 · ABV 45% · 色系 `absinthe` · 茴香、甘草与草本
- **匈牙利乌尼古** / Unicum — 匈牙利 · ABV 40% · 色系 `absinthe` · 40 味草本、苦韵与香料
- **秘鲁阿乔拉多** / Caña Brava — 巴拿马 · ABV 40% · 色系 `rum` · 甘蔗、香草与轻盈
- **巴西甘蔗烧** / Pitú Cachaça — 巴西 · ABV 40% · 色系 `rum` · 鲜甘蔗、青草与果香
- **瑞典潘趣** / Swedish Punsch — 瑞典 · ABV 25% · 色系 `rum` · 巴达维亚朗姆、香料与甜
- **韩国马格利** / Makgeolli — 韩国 · ABV 6% · 色系 `cream` · 米酿、微气泡与甜酸
- **蒙古马奶酒** / Airag — 蒙古 · ABV 3% · 色系 `cream` · 发酵马奶、微酸与气泡
- **印度果阿芬尼** / Feni — 印度·果阿 · ABV 43% · 色系 `default` · 腰果或椰子、果香浓烈
