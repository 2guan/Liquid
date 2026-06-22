# 微醺时刻 · The Sip & Sigh

> AI 驱动的沉浸式数字调酒体验。倒一杯酒，调一段心情，让每一杯成为可收藏的情绪记忆。

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)
![Zustand](https://img.shields.io/badge/Zustand-4.5-brown)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed)

「微醺时刻」把复古英式酒吧的暖琥珀灯光、手绘写实质感、铜与玻璃的高光搬进 Web。整页以 Next.js App Router 构建，首页是一张古董药剂师风格的「塔罗牌桌」，引向四种创作模式：**纯饮 · 酒谱 · 心事 · 魔法**。每一杯的结果都会沉淀为一张可收藏、可导出的酒卡——内嵌中文字体、冰与气泡、植物点缀，以及一枚指向网站的二维码。

整个应用零外部图片、零音频文件即可运行：所有酒杯、酒液、冰、装饰、场景、材质都由参数化 SVG / Canvas 生成，环境氛围由 Web Audio 程序化合成。AI 层默认通过服务端路由接入 DeepSeek，任何一环失败都会优雅回退到内置的离线「诗人」。

## 目录

- [功能亮点](#功能亮点)
- [内容库](#内容库)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [AI 架构](#ai-架构)
- [分享酒卡](#分享酒卡)
- [项目结构](#项目结构)
- [Docker 部署](#docker-部署)
- [设计与美术](#设计与美术)
- [可用脚本](#可用脚本)
- [许可](#许可)

## 功能亮点

### 四大创作模式

- **纯饮 · The Pure Pour**
  选杯型、选基酒、长按倒酒（黄金注酒线判定）、选冰，由 AI 写出这一杯的品鉴笔记与散文叙事，并自动搭配一味香气点缀。
- **酒谱 · The Liquid Codex**
  挑选经典配方，调整比例刻度，完成「手法定时」小游戏；根据复刻精准度评分，并由 AI 为这杯经典撰写专属品鉴散文。
- **心事 · Whisper of Mood**
  输入此刻的心情文字与心绪标签，AI 生成专属酒名、配方、风味笔记、情绪映射与诗意叙事。
- **魔法 · The Alchemy Atelier**
  在自由画布上组合风味原料，AI 以风味化学家的视角分析组合和谐度，并有机会触发隐藏经典配方。

> 四种模式全部走同一条「AI 优先、离线兜底」的链路，确保无网络 / 无密钥时仍可完整体验。

### 收藏、分享与成长

- **微醺日记 · Liquid Journal** — 自动封存酒卡，可重温、删除与导出分享卡。
- **酒库 · The Cellar** — 陈列数百款基酒及其产地、ABV 与风味，可直接以某款酒开始纯饮。
- **成就 · 工坊档案** — 记录调制次数、隐藏配方解锁、经验值与工坊阶级，并管理音效偏好。
- **本地持久化** — Zustand persist 保存日记、经验、成就与偏好，无需后端数据库即可运行。
- **氛围音** — 可选的程序化「慵懒爵士」环境音（七和弦琶音 + 轻步行贝斯 + 烟雾房间声），全部由 Web Audio 实时合成。

### 一屏自适应

首页与各功能页均适配竖屏手机与横屏平板 / 桌面：首页四张牌在任意朝向都收在一屏内；模式流程的「上一步 / 下一步 / 分析」按钮在手机上固定于屏幕底部并预留安全区留白。

## 内容库

| 类别 | 数量 | 文件 |
| --- | --- | --- |
| 杯型 | 36 款参数化杯型 | `src/lib/data/glasses.ts` |
| 基酒 | 218 款（按品类分组、可搜索） | `src/lib/data/spirits.ts` |
| 经典配方 | 213 款（黄金时代 / 禁酒年代 / 提基 / 现代精酿 / 无酒精） | `src/lib/data/recipes.ts` |
| 风味原料 | 237 种（10 大品类，供「魔法」模式自由组合） | `src/lib/data/flavors.ts` |
| 装饰 | 27 类杯中 / 杯沿点缀，含浸没光影与挂壁 | `src/lib/data/garnish.ts` |

完整目录与美术规格见 [`ASSETS.md`](ASSETS.md)。

## 技术栈

| 层级 | 选型 | 用途 |
| --- | --- | --- |
| 框架 | Next.js 14 App Router | 页面、服务端 API 路由、standalone 生产构建 |
| 语言 | TypeScript 5.5 | 领域模型、状态机、AI 输出契约 |
| UI | React 18 | 组件化交互界面 |
| 样式 | TailwindCSS 3.4 | 设计 token、响应式布局、暗色酒吧氛围 |
| 动效 | Framer Motion 11 + CSS | 页面转场、倒酒、液面、冰霜、微交互 |
| 状态 | Zustand 4 + persist | 导航、进度、日记、成就与偏好 |
| AI | DeepSeek Chat Completions + 内置离线生成器 | 四模式酒名 / 配方 / 品鉴 / 叙事生成 |
| 音频 | Web Audio API（程序化合成） | 爵士环境音与交互音效 |
| 导出 | Canvas → PNG + `qrcode` | 内嵌中文字体的酒卡与访问二维码 |
| 部署 | Docker / Docker Compose | standalone Next.js 生产镜像 |

## 快速开始

```bash
npm install
cp .env.example .env.local
npm run dev
```

开发服务器默认运行在 `http://localhost:3210`。

未配置 `DEEPSEEK_API_KEY` 时应用仍可完整体验，会自动使用内置离线生成器。

## 环境变量

```bash
cp .env.example .env.local
```

```bash
# DeepSeek 服务端密钥；不要加 NEXT_PUBLIC_ 前缀（仅在服务端读取）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 可选，默认 https://api.deepseek.com
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 可选，默认 deepseek-chat；示例配置使用 deepseek-v4-flash
DEEPSEEK_MODEL=deepseek-v4-flash

# 可选，客户端 AI 入口；默认调用同源 /api
NEXT_PUBLIC_AI_ENDPOINT=/api

# 可选，导出酒卡二维码指向的站点地址；
# 未设置时回退到当前页面 origin（部署后通常自动正确）
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Docker only：对外发布端口，容器内部固定监听 3000
HOST_PORT=3210
```

安全说明：

- `.env` 与 `.env.local` 已被 `.gitignore` 排除。
- `DEEPSEEK_*` 只在 Next.js 服务端 API 路由中读取，不会打包进浏览器。
- 浏览器只调用本应用同源的 `/api/mood-pour`、`/api/pure-pour`、`/api/zen-mix`、`/api/mixology`。

## AI 架构

核心抽象位于 `src/lib/ai/`：

```text
cocktailAI.ts   CocktailAI 接口 + Hybrid / Remote / Mock 三种实现
deepseek.ts     服务端 DeepSeek 接入、JSON 模式请求、输出规范化
composer.ts     离线生成器：酒名 / 配方 / 风味 / 故事，及酒谱结果装配
lexicon.ts      调酒叙事词库与俏皮签名（落款）
rng.ts          基于输入哈希的可复现随机
```

`CocktailAI` 暴露四个方法，分别对应四种模式：

| 方法 | 模式 | 服务端路由 |
| --- | --- | --- |
| `generateFromMood` | 心事 | `/api/mood-pour` |
| `describePour` | 纯饮 | `/api/pure-pour` |
| `analyzeFlavorMix` | 魔法 | `/api/zen-mix` |
| `describeMix` | 酒谱 | `/api/mixology` |

运行链路（逐层兜底，永不报错给用户）：

```text
浏览器 UI
  ↓
HybridCocktailAI               ← 远程优先，异常即回退
  ↓
/api/{mood-pour,pure-pour,zen-mix,mixology}
  ↓
DeepSeek Chat Completions      ← 失败时服务端切换离线生成器
  ↓
（路由也不可达时，客户端再回退到离线生成器）
```

统一输出契约（`CocktailResult`）：

```json
{
  "name": "孤独的高地海岸",
  "nameEn": "Lonely Highland Coast",
  "ingredients": [
    { "name": "泰斯卡 10 年", "nameEn": "Talisker 10", "amount": "60ml", "parts": 1, "family": "whiskyPeat" }
  ],
  "ratio": [1],
  "glass": "glencairn",
  "ice": "sphere",
  "family": "whiskyPeat",
  "taste_profile": "海盐、泥煤与烘烤麦芽在杯中展开……",
  "story": "雾从高地海岸卷来，灯塔把孤独照成琥珀色。\n—— 把周一调成周五的魔法师",
  "emotion_mapping": "把疲惫折进烟雾，让夜晚慢慢松开。",
  "hidden": false
}
```

酒液颜色由 `inferLiquidFamily(ingredients)` 依据真实配料推断（例如加了可乐的长岛冰茶会呈茶褐色，而非默认基酒色）。

## 分享酒卡

「导出酒卡」把结果绘制到 `<canvas>` 再输出 PNG（`src/lib/share.ts`），因此能把页面正在使用的中文字体 **猫啃网风雅宋** 直接烤进像素，分享到任何设备都不掉字。卡面与应用内完全一致：

- 真实杯型轮廓、酒液渐变、冰球 / 方冰 / 碎冰、气泡（气泡酒）与杯中 / 杯沿装饰；
- 专属配方、品鉴笔记与散文叙事，落款右对齐；
- 「微醺絮语」分隔线右侧一枚半透明金色二维码，扫码访问站点（地址取自 `NEXT_PUBLIC_SITE_URL`，否则当前 origin）。

## 项目结构

```text
.
├── src
│   ├── app
│   │   ├── api                # mood-pour / pure-pour / zen-mix / mixology 服务端路由
│   │   ├── globals.css        # 全局样式、字体、材质、动画
│   │   ├── layout.tsx         # 根布局与 metadata
│   │   └── page.tsx           # AppShell 入口
│   ├── components
│   │   ├── art                # 参数化 SVG：酒杯、酒瓶、冰、装饰、Logo、场景、图标
│   │   ├── layout             # 侧栏、顶栏、移动端外壳、AppShell
│   │   ├── screens            # 首页、四模式、结果、酒库、日记、成就
│   │   └── ui                 # Button、原子组件、装饰件(ornaments)、加载层
│   ├── hooks                  # 响应式布局判定
│   ├── lib
│   │   ├── ai                 # AI 编排、DeepSeek、离线生成器
│   │   ├── data               # 杯、酒、冰、配方、心绪、风味、装饰数据
│   │   ├── share.ts           # Canvas → PNG 酒卡导出（含二维码）
│   │   ├── sound.ts           # 程序化爵士环境音与交互音效
│   │   └── tokens.ts          # 色彩、酒液家族、设计 token
│   ├── store                  # Zustand 状态与持久化
│   └── types                  # 领域模型与 AI 输出契约
├── public
│   └── fonts                  # 自托管中文字体（猫啃网风雅宋）
├── design-reference           # 产品、架构、Figma 设计系统参考
├── ASSETS.md                  # 内置美术与完整目录（基酒 / 配方 / 风味）
├── DEPLOY.md                  # 部署指南
├── Dockerfile
└── docker-compose.yml
```

## Docker 部署

```bash
cp .env.example .env          # 填入 DEEPSEEK_API_KEY，可调整 HOST_PORT
docker compose up -d --build
```

访问 `http://<server-ip>:3210`。常用命令：

```bash
docker compose logs -f
docker compose ps
docker compose restart
docker compose down
```

不用 Compose 的等价命令：

```bash
docker build -t liquid-atelier .
docker run -d --name liquid-atelier --restart unless-stopped \
  -p 3210:3000 --env-file .env liquid-atelier
```

生产镜像使用 Next.js `output: "standalone"` 多阶段构建，只携带运行所需的 server bundle、静态资源与 `public/`，运行阶段使用非 root 用户。更多细节见 [`DEPLOY.md`](DEPLOY.md)。

## 设计与美术

项目不依赖外部图片即可完整运行，以下元素均由代码生成：

- 酒杯、酒瓶、冰块、液体、倒酒流、杯中 / 杯沿装饰；
- Logo、模式徽章、全套线描 UI 图标；
- 高地海岸、植物温室、雪原、夜色、琥珀吧台等场景背景；
- 木纹、纸张、琥珀光、胶片颗粒材质；
- 首页古董药剂师卡面、铜质徽章导航、纸质吊牌与封蜡印章；
- Canvas 酒卡导出与访问二维码。

设计系统参考 `design-reference/liquid_atelier_figma_design_system.md`，主要 token：

- 背景 `#0E0B08` · 木色 `#3B2A1F` · 金色 `#C8A45D` · 琥珀 `#D89C3A` · 纸色 `#E7D6B1`
- 字体：Cinzel、Cormorant Garamond、Inter、猫啃网风雅宋（Songti 兜底）

如需升级为更写实的油画质感，可按 `ASSETS.md` 中的文件名、尺寸与提示词生成 `public/art/*` 资源，并在相应组件中优先使用图片、保留 SVG 兜底。

## 可用脚本

```bash
npm run dev        # 本地开发，http://localhost:3210
npm run build      # 生产构建
npm run start      # 启动生产构建
npm run typecheck  # TypeScript 类型检查
npm run lint       # Next.js lint
```

## 许可

本项目为「微醺时刻 · The Sip & Sigh」概念产品实现，供学习、演示与作品集展示使用。
