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
| **酒液 Liquid** | **218 款酒 + 213 配方**（32 色系调色板） | SVG 多档渐变 + 折射 + 液面 | `Glass.tsx`；酒款 `src/lib/data/spirits.ts`、配方 `recipes.ts`；色系 `tokens.ts` |
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

数据规模（供参考）：酒库 **218** 款、配方 **213** 款、风味原料 **237** 种、杯型 **36**。
逐条清单见文末**附录 A（酒库 218）/ 附录 B（配方 213）/ 附录 C（风味 237）**。

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
- **213 款配方鸡尾酒**——每款有独立酒名 / 杯型 / 冰 / 配料 / 品鉴，数据源 `src/lib/data/recipes.ts`。
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

---

## 附录 B · 213 款配方鸡尾酒（逐杯酒名）

> 数据源 `src/lib/data/recipes.ts`（5 时代分类）。格式：**中文名** / English — 杯型 · 冰 ·
> 配料 · 品鉴。绘制每杯成品时按此：**杯型**定外形、**配料**定酒色与杯中装饰、**品鉴**描述观感。

**黄金时代 Golden Age（44）**

- **古典鸡尾酒** / Old Fashioned — 古典杯 · 方冰 · 配料：波本威士忌、德梅拉拉糖浆、安格仕苦精、橙皮 · 焦糖与橙皮包裹橡木，温热绵长
- **曼哈顿** / Manhattan — 碟形香槟杯 · 净饮 · 配料：黑麦威士忌、甜味美思、安格仕苦精、马拉斯加樱桃 · 醇厚饱满，黑麦的辛香与味美思交织
- **马丁内斯** / Martinez — 碟形香槟杯 · 净饮 · 配料：老汤姆金酒、甜味美思、黑樱桃利口酒、橙味苦精 · 马天尼的祖先，甜润而草本
- **干马天尼** / Dry Martini — 马天尼杯 · 净饮 · 配料：金酒、干味美思、柠檬皮卷 · 凛冽干爽，杜松悬于零度边缘
- **萨泽拉克** / Sazerac — 古典杯 · 净饮 · 配料：黑麦威士忌、方糖、裴乔氏苦精、苦艾酒、柠檬皮 · 茴香润杯，黑麦与苦精的新奥尔良灵魂
- **威士忌酸酒** / Whiskey Sour — 碟形香槟杯 · 净饮 · 配料：波本威士忌、柠檬汁、糖浆、蛋白 · 柠檬明亮托起波本，泡沫如丝绒
- **黛绮丽** / Daiquiri — 碟形香槟杯 · 净饮 · 配料：白朗姆、青柠汁、糖浆 · 甘蔗甜被青柠收紧，干净利落
- **薄荷茱莉普** / Mint Julep — 古典杯 · 碎冰 · 配料：波本威士忌、糖浆、薄荷叶 · 碎冰霜雾里，薄荷与波本的南方夏日
- **汤姆柯林斯** / Tom Collins — 高球杯 · 方冰 · 配料：金酒、柠檬汁、糖浆、苏打水 · 气泡柠檬汽水，清爽悠长
- **金菲兹** / Gin Fizz — 高球杯 · 净饮 · 配料：金酒、柠檬汁、糖浆、蛋白、苏打水 · 云雾般绵密，柠檬与气泡的清晨
- **三叶草俱乐部** / Clover Club — 碟形香槟杯 · 净饮 · 配料：金酒、覆盆子糖浆、柠檬汁、蛋白 · 莓果的粉与杜松的清，淑女气派
- **珠宝** / Bijou — 碟形香槟杯 · 净饮 · 配料：金酒、绿查特酒、甜味美思、橙味苦精 · 三色如宝石，草本浓郁层叠
- **老广场** / Vieux Carré — 古典杯 · 方冰 · 配料：黑麦威士忌、干邑白兰地、甜味美思、修士酒、苦精 · 新奥尔良法属老城，层次深邃复杂
- **布鲁克林** / Brooklyn — 碟形香槟杯 · 净饮 · 配料：黑麦威士忌、干味美思、黑樱桃利口酒、苦精 · 曼哈顿的对岸表亲，干而锋利
- **罗伯罗伊** / Rob Roy — 碟形香槟杯 · 净饮 · 配料：苏格兰调和威士忌、甜味美思、苦精 · 苏格兰版曼哈顿，烟熏与甜的握手
- **血与沙** / Blood and Sand — 碟形香槟杯 · 净饮 · 配料：苏格兰威士忌、甜味美思、樱桃利口酒、橙汁 · 等比四味，血橙色的银幕浪漫
- **锈钉** / Rusty Nail — 古典杯 · 方冰 · 配料：苏格兰威士忌、杜林标利口酒 · 蜂蜜草本裹着威士忌，复古而暖
- **吉姆雷特** / Gimlet — 碟形香槟杯 · 净饮 · 配料：金酒、青柠汁、糖浆 · 青柠与杜松，简洁的航海记忆
- **飞行** / Aviation — 碟形香槟杯 · 净饮 · 配料：金酒、黑樱桃利口酒、紫罗兰利口酒、柠檬汁 · 天空般的淡紫，花香与樱桃
- **临别赠言** / Last Word — 碟形香槟杯 · 净饮 · 配料：金酒、绿查特酒、黑樱桃利口酒、青柠汁 · 等比四味的平衡奇迹，草本而锐利
- **亡者复生二号** / Corpse Reviver No.2 — 碟形香槟杯 · 净饮 · 配料：金酒、君度橙酒、利莱白、柠檬汁、苦艾酒 · 宿醉解药，柑橘清亮带茴香尾
- **汉基潘基** / Hanky Panky — 碟形香槟杯 · 净饮 · 配料：金酒、甜味美思、菲奈特布兰卡 · 草本苦韵收尾，萨伏伊的女调酒师杰作
- **布朗克斯** / Bronx — 碟形香槟杯 · 净饮 · 配料：金酒、甜味美思、干味美思、橙汁 · 完美马天尼加橙汁，柔和果香
- **香槟鸡尾酒** / Champagne Cocktail — 碟形香槟杯 · 净饮 · 配料：香槟、方糖、安格仕苦精 · 气泡升腾，方糖在杯底缓缓融化
- **法兰西75** / French 75 — 碟形香槟杯 · 净饮 · 配料：金酒、柠檬汁、糖浆、香槟 · 金酒酸酒遇上香槟，如炮火般明亮
- **边车** / Sidecar — 碟形香槟杯 · 净饮 · 配料：干邑白兰地、君度橙酒、柠檬汁、糖边 · 干邑的雍容与柑橘的酸甜，糖边点睛
- **杰克玫瑰** / Jack Rose — 碟形香槟杯 · 净饮 · 配料：苹果白兰地、红石榴糖浆、青柠汁 · 苹果与石榴的玫瑰色泽，酸甜可口
- **皮斯科酸酒** / Pisco Sour — 碟形香槟杯 · 净饮 · 配料：皮斯科、青柠汁、糖浆、蛋白、苦精 · 秘鲁国饮，花香葡萄裹着绵密泡沫
- **尼格罗尼** / Negroni — 古典杯 · 方冰 · 配料：金酒、金巴利、甜味美思、橙皮 · 苦橙与草本盛开，杜松收束于干爽
- **美国佬** / Americano — 高球杯 · 方冰 · 配料：金巴利、甜味美思、苏打水 · 尼格罗尼去金酒，清爽的苦甜开胃
- **花花公子** / Boulevardier — 古典杯 · 方冰 · 配料：波本威士忌、金巴利、甜味美思 · 威士忌版尼格罗尼，更暖更厚
- **雪莉柯伯乐** / Sherry Cobbler — 高球杯 · 碎冰 · 配料：阿蒙提亚多雪莉、糖浆、橙片 · 碎冰水果的维多利亚清凉，坚果回甘
- **螫刺** / Stinger — 古典杯 · 碎冰 · 配料：干邑白兰地、薄荷利口酒 · 白兰地与薄荷，深夜的清凉收尾
- **白兰地亚历山大** / Brandy Alexander — 碟形香槟杯 · 净饮 · 配料：干邑白兰地、可可利口酒、鲜奶油、肉豆蔻 · 丝绒般绵密，可可奶油的甜美甜点
- **热托迪** / Hot Toddy — 古典杯 · 净饮 · 配料：威士忌、蜂蜜、柠檬汁、热水、肉桂棒 · 暖身的蜂蜜柠檬，冬夜的慰藉
- **金瑞奇** / Gin Rickey — 高球杯 · 方冰 · 配料：金酒、青柠汁、苏打水 · 无糖的清爽，青柠与气泡的纯粹
- **竹子** / Bamboo — 碟形香槟杯 · 净饮 · 配料：干味雪莉、干味美思、苦精 · 低酒精的优雅开胃，干爽坚果香
- **阿多尼斯** / Adonis — 碟形香槟杯 · 净饮 · 配料：干味雪莉、甜味美思、橙味苦精 · 雪莉与味美思的柔和，午后的开胃
- **所得税** / Income Tax — 碟形香槟杯 · 净饮 · 配料：金酒、甜味美思、干味美思、橙汁、苦精 · 布朗克斯加苦精，橙香带草本
- **勿忘缅因号** / Remember the Maine — 碟形香槟杯 · 净饮 · 配料：黑麦威士忌、甜味美思、樱桃利口酒、苦艾酒 · 古巴战地之名，黑麦樱桃与茴香
- **燕尾服** / Tuxedo — 碟形香槟杯 · 净饮 · 配料：金酒、干味美思、黑樱桃利口酒、苦艾酒、橙味苦精 · 马天尼的盛装版，复杂干爽
- **逍遥自在** / Fancy Free — 古典杯 · 方冰 · 配料：黑麦威士忌、黑樱桃利口酒、橙味苦精、安格仕苦精 · 古典的樱桃变奏，圆润芳香
- **雪莉蛋蜜** / Sherry Flip — 碟形香槟杯 · 净饮 · 配料：茶色波特、全蛋、糖浆、肉豆蔻 · 整蛋打发的丝滑，坚果蛋奶香
- **萨拉托加** / Saratoga — 碟形香槟杯 · 净饮 · 配料：干邑白兰地、黑麦威士忌、甜味美思、苦精 · 双烈酒的曼哈顿，深沉醇厚

