# 微醺时刻 · The Sip & Sigh

> AI 驱动的沉浸式数字调酒体验。倒一杯酒，调一段心情，让每一杯成为可收藏的情绪记忆。

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)
![Zustand](https://img.shields.io/badge/Zustand-4.5-brown)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed)

「微醺时刻」把复古英式酒吧的暖琥珀灯光、手绘写实质感、铜与玻璃的高光搬进 Web。项目以 Next.js App Router 构建，围绕四种创作模式展开：纯饮、经典调酒、情绪微醺和禅意自由混合。所有结果都会沉淀为可收藏、可导出的酒卡。

本仓库是完整网页端实现，适配横屏平板、桌面与竖屏手机；AI 层默认通过服务端路由接入 DeepSeek，失败时自动回退到内置离线生成器。

## 目录

- [功能亮点](#功能亮点)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [AI 架构](#ai-架构)
- [项目结构](#项目结构)
- [Docker 部署](#docker-部署)
- [设计与美术](#设计与美术)
- [可用脚本](#可用脚本)
- [许可](#许可)

## 功能亮点

### 四大创作模式

- **纯饮 The Pure Pour**
  选杯、选基酒、长按倒酒、黄金注酒线判定、选冰，最终生成一张纯饮品鉴卡。
- **调酒 The Mixology Chronicles**
  选择经典配方，调整比例刻度，完成手法定时小游戏，并根据完成度生成反馈。
- **微醺 The Mood Pour**
  输入文字心情与心绪标签，由 AI 生成专属酒名、配方、风味笔记、情绪映射与散文叙事。
- **禅意 The Zen Atelier**
  自由拖拽风味节点构建风味图谱，AI 分析组合和谐度，并有机会解锁隐藏经典配方。

### 收藏、分享与成长

- **Liquid Journal 微醺日记**
  自动保存酒卡，支持重温、删除与导出分享卡。
- **Library 酒库**
  陈列 12 款基酒及其风味信息，可直接以指定酒款开始纯饮流程。
- **Achievements 成就系统**
  记录倒酒次数、隐藏配方解锁、经验值与工坊阶级。
- **本地持久化**
  使用 Zustand persist 保存日记、经验、成就和偏好，不依赖后端数据库即可运行。

## 技术栈

| 层级 | 选型 | 用途 |
| --- | --- | --- |
| 框架 | Next.js 14 App Router | 页面、服务端 API 路由、生产构建 |
| 语言 | TypeScript 5.5 | 领域模型、状态机、AI 输出契约 |
| UI | React 18 | 组件化交互界面 |
| 样式 | TailwindCSS 3.4 | 设计 token、响应式布局、暗色酒吧氛围 |
| 动效 | Framer Motion 11 + CSS | 页面转场、倒酒、液面、冰霜、微交互 |
| 状态 | Zustand 4 + persist | 导航、进度、日记、成就与偏好 |
| AI | DeepSeek Chat Completions + 离线生成器 | 情绪调酒、纯饮品鉴、禅意混合分析 |
| 部署 | Docker / Docker Compose | standalone Next.js 生产镜像 |

## 快速开始

```bash
npm install
cp .env.example .env.local
npm run dev
```

开发服务器默认运行在：

```text
http://localhost:3210
```

如果没有配置 `DEEPSEEK_API_KEY`，应用仍然可以完整体验，会自动使用内置离线生成器。

## 环境变量

复制示例配置：

```bash
cp .env.example .env.local
```

常用配置：

```bash
# DeepSeek 服务端密钥；不要加 NEXT_PUBLIC_ 前缀
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 可选，默认 https://api.deepseek.com
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 可选，默认 deepseek-chat；示例配置使用 deepseek-v4-flash
DEEPSEEK_MODEL=deepseek-v4-flash

# 可选，客户端 AI 入口；默认调用同源 /api
NEXT_PUBLIC_AI_ENDPOINT=/api

# Docker only：对外发布端口，容器内部固定监听 3000
HOST_PORT=3210
```

安全说明：

- `.env` 与 `.env.local` 已被 `.gitignore` 排除。
- `DEEPSEEK_*` 只在 Next.js 服务端 API 路由中读取，不会打包进浏览器。
- 浏览器只调用本应用同源的 `/api/mood-pour`、`/api/pure-pour`、`/api/zen-mix`。

## AI 架构

核心抽象位于 `src/lib/ai/`：

```text
cocktailAI.ts   CocktailAI 接口、HybridCocktailAI、RemoteCocktailAI、MockCocktailAI
deepseek.ts     服务端 DeepSeek 接入、JSON 模式请求、输出规范化
composer.ts     离线生成器的名称、故事、风味与情绪组合逻辑
lexicon.ts      调酒叙事词库与俏皮签名
rng.ts          基于输入哈希的可复现随机
```

运行链路：

```text
浏览器 UI
  ↓
HybridCocktailAI
  ↓
/api/{mood-pour,pure-pour,zen-mix}
  ↓
DeepSeek Chat Completions
```

兜底链路：

```text
DeepSeek 调用失败
  ↓
服务端离线生成器
  ↓
若 API 路由不可达，客户端再回退到离线生成器
```

统一输出契约：

```json
{
  "name": "孤独的高地海岸",
  "nameEn": "Lonely Highland Coast",
  "ingredients": [
    {
      "name": "泰斯卡 10 年",
      "nameEn": "Talisker 10",
      "amount": "60ml",
      "parts": 1,
      "family": "whiskyPeat"
    }
  ],
  "ratio": [1],
  "glass": "glencairn",
  "ice": "sphere",
  "family": "whiskyPeat",
  "taste_profile": "海盐、泥煤与烘烤麦芽在杯中展开……",
  "story": "雾从高地海岸卷来，灯塔把孤独照成琥珀色。",
  "emotion_mapping": "把疲惫折进烟雾，让夜晚慢慢松开。",
  "hidden": false
}
```

## 项目结构

```text
.
├── src
│   ├── app
│   │   ├── api                # mood-pour / pure-pour / zen-mix 服务端路由
│   │   ├── globals.css        # 全局样式、字体、材质、动画
│   │   ├── layout.tsx         # 根布局与 metadata
│   │   └── page.tsx           # AppShell 入口
│   ├── components
│   │   ├── art                # 参数化 SVG：酒杯、酒瓶、冰、Logo、场景、图标
│   │   ├── layout             # 侧栏、顶栏、移动端导航、应用外壳
│   │   ├── screens            # 首页、四模式、结果、酒库、日记、成就
│   │   └── ui                 # Button、原子组件、加载层
│   ├── hooks                  # 响应式布局判定
│   ├── lib
│   │   ├── ai                 # AI 编排、DeepSeek、离线生成器
│   │   ├── data               # 酒、杯、冰、配方、心绪、风味数据
│   │   ├── share.ts           # 分享酒卡导出
│   │   └── tokens.ts          # 色彩、酒液家族、设计 token
│   ├── store                  # Zustand 状态与持久化
│   └── types                  # 领域模型与 AI 输出契约
├── public
│   └── fonts                  # 自托管中文字体
├── design-reference           # 产品、架构、Figma 设计系统参考
├── ASSETS.md                  # 内置美术与可选写实升级资源说明
├── DEPLOY.md                  # 部署指南
├── Dockerfile
└── docker-compose.yml
```

## Docker 部署

准备环境变量：

```bash
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY；也可以调整 HOST_PORT
```

构建并启动：

```bash
docker compose up -d --build
```

访问：

```text
http://<server-ip>:3210
```

常用命令：

```bash
docker compose logs -f
docker compose ps
docker compose restart
docker compose down
docker compose up -d --build
```

不用 Compose 的等价命令：

```bash
docker build -t liquid-atelier .
docker run -d --name liquid-atelier --restart unless-stopped \
  -p 3210:3000 --env-file .env liquid-atelier
```

生产镜像使用 Next.js `output: "standalone"` 多阶段构建，只携带运行所需的 server bundle、静态资源与 `public/`。运行阶段使用非 root 用户。

## 设计与美术

项目不依赖外部图片即可完整运行。以下元素均由代码生成：

- 酒杯、酒瓶、冰块、液体、倒酒流
- Logo、模式徽章、全套线描 UI 图标
- 高地海岸、植物温室、雪原、夜色、琥珀吧台等场景背景
- 木纹、纸张、琥珀光、胶片颗粒材质
- 分享酒卡 SVG 导出

设计系统参考 `design-reference/liquid_atelier_figma_design_system.md`，主要 token 包括：

- 背景：`#0E0B08`
- 木色：`#3B2A1F`
- 金色：`#C8A45D`
- 琥珀：`#D89C3A`
- 纸色：`#E7D6B1`
- 字体：Cinzel、Cormorant Garamond、Inter、Maoken Fengyasong / Songti fallback

如需升级为更写实的油画质感，可按 `ASSETS.md` 中的文件名、尺寸和提示词生成 `public/art/*` 资源，并在相应组件中优先使用图片、保留 SVG 兜底。

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