**禁酒年代 Prohibition（43）**

- **蜜蜂之膝** / Bee's Knees — 碟形香槟杯 · 净饮 · 配料：金酒、蜂蜜糖浆、柠檬汁 · 蜂蜜柔化劣质金酒的禁酒令智慧
- **南区** / Southside — 碟形香槟杯 · 净饮 · 配料：金酒、青柠汁、糖浆、薄荷叶 · 薄荷茱莉普的酸酒版，清新明亮
- **玛丽碧克馥** / Mary Pickford — 碟形香槟杯 · 净饮 · 配料：白朗姆、菠萝汁、红石榴糖浆、黑樱桃利口酒 · 默片女星之名，菠萝与石榴的甜美
- **海明威黛绮丽** / Hemingway Daiquiri — 碟形香槟杯 · 净饮 · 配料：白朗姆、青柠汁、西柚汁、黑樱桃利口酒 · 作家特调，更干更酸的葡萄柚版
- **夹层** / Between the Sheets — 碟形香槟杯 · 净饮 · 配料：干邑白兰地、白朗姆、君度橙酒、柠檬汁 · 边车的放浪表亲，烈而柑橘
- **白色佳人** / White Lady — 碟形香槟杯 · 净饮 · 配料：金酒、君度橙酒、柠檬汁、蛋白 · 金酒版边车，绵密而清雅
- **粉红佳人** / Pink Lady — 碟形香槟杯 · 净饮 · 配料：金酒、苹果白兰地、红石榴糖浆、柠檬汁、蛋白 · 玫瑰色泡沫，复古的优雅
- **巴卡迪鸡尾酒** / Bacardi Cocktail — 碟形香槟杯 · 净饮 · 配料：白朗姆、青柠汁、红石榴糖浆 · 法院判定必须用巴卡迪的传奇酸甜
- **总统** / El Presidente — 碟形香槟杯 · 净饮 · 配料：白朗姆、白味美思、君度橙酒、红石榴糖浆 · 哈瓦那的优雅，朗姆与味美思的古巴黄金时代
- **民族饭店特调** / Hotel Nacional — 碟形香槟杯 · 净饮 · 配料：白朗姆、杏子白兰地、菠萝汁、青柠汁 · 古巴名店招牌，杏与菠萝的热带
- **航空邮件** / Air Mail — 碟形香槟杯 · 净饮 · 配料：金朗姆、蜂蜜糖浆、青柠汁、香槟 · 蜂蜜朗姆遇香槟，气泡升空
- **十二海里** / Twelve Mile Limit — 碟形香槟杯 · 净饮 · 配料：白朗姆、黑麦威士忌、白兰地、红石榴糖浆、柠檬汁 · 走私船界线之名，三烈酒的大胆
- **猴腺** / Monkey Gland — 碟形香槟杯 · 净饮 · 配料：金酒、橙汁、红石榴糖浆、苦艾酒 · 巴黎名酒，橙香带一缕茴香
- **逃避法律者** / Scofflaw — 碟形香槟杯 · 净饮 · 配料：黑麦威士忌、干味美思、柠檬汁、红石榴糖浆 · 嘲讽禁酒令的名字，酸甜锋利
- **菊花** / Chrysanthemum — 碟形香槟杯 · 净饮 · 配料：干味美思、修士酒、苦艾酒 · 低酒精的草本花束，复杂而柔和
- **响尾蛇** / Diamondback — 碟形香槟杯 · 净饮 · 配料：黑麦威士忌、苹果白兰地、黄查特酒 · 强劲草本，禁酒令的危险之美
- **野蛮海岸** / Barbary Coast — 碟形香槟杯 · 净饮 · 配料：金酒、苏格兰威士忌、可可利口酒、鲜奶油 · 旧金山红灯区，烟熏可可奶油
- **古巴自由** / Cuba Libre — 高球杯 · 方冰 · 配料：金朗姆、可乐、青柠角 · 朗姆可乐加青柠，自由的气泡
- **玛梅泰勒** / Mamie Taylor — 高球杯 · 方冰 · 配料：苏格兰威士忌、姜啤、青柠汁 · 苏格兰版骡子，姜的辛辣
- **军舰** / Navy Sour — 碟形香槟杯 · 净饮 · 配料：海军朗姆、青柠汁、德梅拉拉糖浆 · 高强度朗姆的酸酒，浓烈甘醇
- **白色蜘蛛** / White Spider — 碟形香槟杯 · 净饮 · 配料：伏特加、薄荷利口酒 · 伏特加版螫刺，冰凉透明
- **金汤力** / Gin & Tonic — 高球杯 · 方冰 · 配料：金酒、汤力水、青柠角 · 金鸡纳的微苦与杜松，殖民地的清凉
- **秀兰邓波尔成人版** / Adult Shirley — 高球杯 · 方冰 · 配料：伏特加、红石榴糖浆、姜汁汽水、樱桃 · 童年汽水的成人改写
- **金色黎明** / Golden Dawn — 碟形香槟杯 · 净饮 · 配料：金酒、苹果白兰地、杏子白兰地、橙汁、红石榴糖浆 · 日出般的渐变，果香丰盈
- **玛格丽特前身** / Tequila Daisy — 碟形香槟杯 · 净饮 · 配料：龙舌兰、柠檬汁、君度橙酒、苏打水 · 玛格丽特的雏形，柑橘清爽
- **内格罗尼前身** / Milano-Torino — 古典杯 · 方冰 · 配料：金巴利、甜味美思 · 米兰与都灵的相遇，纯粹苦甜
- **蜜月** / Honeymoon — 碟形香槟杯 · 净饮 · 配料：苹果白兰地、修士酒、君度橙酒、柠檬汁 · 苹果与蜂蜜草本的甜蜜
- **玉米与油** / Corn 'n' Oil — 古典杯 · 方冰 · 配料：黑朗姆、法勒纳姆、青柠汁、苦精 · 巴巴多斯的香料朗姆，深沉甘香
- **阿尔冈昆** / Algonquin — 碟形香槟杯 · 净饮 · 配料：黑麦威士忌、干味美思、菠萝汁 · 文人圆桌之名，黑麦带菠萝果香
- **神枪手** / Sharpshooter — 碟形香槟杯 · 净饮 · 配料：干邑白兰地、咖啡利口酒、柠檬汁、糖浆 · 咖啡与白兰地的提神酸甜
- **公园大道** / Park Avenue — 碟形香槟杯 · 净饮 · 配料：金酒、甜味美思、菠萝汁、君度橙酒 · 上流社会之名，菠萝柔化的马天尼
- **玉兰** / Magnolia — 碟形香槟杯 · 净饮 · 配料：金酒、柠檬汁、橙汁、蛋白、香槟 · 花名鸡尾酒，柑橘泡沫的优雅
- **佛罗里达** / Floridita — 碟形香槟杯 · 净饮 · 配料：白朗姆、甜味美思、君度橙酒、青柠汁、红石榴糖浆 · 哈瓦那名吧之名，复杂的甘酸
- **午夜阳光** / Midnight Sun — 碟形香槟杯 · 净饮 · 配料：金酒、黄查特酒、柠檬汁、蜂蜜 · 蜂蜜草本的金色，温暖明亮
- **禁果** / Forbidden Fruit — 碟形香槟杯 · 净饮 · 配料：苹果白兰地、西柚利口酒、柠檬汁 · 苹果与葡萄柚的微苦诱惑
- **珍珠纽扣** / Pearl Button — 碟形香槟杯 · 净饮 · 配料：金酒、干味美思、接骨木花利口酒、柠檬汁 · 接骨木的花香马天尼，清雅
- **黑色天鹅绒** / Black Velvet — 高球杯 · 净饮 · 配料：司陶特啤酒、香槟 · 黑啤与香槟分层，丝绒般顺滑
- **第八病房** / Ward Eight — 碟形香槟杯 · 净饮 · 配料：黑麦威士忌、柠檬汁、橙汁、红石榴糖浆 · 波士顿政坛之名，威士忌的果香酸甜
- **金雏菊** / Gin Daisy — 古典杯 · 碎冰 · 配料：金酒、柠檬汁、红石榴糖浆、苏打水 · 禁酒令前的雏菊家族，碎冰果香
- **狮尾** / Lion's Tail — 碟形香槟杯 · 净饮 · 配料：波本威士忌、多香果利口酒、青柠汁、糖浆、苦精 · 多香果的异域香料，温暖辛甜
- **布朗德比** / Brown Derby — 碟形香槟杯 · 净饮 · 配料：波本威士忌、西柚汁、蜂蜜糖浆 · 好莱坞名店之作，葡萄柚蜂蜜
- **布斯比** / Boothby — 碟形香槟杯 · 净饮 · 配料：黑麦威士忌、甜味美思、苦精、香槟 · 曼哈顿顶一抹香槟，气泡升华
- **费尔班克斯** / Fairbanks — 碟形香槟杯 · 净饮 · 配料：金酒、干味美思、杏子白兰地、橙味苦精 · 默片巨星之名，杏香马天尼

**提基风潮 Tiki & Tropical（42）**

- **迈泰** / Mai Tai — 古典杯 · 碎冰 · 配料：牙买加朗姆、农业朗姆、君度橙酒、杏仁糖浆、青柠汁 · 提基之王，朗姆与杏仁青柠的天堂
- **僵尸** / Zombie — 高球杯 · 碎冰 · 配料：金朗姆、黑朗姆、海军朗姆、青柠汁、法勒纳姆、红石榴糖浆 · 三朗姆的危险，限饮两杯的传说
- **止痛药** / Painkiller — 高球杯 · 碎冰 · 配料：海军朗姆、菠萝汁、橙汁、椰子奶油、肉豆蔻 · 英属维京群岛之魂，椰香热带
- **椰林飘香** / Piña Colada — 高球杯 · 碎冰 · 配料：白朗姆、椰子奶油、菠萝汁 · 波多黎各国饮，椰子菠萝的慵懒
- **丛林鸟** / Jungle Bird — 古典杯 · 碎冰 · 配料：黑朗姆、金巴利、菠萝汁、青柠汁、糖浆 · 吉隆坡名作，苦甜与热带的奇遇
- **海军格罗格** / Navy Grog — 古典杯 · 碎冰 · 配料：金朗姆、黑朗姆、海军朗姆、西柚汁、青柠汁、蜂蜜 · 三朗姆配蜂蜜柑橘，水手的安慰
- **雾切** / Fog Cutter — 高球杯 · 碎冰 · 配料：白朗姆、白兰地、金酒、橙汁、柠檬汁、杏仁糖浆、雪莉 · 层层叠叠的烈酒迷雾
- **三点一划** / Three Dots and a Dash — 高球杯 · 碎冰 · 配料：陈年朗姆、海军朗姆、法勒纳姆、蜂蜜、青柠汁、橙汁、苦精 · 摩斯密码胜利之名，香料丰盈
- **土星** / Saturn — 碟形香槟杯 · 碎冰 · 配料：金酒、百香果糖浆、柠檬汁、杏仁糖浆、法勒纳姆 · 金酒提基的稀有之作，百香果芳香
- **飓风** / Hurricane — 高球杯 · 碎冰 · 配料：金朗姆、黑朗姆、百香果糖浆、柠檬汁 · 新奥尔良的飓风杯，热带果潘趣
- **新加坡司令** / Singapore Sling — 高球杯 · 方冰 · 配料：金酒、樱桃利口酒、君度橙酒、修士酒、菠萝汁、青柠汁、红石榴糖浆、苦精 · 莱佛士酒店之魂，复杂热带果香
- **种植者潘趣** / Planter's Punch — 高球杯 · 碎冰 · 配料：黑朗姆、橙汁、菠萝汁、青柠汁、红石榴糖浆 · 牙买加古训：一酸二甜三烈四弱
- **试飞员** / Test Pilot — 碟形香槟杯 · 碎冰 · 配料：金朗姆、海军朗姆、君度橙酒、法勒纳姆、青柠汁、苦精 · Don the Beachcomber 杰作，烈而平衡
- **蝎子** / Scorpion — 高球杯 · 碎冰 · 配料：金朗姆、白兰地、橙汁、柠檬汁、杏仁糖浆 · 波利尼西亚的大份共享，杏仁果香
- **巴哈马妈妈** / Bahama Mama — 高球杯 · 碎冰 · 配料：金朗姆、椰子朗姆、咖啡利口酒、菠萝汁、柠檬汁 · 椰子咖啡与菠萝的加勒比
- **蓝色夏威夷** / Blue Hawaii — 高球杯 · 碎冰 · 配料：白朗姆、伏特加、蓝橙利口酒、菠萝汁、甜酸 · 亮蓝海洋色，菠萝热带风情
- **眼镜蛇之牙** / Cobra's Fang — 高球杯 · 碎冰 · 配料：黑朗姆、海军朗姆、百香果糖浆、橙汁、青柠汁、茴香 · Don 的香料毒牙，深色而辛香
- **港口之光** / Port Light — 碟形香槟杯 · 碎冰 · 配料：波本威士忌、百香果糖浆、蜂蜜、柠檬汁、红石榴糖浆、蛋白 · 波本提基，百香果的明亮
- **受苦的混蛋** / Suffering Bastard — 高球杯 · 方冰 · 配料：金酒、白兰地、青柠汁、苦精、姜啤 · 开罗解宿醉名作，姜的辛辣
- **皇家夏威夷** / Royal Hawaiian — 碟形香槟杯 · 净饮 · 配料：金酒、菠萝汁、柠檬汁、杏仁糖浆 · 菠萝杏仁的轻盈热带马天尼
- **黑暗风暴** / Dark 'n' Stormy — 高球杯 · 方冰 · 配料：黑朗姆、姜啤、青柠角 · 百慕大的乌云风暴，姜与黑朗姆
- **朗姆奔跑者** / Rum Runner — 高球杯 · 碎冰 · 配料：金朗姆、黑朗姆、黑莓利口酒、香蕉利口酒、菠萝汁、红石榴糖浆 · 佛州群岛的甜美走私
- **潜水医生** / Doctor Funk — 高球杯 · 碎冰 · 配料：黑朗姆、青柠汁、红石榴糖浆、苦艾酒、苏打水 · 南太平洋医生之名，茴香尾韵
- **珍珠潜水者** / Pearl Diver — 高球杯 · 碎冰 · 配料：金朗姆、黑朗姆、橙汁、青柠汁、法勒纳姆、黄油糖香料蜜 · 黄油香料蜜的独特，温暖丰盈
- **哈雷库拉尼** / Halekulani — 碟形香槟杯 · 净饮 · 配料：波本威士忌、橙汁、柠檬汁、红石榴糖浆、苦精 · 夏威夷酒店之名，波本柑橘
- **蓝色泻湖** / Blue Lagoon — 高球杯 · 方冰 · 配料：伏特加、蓝橙利口酒、柠檬汽水 · 电光蓝的清凉，柑橘汽水
- **可可滩** / Cocoa Beach — 高球杯 · 碎冰 · 配料：椰子朗姆、菠萝汁、蔓越莓汁、青柠汁 · 椰子与莓果的沙滩午后
- **毛伊酒杯** / Maui Mule — 高球杯 · 碎冰 · 配料：伏特加、菠萝汁、青柠汁、姜啤 · 热带版莫斯科骡子，姜菠萝
- **波利尼西亚** / Polynesian — 碟形香槟杯 · 碎冰 · 配料：白朗姆、百香果糖浆、青柠汁、盐边 · 海岛酸甜，百香果的明媚
- **珊瑚礁** / Coral Reef — 高球杯 · 碎冰 · 配料：白朗姆、桃子利口酒、菠萝汁、橙汁、红石榴糖浆 · 渐变珊瑚色，桃与菠萝
- **热带迷雾** / Tropical Itch — 高球杯 · 碎冰 · 配料：黑朗姆、波本威士忌、君度橙酒、百香果汁、苦精 · 夏威夷之痒，百香果与波本
- **珊瑚之吻** / Coral Kiss — 碟形香槟杯 · 碎冰 · 配料：白朗姆、荔枝利口酒、青柠汁、椰子奶油 · 荔枝椰子的柔软海岛吻
- **火山碗** / Volcano Bowl — 高球杯 · 碎冰 · 配料：金朗姆、黑朗姆、白兰地、橙汁、菠萝汁、杏仁糖浆 · 共享火山碗，朗姆与坚果果香
- **太平洋日落** / Pacific Sunset — 高球杯 · 碎冰 · 配料：龙舌兰、芒果汁、百香果糖浆、青柠汁 · 龙舌兰提基，芒果百香的落日
- **椰子云** / Coconut Cloud — 高球杯 · 碎冰 · 配料：白朗姆、椰子奶油、香蕉利口酒、菠萝汁 · 云絮般的椰子香蕉奶昔
- **热带雷暴** / Tropical Thunder — 高球杯 · 碎冰 · 配料：黑朗姆、海军朗姆、百香果糖浆、青柠汁、姜啤 · 黑朗姆的雷暴，百香与姜
- **冒纳罗亚** / Mauna Loa — 高球杯 · 碎冰 · 配料：金朗姆、黑朗姆、杏仁糖浆、菠萝汁、青柠汁 · 夏威夷火山之名，坚果菠萝
- **鲨鱼牙** / Shark's Tooth — 高球杯 · 碎冰 · 配料：海军朗姆、青柠汁、红石榴糖浆、百香果糖浆、苏打水 · 高强度朗姆的尖牙，红色凶猛
- **卡瓦碗** / Kava Bowl — 高球杯 · 碎冰 · 配料：金朗姆、白朗姆、橙汁、柠檬汁、杏仁糖浆 · 南太平洋共享碗，杏仁柑橘
- **热黄油朗姆** / Hot Buttered Rum — 古典杯 · 净饮 · 配料：黑朗姆、黄油糖香料蜜、热水、肉桂棒 · 冬日暖身，黄油香料的丰腴
- **沙滩拾荒者** / Beachcomber — 碟形香槟杯 · 净饮 · 配料：白朗姆、君度橙酒、青柠汁、红石榴糖浆 · 黛绮丽的热带表亲，柑橘清爽
- **塔希提潘趣** / Tahitian Punch — 高球杯 · 碎冰 · 配料：金朗姆、百香果糖浆、菠萝汁、橙汁、青柠汁 · 塔希提的群果潘趣，阳光满溢

**现代精酿 Modern Craft（43）**

- **盘尼西林** / Penicillin — 古典杯 · 冰球 · 配料：调和苏格兰、蜂蜜姜糖浆、柠檬汁、泥煤威士忌 · 现代经典，蜂蜜姜与烟熏的良药
- **纸飞机** / Paper Plane — 碟形香槟杯 · 净饮 · 配料：波本威士忌、阿佩罗、阿玛罗、柠檬汁 · 等比四味的现代杰作，苦甜平衡
- **裸体与名声** / Naked and Famous — 碟形香槟杯 · 净饮 · 配料：梅斯卡尔、黄查特酒、阿佩罗、青柠汁 · 烟熏版临别赠言，等比的危险魅力
- **淘金热** / Gold Rush — 古典杯 · 冰球 · 配料：波本威士忌、蜂蜜糖浆、柠檬汁 · 威士忌酸酒的蜂蜜进化，圆润浓郁
- **大都会** / Cosmopolitan — 马天尼杯 · 净饮 · 配料：柑橘伏特加、君度橙酒、蔓越莓汁、青柠汁 · 都市女郎的粉红，蔓越莓清爽
- **浓缩咖啡马天尼** / Espresso Martini — 马天尼杯 · 净饮 · 配料：伏特加、咖啡利口酒、浓缩咖啡、糖浆 · 提神又微醺，咖啡油脂的奶泡
- **黑莓荆棘** / Bramble — 古典杯 · 碎冰 · 配料：金酒、柠檬汁、糖浆、黑莓利口酒 · 碎冰上的黑莓渗染，伦敦现代经典
- **玛格丽特** / Margarita — 碟形香槟杯 · 净饮 · 配料：龙舌兰、君度橙酒、青柠汁、盐边 · 咸口起兴，龙舌兰青草与青柠
- **汤米玛格丽特** / Tommy's Margarita — 古典杯 · 方冰 · 配料：龙舌兰、青柠汁、龙舌兰糖浆 · 无橙酒的纯净，龙舌兰本味
- **莫斯科骡子** / Moscow Mule — 高球杯 · 方冰 · 配料：伏特加、青柠汁、姜啤、青柠角 · 铜杯里的辛辣气泡，清爽提神
- **长岛冰茶** / Long Island Iced Tea — 高球杯 · 方冰 · 配料：伏特加、金酒、白朗姆、龙舌兰、君度橙酒、柠檬汁、可乐 · 五烈酒伪装的茶色，强劲危险
- **茉莉** / Jasmine — 碟形香槟杯 · 净饮 · 配料：金酒、金巴利、君度橙酒、柠檬汁 · 西柚般的苦甜花香，现代酸酒
- **分界钟** / Division Bell — 碟形香槟杯 · 净饮 · 配料：梅斯卡尔、阿佩罗、黑樱桃利口酒、青柠汁 · 烟熏与苦橙樱桃的现代平衡
- **瓦哈卡古典** / Oaxaca Old Fashioned — 古典杯 · 冰球 · 配料：龙舌兰、梅斯卡尔、龙舌兰糖浆、苦精 · 烟熏版古典，墨西哥的深沉
- **特立尼达酸酒** / Trinidad Sour — 碟形香槟杯 · 净饮 · 配料：安格仕苦精、杏仁糖浆、黑麦威士忌、柠檬汁 · 以苦精为基酒的颠覆之作
- **金酒罗勒击打** / Gin Basil Smash — 古典杯 · 碎冰 · 配料：金酒、柠檬汁、糖浆、罗勒叶 · 罗勒拍打出的翠绿清香，德式现代
- **东区** / Eastside — 碟形香槟杯 · 净饮 · 配料：金酒、青柠汁、糖浆、黄瓜片、薄荷叶 · 黄瓜薄荷的清新南区变奏
- **辣味玛格丽特** / Spicy Margarita — 古典杯 · 方冰 · 配料：龙舌兰、君度橙酒、青柠汁、辣椒、辣盐边 · 辣椒点燃的玛格丽特，热情似火
- **阿佩罗气泡** / Aperol Spritz — 高球杯 · 方冰 · 配料：阿佩罗、普罗赛克、苏打水、橙片 · 威尼斯的橙色午后，微苦气泡
- **雨果气泡** / Hugo Spritz — 高球杯 · 方冰 · 配料：接骨木花利口酒、普罗赛克、苏打水、薄荷、青柠 · 接骨木薄荷的清新气泡
- **加里波第** / Garibaldi — 高球杯 · 方冰 · 配料：金巴利、鲜榨橙汁 · 蓬松橙汁裹苦橙，简单而惊艳
- **血腥玛丽** / Bloody Mary — 高球杯 · 方冰 · 配料：伏特加、番茄汁、柠檬汁、辣酱、伍斯特酱、芹菜 · 咸鲜辛辣的早午餐救赎
- **含羞草** / Mimosa — 碟形香槟杯 · 净饮 · 配料：香槟、鲜榨橙汁 · 香槟与橙汁的早午餐经典
- **贝里尼** / Bellini — 碟形香槟杯 · 净饮 · 配料：普罗赛克、白桃泥 · 威尼斯哈利酒吧之作，白桃柔美
- **法式马天尼** / French Martini — 马天尼杯 · 净饮 · 配料：伏特加、覆盆子利口酒、菠萝汁 · 覆盆子菠萝的丝滑泡沫
- **柠檬滴** / Lemon Drop — 马天尼杯 · 净饮 · 配料：柑橘伏特加、君度橙酒、柠檬汁、糖边 · 糖边的柠檬糖果，酸甜活泼
- **色情明星马天尼** / Pornstar Martini — 马天尼杯 · 净饮 · 配料：香草伏特加、百香果利口酒、百香果泥、青柠汁、香槟 · 百香果的奢华，配一小杯香槟
- **维斯帕** / Vesper — 马天尼杯 · 净饮 · 配料：金酒、伏特加、利莱白、柠檬皮 · 邦德之名，凛冽而锋利
- **纽约酸酒** / New York Sour — 古典杯 · 方冰 · 配料：黑麦威士忌、柠檬汁、糖浆、红酒 · 红酒漂浮的酸酒，视觉与风味的层次
- **阿玛雷托酸酒** / Amaretto Sour — 古典杯 · 方冰 · 配料：阿玛雷托、波本威士忌、柠檬汁、糖浆、蛋白 · 杏仁的甜与波本的骨，绵密酸甜
- **威士忌击打** / Whiskey Smash — 古典杯 · 碎冰 · 配料：波本威士忌、柠檬角、糖浆、薄荷叶 · 捣碎柠檬薄荷的夏日威士忌
- **腹地** / Hinterland — 碟形香槟杯 · 净饮 · 配料：金酒、接骨木花利口酒、黄查特酒、青柠汁 · 接骨木与草本的现代花园
- **黄瓜吉姆雷特** / Cucumber Gimlet — 碟形香槟杯 · 净饮 · 配料：金酒、青柠汁、糖浆、黄瓜片 · 黄瓜的清凉吉姆雷特
- **梅斯卡尔骡子** / Mezcal Mule — 高球杯 · 方冰 · 配料：梅斯卡尔、青柠汁、姜啤 · 烟熏版骡子，辛辣升级
- **接骨木气泡** / Elderflower Spritz — 高球杯 · 方冰 · 配料：金酒、接骨木花利口酒、普罗赛克、苏打水 · 花香气泡的轻盈开胃
- **咖啡古典** / Coffee Old Fashioned — 古典杯 · 冰球 · 配料：波本威士忌、咖啡糖浆、咖啡苦精、橙皮 · 咖啡风味的古典进化
- **黑刺李金菲兹** / Sloe Gin Fizz — 高球杯 · 净饮 · 配料：黑刺李金酒、柠檬汁、糖浆、苏打水 · 黑刺李的莓果气泡，红宝石色
- **肯塔基骡子** / Kentucky Mule — 高球杯 · 方冰 · 配料：波本威士忌、青柠汁、姜啤、薄荷 · 波本版骡子，姜与橡木的辛香
- **龙舌兰日出** / Tequila Sunrise — 高球杯 · 方冰 · 配料：龙舌兰、橙汁、红石榴糖浆 · 渐变日出色，橙汁与石榴的清晨
- **海风** / Sea Breeze — 高球杯 · 方冰 · 配料：伏特加、蔓越莓汁、西柚汁 · 蔓越莓与葡萄柚的海岸清风
- **灰狗** / Greyhound — 高球杯 · 方冰 · 配料：伏特加、西柚汁 · 葡萄柚的纯粹清爽，加盐即咸狗
- **银快车** / Silver Bullet — 马天尼杯 · 净饮 · 配料：金酒、柠檬汁、茴香酒 · 茴香的银色锋芒，干冽清冽
- **金菲克斯** / Gin Fix — 古典杯 · 碎冰 · 配料：金酒、柠檬汁、糖浆、水 · 古老的fix家族，碎冰柠檬清爽

**无酒精特调 Zero-Proof（41）**

- **维珍莫吉托** / Virgin Mojito — 高球杯 · 碎冰 · 配料：青柠汁、糖浆、薄荷叶、苏打水 · 无酒精的薄荷青柠清凉
- **秀兰邓波尔** / Shirley Temple — 高球杯 · 方冰 · 配料：姜汁汽水、红石榴糖浆、樱桃 · 童年的甜美汽水，红石榴的玫红
- **维珍椰林飘香** / Virgin Piña Colada — 高球杯 · 碎冰 · 配料：菠萝汁、椰子奶油、鲜奶油 · 椰子菠萝的热带奶昔，无酒精
- **处女玛丽** / Virgin Mary — 高球杯 · 方冰 · 配料：番茄汁、柠檬汁、辣酱、伍斯特酱、芹菜 · 无酒精血腥玛丽，咸鲜开胃
- **罗伊罗杰斯** / Roy Rogers — 高球杯 · 方冰 · 配料：可乐、红石榴糖浆、樱桃 · 可乐版邓波尔，牛仔的汽水
- **阿诺帕尔默** / Arnold Palmer — 高球杯 · 方冰 · 配料：红茶、柠檬水、柠檬片 · 高尔夫名将之名，冰茶柠檬水各半
- **灰姑娘** / Cinderella — 碟形香槟杯 · 净饮 · 配料：橙汁、菠萝汁、柠檬汁、苏打水 · 三果汁的午夜魔法，清甜活泼
- **西园花园** / Seedlip Garden — 碟形香槟杯 · 净饮 · 配料：无酒精金酒、接骨木花糖浆、柠檬汁、黄瓜片 · 无酒精蒸馏的草本花园
- **黄瓜清凉** / Cucumber Cooler — 高球杯 · 方冰 · 配料：黄瓜汁、青柠汁、糖浆、苏打水、薄荷 · 黄瓜薄荷的盛夏冷饮
- **姜味气泡** / Ginger Fizz — 高球杯 · 方冰 · 配料：姜汁糖浆、柠檬汁、苏打水、姜片 · 辛辣生姜的清爽气泡
- **接骨木气泡水** / Elderflower Soda — 高球杯 · 方冰 · 配料：接骨木花糖浆、柠檬汁、苏打水、薄荷 · 花香气泡，优雅无酒精
- **石榴气泡** / Pomegranate Fizz — 高球杯 · 方冰 · 配料：石榴汁、青柠汁、糖浆、苏打水 · 石榴的酸甜红宝石气泡
- **热带潘趣** / Tropical Punch — 高球杯 · 碎冰 · 配料：菠萝汁、芒果汁、百香果糖浆、青柠汁 · 群果热带潘趣，阳光满杯
- **薰衣草柠檬水** / Lavender Lemonade — 高球杯 · 方冰 · 配料：柠檬汁、薰衣草糖浆、水、薰衣草 · 薰衣草的花香柠檬水，舒缓宁静
- **蜜桃冰茶** / Peach Iced Tea — 高球杯 · 方冰 · 配料：红茶、桃子糖浆、柠檬汁、桃片 · 蜜桃浸润的冰红茶，夏日午后
- **西瓜清凉** / Watermelon Cooler — 高球杯 · 碎冰 · 配料：西瓜汁、青柠汁、糖浆、薄荷 · 西瓜的清甜多汁，碎冰沁凉
- **芒果拉西** / Mango Lassi — 高球杯 · 净饮 · 配料：芒果泥、酸奶、蜂蜜、小豆蔻 · 印度的芒果酸奶，绵密香甜
- **闪亮葡萄** / Sparkling Grape — 碟形香槟杯 · 净饮 · 配料：无酒精起泡葡萄、白葡萄汁、青柠汁 · 无酒精起泡的庆典气氛
- **苹果气泡** / Apple Spritz — 高球杯 · 方冰 · 配料：苹果汁、接骨木花糖浆、苏打水、苹果片 · 青苹果的清脆气泡
- **薄荷柠檬水** / Mint Lemonade — 高球杯 · 碎冰 · 配料：柠檬汁、糖浆、水、薄荷叶 · 捣碎薄荷的经典柠檬水
- **洛神花清凉** / Hibiscus Cooler — 高球杯 · 方冰 · 配料：洛神花茶、青柠汁、蜂蜜、苏打水 · 洛神花的玫红酸甜冷饮
- **百香果气泡** / Passion Fizz — 碟形香槟杯 · 净饮 · 配料：百香果泥、橙汁、青柠汁、苏打水 · 百香果的酸香气泡
- **椰子清凉** / Coconut Cooler — 高球杯 · 碎冰 · 配料：椰子水、菠萝汁、青柠汁、薄荷 · 椰子水的轻盈补水热带
- **香料苹果** / Spiced Apple — 古典杯 · 净饮 · 配料：苹果汁、肉桂糖浆、柠檬汁、肉桂棒 · 温暖的香料苹果，秋日暖意
- **蔓越莓气泡** / Cranberry Fizz — 高球杯 · 方冰 · 配料：蔓越莓汁、青柠汁、糖浆、苏打水 · 蔓越莓的酸涩气泡，节日红
- **荔枝清凉** / Lychee Cooler — 碟形香槟杯 · 净饮 · 配料：荔枝汁、青柠汁、接骨木花糖浆、苏打水 · 荔枝的花香清甜
- **柚子苏打** / Yuzu Soda — 高球杯 · 方冰 · 配料：柚子糖浆、柠檬汁、苏打水、柚子皮 · 柚子的清新柑橘气泡
- **抹茶汤力** / Matcha Tonic — 高球杯 · 方冰 · 配料：抹茶、汤力水、蜂蜜、柠檬 · 抹茶的微苦遇上汤力的清冽
- **冷萃汤力** / Cold Brew Tonic — 高球杯 · 方冰 · 配料：冷萃咖啡、汤力水、橙皮 · 冷萃咖啡的意外气泡，清爽提神
- **生姜薄荷** / Ginger Mint — 高球杯 · 碎冰 · 配料：姜汁糖浆、青柠汁、薄荷叶、苏打水 · 生姜薄荷的双重清凉
- **蓝莓罗勒** / Blueberry Basil — 碟形香槟杯 · 净饮 · 配料：蓝莓泥、柠檬汁、糖浆、罗勒叶、苏打水 · 蓝莓与罗勒的现代无酒精
- **玫瑰荔枝** / Rose Lychee — 碟形香槟杯 · 净饮 · 配料：荔枝汁、玫瑰糖浆、柠檬汁、苏打水 · 玫瑰荔枝的浪漫花香
- **桂花乌龙** / Osmanthus Oolong — 高球杯 · 方冰 · 配料：乌龙茶、桂花糖浆、柠檬汁 · 桂花乌龙的东方茶韵
- **甜瓜薄荷** / Melon Mint — 高球杯 · 碎冰 · 配料：哈密瓜汁、青柠汁、糖浆、薄荷 · 哈密瓜的清甜薄荷
- **柑橘冷饮** / Citrus Cooler — 高球杯 · 方冰 · 配料：橙汁、西柚汁、柠檬汁、苏打水 · 三柑橘的明亮维C冷饮
- **维珍日出** / Virgin Sunrise — 高球杯 · 方冰 · 配料：橙汁、红石榴糖浆、青柠汁 · 无酒精的日出渐变，清甜柑橘
- **无酒精尼格罗尼** / No-groni — 古典杯 · 方冰 · 配料：无酒精苦味、无酒精金酒、无酒精味美思、橙皮 · 苦甜平衡的无酒精尼格罗尼
- **莓果柠檬水** / Berry Lemonade — 高球杯 · 碎冰 · 配料：草莓泥、柠檬汁、糖浆、水 · 草莓柠檬水的盛夏粉红
- **姜青柠苏打** / Ginger Lime Soda — 高球杯 · 方冰 · 配料：姜汁糖浆、青柠汁、苏打水、青柠片 · 姜与青柠的清爽气泡
- **热带落日** / Tropical Sunset — 高球杯 · 碎冰 · 配料：芒果汁、百香果糖浆、蔓越莓汁、青柠汁 · 芒果与蔓越莓的落日渐变
- **青葡萄气泡** / Verjus Spritz — 高球杯 · 方冰 · 配料：未熟葡萄汁、接骨木花糖浆、苏打水、薄荷 · 青葡萄的酸爽气泡开胃

---

## 附录 C · 237 种风味原料（禅意模式 · 10 品类）

> 数据源 `src/lib/data/flavors.ts`。格式：**中文名** / English — `节点色` · 风味标签。用于「魔法」
> 自由创作的风味球节点 / 扩散动画配色；标签喂给 AI 和谐度分析。

**基酒 Base Spirits（29）**

- **苏格兰调和威士忌** / Blended Scotch — `#B9742A` · 橡木、麦芽、蜂蜜
- **斯佩塞单一麦芽** / Speyside Single Malt — `#C0822F` · 苹果、香草、麦芽
- **艾雷岛泥煤威士忌** / Islay Peated — `#9A5B22` · 泥煤、海盐、烟熏
- **高地威士忌** / Highland Whisky — `#B16C26` · 石楠、焦糖、橡木
- **波本威士忌** / Bourbon — `#A85F22` · 玉米、香草、焦糖
- **黑麦威士忌** / Rye Whiskey — `#9E5A26` · 黑麦、辛香、胡椒
- **爱尔兰威士忌** / Irish Whiskey — `#C68A3A` · 顺滑、青苹果、奶油
- **日本威士忌** / Japanese Whisky — `#C8923F` · 蜂蜜、檀木、橘皮
- **田纳西威士忌** / Tennessee Whiskey — `#A65E22` · 枫糖、炭滤、香草
- **伦敦干金酒** / London Dry Gin — `#D8E3DA` · 杜松、柑橘、草本
- **老汤姆金酒** / Old Tom Gin — `#CBD9C4` · 微甜、杜松、柑橘
- **普利茅斯金酒** / Plymouth Gin — `#D2DDD2` · 柔和、根茎、柑橘
- **黑刺李金酒** / Sloe Gin — `#7E2233` · 黑刺李、杏仁、酸甜
- **日式金酒** / Japanese Gin — `#D6E2D6` · 柚子、山椒、樱花
- **白朗姆** / White Rum — `#EDE4CC` · 甘蔗、椰子、清爽
- **金朗姆** / Gold Rum — `#C68A45` · 焦糖、香草、橡木
- **黑朗姆** / Dark Rum — `#7A4423` · 糖蜜、可可、香料
- **农业朗姆** / Rhum Agricole — `#D8B36A` · 青草、甘蔗汁、矿物
- **白龙舌兰** / Blanco Tequila — `#E3D5A0` · 龙舌兰、青草、柑橘
- **微陈龙舌兰** / Reposado — `#D6B25E` · 烤龙舌兰、香草、橡木
- **梅斯卡尔** / Mezcal — `#C9A85A` · 烟熏、青草、矿物
- **伏特加** / Vodka — `#F2F4F0` · 干净、微甜、中性
- **黑麦伏特加** / Rye Vodka — `#ECEEE8` · 谷物、胡椒、圆润
- **干邑白兰地** / Cognac — `#A8521F` · 葡萄、蜜饯、雪松
- **雅文邑** / Armagnac — `#9C4A1C` · 李子、烟草、焦糖
- **卡尔瓦多斯** / Calvados — `#B5651D` · 苹果、梨、橡木
- **皮斯科** / Pisco — `#E4DBC0` · 葡萄、花香、青草
- **卡莎萨** / Cachaça — `#E6DCC2` · 甘蔗汁、青草、果香
- **中国白酒** / Baijiu — `#F0F2EC` · 高粱、曲香、浓烈

**利口酒 Liqueurs（26）**

- **君度橙酒** / Cointreau — `#E8E0CC` · 甜橙、清爽、柑橘
- **金万利** / Grand Marnier — `#C77F35` · 橙皮、干邑、焦糖
- **蓝橙利口酒** / Blue Curaçao — `#2E7FB0` · 苦橙、甜、亮蓝
- **黑樱桃利口酒** / Maraschino — `#E7DEC8` · 樱桃核、杏仁、花香
- **阿玛雷托** / Amaretto — `#A85A2C` · 杏仁、焦糖、杏核
- **咖啡利口酒** / Coffee Liqueur — `#3A2416` · 咖啡、焦糖、可可
- **接骨木花利口酒** / Elderflower — `#E4E6C8` · 接骨木、荔枝、花香
- **桃子利口酒** / Peach Schnapps — `#E9A66A` · 白桃、甜、多汁
- **椰子利口酒** / Coconut Liqueur — `#EFE8D6` · 椰子、奶香、热带
- **可可利口酒** / Crème de Cacao — `#5A3A22` · 可可、香草、甜
- **薄荷利口酒** / Crème de Menthe — `#5FB07E` · 薄荷、清凉、甜
- **紫罗兰利口酒** / Crème de Violette — `#6E4A86` · 紫罗兰、花香、莓果
- **黑加仑利口酒** / Crème de Cassis — `#4A1E33` · 黑加仑、莓果、酸甜
- **覆盆子利口酒** / Chambord — `#5A1E33` · 覆盆子、黑莓、蜂蜜
- **杏子白兰地** / Apricot Brandy — `#D08A40` · 杏、蜜饯、果核
- **樱桃利口酒** / Cherry Heering — `#6E1F2A` · 黑樱桃、杏仁、香料
- **绿查特酒** / Green Chartreuse — `#7E8C3A` · 草本、薄荷、辛香
- **黄查特酒** / Yellow Chartreuse — `#C9A93E` · 蜂蜜、草本、藏红花
- **修士酒** / Bénédictine — `#A87A38` · 蜂蜜、草本、香料
- **茴香酒** / Sambuca — `#ECE6D6` · 茴香、甘草、甜
- **爱尔兰奶油利口酒** / Irish Cream — `#C8A878` · 奶油、可可、威士忌
- **榛子利口酒** / Frangelico — `#9C6634` · 榛子、可可、香草
- **姜味利口酒** / Ginger Liqueur — `#D2A24A` · 生姜、蜂蜜、辛香
- **三干橙酒** / Triple Sec — `#E6DECA` · 甜橙、清爽、柑橘
- **龙舌兰橙酒** / Orange Curaçao — `#C98A3A` · 苦橙、香料、橡木
- **茴香烈酒** / Absinthe — `#9FB45A` · 茴香、苦艾、薄荷

**加强酒 Fortified（20）**

- **甜味美思** / Sweet Vermouth — `#7E2E30` · 香草、可可、苦橙
- **干味美思** / Dry Vermouth — `#C9B98A` · 草本、花香、干爽
- **白味美思** / Bianco Vermouth — `#D8CBA0` · 香草、花香、微甜
- **菲诺雪莉** / Fino Sherry — `#D8C98A` · 杏仁、海盐、干爽
- **阿蒙提亚多雪莉** / Amontillado — `#B5803E` · 榛子、焦糖、坚果
- **欧罗索雪莉** / Oloroso Sherry — `#8A4A22` · 核桃、无花果、橡木
- **佩德罗-希梅内斯** / Pedro Ximénez — `#3A1C12` · 葡萄干、糖蜜、无花果
- **红宝石波特** / Ruby Port — `#5A1722` · 黑莓、李子、甜
- **茶色波特** / Tawny Port — `#8A3A22` · 焦糖、坚果、干果
- **马德拉** / Madeira — `#7A3A1E` · 焦糖、坚果、烟熏
- **玛萨拉** / Marsala — `#8A4420` · 焦糖、杏、坚果
- **利莱白** / Lillet Blanc — `#E0CF96` · 蜜橙、花香、微苦
- **金巴利** / Campari — `#C5384A` · 苦橙、龙胆、红莓
- **阿佩罗** / Aperol — `#E8623A` · 苦橙、大黄、微甜
- **苏兹** / Suze — `#D6C24A` · 龙胆、草本、柑橘
- **菲奈特布兰卡** / Fernet-Branca — `#3A2018` · 薄荷、草本、苦
- **莎都斯** / Cynar — `#5A3320` · 朝鲜蓟、草本、苦甜
- **杜本内** / Dubonnet — `#5A1E2A` · 草本、苦橙、可可
- **公鸡美国佬** / Cocchi Americano — `#D8C078` · 龙胆、柑橘、草本
- **干型雪莉** / Manzanilla — `#D6C88A` · 海盐、杏仁、青苹果

**苦精 Bitters（18）**

- **安格仕苦精** / Angostura Bitters — `#5A2418` · 肉桂、丁香、龙胆
- **橙味苦精** / Orange Bitters — `#B5662A` · 橙皮、香料、苦
- **裴乔氏苦精** / Peychaud's Bitters — `#9E2A2A` · 茴香、樱桃、花香
- **巧克力苦精** / Chocolate Bitters — `#3A2016` · 可可、咖啡、香料
- **芹菜苦精** / Celery Bitters — `#6E7E3A` · 芹菜、草本、青涩
- **葡萄柚苦精** / Grapefruit Bitters — `#C9663A` · 葡萄柚、苦、柑橘
- **黑核桃苦精** / Black Walnut Bitters — `#4A2E1A` · 核桃、烤香、苦
- **樱桃苦精** / Cherry Bitters — `#7A2030` · 樱桃、杏仁、香料
- **芳香苦精** / Aromatic Bitters — `#5E2A1C` · 香料、木质、草本
- **烟熏苦精** / Smoke Bitters — `#3E2A20` · 烟熏、木炭、辛香
- **薰衣草苦精** / Lavender Bitters — `#7E6A9A` · 薰衣草、花香、草本
- **小豆蔻苦精** / Cardamom Bitters — `#8A6A3A` · 小豆蔻、柑橘、辛香
- **桃子苦精** / Peach Bitters — `#C98A4A` · 桃、果香、苦
- **咖啡苦精** / Coffee Bitters — `#3A2418` · 咖啡、焦糖、苦
- **茴香苦精** / Fennel Bitters — `#8A9A4A` · 茴香、甘草、草本
- **姜味苦精** / Ginger Bitters — `#B5803A` · 生姜、辛香、柑橘
- **玫瑰苦精** / Rose Bitters — `#A8506A` · 玫瑰、花香、苦
- **焦糖苦精** / Burnt Sugar Bitters — `#6A3A1E` · 焦糖、烤香、苦

**鲜果与果汁 Fruits & Juices（30）**

- **柠檬** / Lemon — `#E8C84A` · 酸、柑橘、清爽
- **青柠** / Lime — `#9FC24A` · 酸、青草、柑橘
- **橙子** / Orange — `#E8923A` · 甜橙、多汁、柑橘
- **血橙** / Blood Orange — `#C5402A` · 莓果、苦橙、柑橘
- **葡萄柚** / Grapefruit — `#E0654A` · 苦、酸、柑橘
- **柚子** / Yuzu — `#E0C84A` · 花香、酸、柑橘
- **金橘** / Kumquat — `#E8973A` · 苦甜、皮香、柑橘
- **草莓** / Strawberry — `#D83A4A` · 莓果、甜、多汁
- **覆盆子** / Raspberry — `#C5304A` · 莓果、酸甜、花香
- **蓝莓** / Blueberry — `#4A4A8A` · 莓果、甜、果酱
- **黑莓** / Blackberry — `#3A1E3A` · 莓果、深沉、酸甜
- **蔓越莓** / Cranberry — `#B5283A` · 酸、莓果、涩
- **樱桃** / Cherry — `#9E1F2A` · 甜、核香、多汁
- **桃子** / Peach — `#E8A86A` · 白桃、甜、多汁
- **杏** / Apricot — `#E0913A` · 杏、蜜饯、果核
- **李子** / Plum — `#6E2A4A` · 酸甜、深沉、果香
- **苹果** / Apple — `#9FC24A` · 青苹果、脆、清爽
- **梨** / Pear — `#C9D08A` · 多汁、花香、清甜
- **菠萝** / Pineapple — `#E8C23A` · 热带、酸甜、多汁
- **芒果** / Mango — `#E8A82A` · 热带、甜、浓郁
- **百香果** / Passion Fruit — `#D89A2A` · 热带、酸、芳香
- **西瓜** / Watermelon — `#E0566A` · 清爽、多汁、甜
- **葡萄** / Grape — `#5A2A5A` · 果香、甜、圆润
- **荔枝** / Lychee — `#E8D0C8` · 花香、甜、多汁
- **椰子** / Coconut — `#EFE8D6` · 奶香、热带、甜
- **石榴** / Pomegranate — `#A8283A` · 莓果、酸甜、涩
- **无花果** / Fig — `#6E3A2A` · 蜜甜、果酱、籽感
- **黑加仑** / Blackcurrant — `#3A1E3A` · 莓果、深沉、酸
- **哈密瓜** / Cantaloupe — `#E8B06A` · 清甜、多汁、花香
- **番石榴** / Guava — `#E07A6A` · 热带、花香、甜

**草本植物 Herbs（24）**

- **薄荷** / Mint — `#6EA84A` · 清凉、草本、清新
- **留兰香** / Spearmint — `#7EB05A` · 柔和薄荷、清新、甜
- **罗勒** / Basil — `#4A8A3A` · 草本、辛香、清新
- **迷迭香** / Rosemary — `#5A7A4A` · 松针、木质、草本
- **百里香** / Thyme — `#6E8A4A` · 草本、泥土、辛香
- **鼠尾草** / Sage — `#8A9A6A` · 草本、微苦、木质
- **薰衣草** / Lavender — `#8A6AA8` · 花香、草本、镇静
- **紫苏** / Shiso — `#7E5A8A` · 草本、薄荷、柑橘
- **香茅** / Lemongrass — `#A8B56A` · 柑橘、草本、清新
- **莳萝** / Dill — `#7E9A4A` · 草本、茴香、清新
- **龙蒿** / Tarragon — `#6E8A4A` · 茴香、草本、微甜
- **香菜** / Cilantro — `#5A8A3A` · 草本、柑橘、青涩
- **洋甘菊** / Chamomile — `#D8C86A` · 花香、苹果、蜂蜜
- **玫瑰花瓣** / Rose Petal — `#C56A86` · 玫瑰、花香、甜
- **茉莉** / Jasmine — `#E0E0C8` · 花香、清雅、甜
- **桂花** / Osmanthus — `#E0B85A` · 花香、蜜甜、杏
- **柠檬马鞭草** / Lemon Verbena — `#A8C26A` · 柠檬、草本、清新
- **月桂叶** / Bay Leaf — `#5A7A4A` · 木质、草本、辛香
- **苦艾草** / Wormwood — `#8A9A5A` · 苦、草本、茴香
- **啤酒花** / Hops — `#9AAB5A` · 苦、柑橘、松香
- **芦荟** / Aloe — `#A8C28A` · 清新、草本、微甜
- **接骨木花** / Elderflower — `#E0E2C0` · 花香、荔枝、蜂蜜
- **紫罗兰** / Violet — `#7E5A9A` · 花香、莓果、甜
- **柠檬香蜂草** / Lemon Balm — `#A8C25A` · 柠檬、薄荷、草本

**香料 Spices（24）**

- **肉桂** / Cinnamon — `#9C5A2A` · 温暖、甜、木质
- **丁香** / Clove — `#5A3320` · 辛香、温暖、药香
- **八角** / Star Anise — `#7A3A24` · 茴香、甘草、温暖
- **小豆蔻** / Cardamom — `#8A9A5A` · 辛香、柑橘、花香
- **黑胡椒** / Black Pepper — `#3A3028` · 辛辣、木质、温暖
- **粉红胡椒** / Pink Pepper — `#C56A5A` · 果香、辛香、温和
- **生姜** / Ginger — `#C99A4A` · 辛辣、温暖、柑橘
- **肉豆蔻** / Nutmeg — `#8A5A34` · 温暖、坚果、甜
- **香草** / Vanilla — `#D8C28A` · 甜、奶香、花香
- **藏红花** / Saffron — `#C5662A` · 花香、蜜甜、药香
- **茴香籽** / Fennel Seed — `#9AAB5A` · 茴香、甘草、清凉
- **芫荽籽** / Coriander Seed — `#B5A05A` · 柑橘、温暖、木质
- **杜松子** / Juniper Berry — `#5A6A4A` · 松针、树脂、草本
- **辣椒** / Chili — `#C5342A` · 辛辣、果香、温热
- **烟熏辣椒** / Chipotle — `#8A3A20` · 烟熏、辛辣、泥土
- **多香果** / Allspice — `#6E3A20` · 丁香、肉桂、肉豆蔻
- **甘草** / Licorice — `#3A2A24` · 甘草、甜、药香
- **可可粒** / Cacao Nib — `#4A2A1A` · 可可、苦、烤香
- **咖啡豆** / Coffee Bean — `#3A2418` · 咖啡、烤香、苦
- **山椒** / Sansho Pepper — `#8A9A4A` · 麻、柑橘、清凉
- **桂皮** / Cassia — `#9C5A2A` · 肉桂、甜、浓郁
- **香兰叶** / Pandan — `#5A8A4A` · 椰香、青草、甜
- **孜然** / Cumin — `#9C6634` · 泥土、温暖、辛香
- **黑芝麻** / Black Sesame — `#3A322C` · 坚果、烤香、醇厚

**糖浆与甜味 Syrups（22）**

- **单糖浆** / Simple Syrup — `#E6DECA` · 纯甜、中性、圆润
- **德梅拉拉糖浆** / Demerara Syrup — `#9C6634` · 焦糖、红糖、醇厚
- **蜂蜜糖浆** / Honey Syrup — `#D8A23A` · 蜂蜜、花香、甜
- **龙舌兰糖浆** / Agave Syrup — `#C9A24A` · 龙舌兰、清甜、温和
- **枫糖浆** / Maple Syrup — `#A8642A` · 枫糖、焦糖、木质
- **红石榴糖浆** / Grenadine — `#B5283A` · 石榴、莓果、甜
- **杏仁糖浆** / Orgeat — `#E0D2B0` · 杏仁、橙花、奶香
- **肉桂糖浆** / Cinnamon Syrup — `#9C5A2A` · 肉桂、温暖、甜
- **香草糖浆** / Vanilla Syrup — `#D8C28A` · 香草、奶香、甜
- **姜糖浆** / Ginger Syrup — `#C99A4A` · 生姜、辛香、甜
- **接骨木花糖浆** / Elderflower Cordial — `#E0E2C0` · 花香、荔枝、甜
- **玫瑰糖浆** / Rose Syrup — `#C56A86` · 玫瑰、花香、甜
- **薰衣草糖浆** / Lavender Syrup — `#8A6AA8` · 薰衣草、花香、甜
- **焦糖糖浆** / Caramel Syrup — `#8A4A1E` · 焦糖、烤香、甜
- **百香果糖浆** / Passion Fruit Syrup — `#D89A2A` · 百香果、热带、酸甜
- **草莓糖浆** / Strawberry Syrup — `#D83A4A` · 草莓、莓果、甜
- **覆盆子糖浆** / Raspberry Syrup — `#C5304A` · 覆盆子、莓果、酸甜
- **黑加仑糖浆** / Blackcurrant Syrup — `#4A1E33` · 黑加仑、莓果、酸甜
- **桂花糖浆** / Osmanthus Syrup — `#E0B85A` · 桂花、蜜甜、杏
- **咖啡糖浆** / Coffee Syrup — `#3A2418` · 咖啡、焦糖、甜
- **盐渍焦糖糖浆** / Salted Caramel — `#7A4420` · 焦糖、海盐、甜
- **柚子糖浆** / Yuzu Syrup — `#E0C84A` · 柚子、柑橘、花香

**气泡与软饮 Mixers（22）**

- **苏打水** / Soda Water — `#DCE6EA` · 气泡、中性、清爽
- **汤力水** / Tonic Water — `#D6E2E0` · 金鸡纳、微苦、气泡
- **姜汁汽水** / Ginger Ale — `#D8C88A` · 生姜、气泡、清甜
- **姜啤** / Ginger Beer — `#C9A24A` · 生姜、辛香、气泡
- **可乐** / Cola — `#5A3320` · 焦糖、香料、气泡
- **柠檬青柠汽水** / Lemon-Lime Soda — `#C9D88A` · 柑橘、清爽、气泡
- **苦柠檬汽水** / Bitter Lemon — `#D8D86A` · 柠檬、微苦、气泡
- **香槟** / Champagne — `#E0D8A8` · 气泡、烤面包、果香
- **普罗赛克** / Prosecco — `#E4DCB0` · 气泡、青苹果、花香
- **卡瓦** / Cava — `#E0D8A8` · 气泡、柑橘、矿物
- **红葡萄酒** / Red Wine — `#5A1722` · 黑果、单宁、橡木
- **白葡萄酒** / White Wine — `#D8CE96` · 青苹果、柑橘、花香
- **清酒** / Sake — `#E8E4D2` · 米香、花香、清雅
- **椰子水** / Coconut Water — `#E4E8DC` · 椰子、清爽、微甜
- **蔓越莓汁** / Cranberry Juice — `#B5283A` · 酸、莓果、涩
- **番茄汁** / Tomato Juice — `#C5402A` · 鲜咸、蔬菜、圆润
- **绿茶** / Green Tea — `#8AA85A` · 青草、涩、清雅
- **红茶** / Black Tea — `#8A4A22` · 单宁、麦芽、醇厚
- **乌龙茶** / Oolong Tea — `#A8702A` · 焙香、花香、醇厚
- **冷萃咖啡** / Cold Brew — `#3A2418` · 咖啡、焦糖、顺滑
- **椰奶** / Coconut Milk — `#EFE8D6` · 奶香、椰子、顺滑
- **淡奶油** / Light Cream — `#E8E0C8` · 奶香、顺滑、绵密

**点缀与香氛 Garnish（22）**

- **海盐** / Sea Salt — `#E6E6E0` · 咸、矿物、提味
- **盐边** / Salt Rim — `#E0E0DA` · 咸、脆、提味
- **糖边** / Sugar Rim — `#ECE4D0` · 甜、脆、装饰
- **烟熏** / Smoke — `#6A5A4A` · 烟熏、木质、香氛
- **蛋白** / Egg White — `#EFE9D8` · 绵密、泡沫、圆润
- **鲜奶油** / Cream — `#E8E0C8` · 奶香、绵密、顺滑
- **橙皮** / Orange Peel — `#E8923A` · 橙油、芳香、苦甜
- **柠檬皮卷** / Lemon Twist — `#E8C84A` · 柠檬油、芳香、清新
- **葡萄柚皮** / Grapefruit Peel — `#E0654A` · 果油、苦、芳香
- **黄瓜片** / Cucumber — `#A8C28A` · 清爽、青草、多汁
- **橄榄** / Olive — `#7E8A4A` · 咸鲜、油润、草本
- **腌洋葱** / Cocktail Onion — `#D8CBA0` · 酸、脆、咸鲜
- **马拉斯加樱桃** / Maraschino Cherry — `#9E1F2A` · 甜、樱桃、糖渍
- **食用花** / Edible Flower — `#C56A86` · 花香、清雅、装饰
- **金箔** / Gold Leaf — `#E3C684` · 奢华、装饰、中性
- **肉桂棒** / Cinnamon Stick — `#9C5A2A` · 肉桂、温暖、香氛
- **薄荷枝** / Mint Sprig — `#6EA84A` · 薄荷、清凉、香氛
- **迷迭香枝** / Rosemary Sprig — `#5A7A4A` · 松针、木质、香氛
- **可可粉** / Cocoa Powder — `#5A3A2A` · 可可、微苦、香氛
- **抹茶粉** / Matcha Powder — `#7EA84A` · 青草、微苦、醇厚
- **咖啡豆点缀** / Coffee Beans — `#3A2418` · 咖啡、烤香、香氛
- **脱水柑橘片** / Dried Citrus — `#D8923A` · 柑橘、焦香、装饰
