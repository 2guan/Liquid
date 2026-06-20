# 🍸 流体工坊（The Liquid Atelier）技术架构文档

## 1. 项目概述
本项目是一个AI驱动的沉浸式数字调酒应用，通过手绘复古酒吧风格UI + AI生成调酒内容，实现互动式风味体验。

---

## 2. 总体架构

Frontend (Next.js + Canvas UI)
        ↓
Backend API (FastAPI)
        ↓
AI Orchestration Layer (Prompt Engine / Agent)
        ↓
LLM (GPT-4.1 / Claude / Local LLM)

---

## 3. 前端架构

技术栈：
- Next.js 14
- TypeScript
- TailwindCSS
- Framer Motion
- Canvas / SVG
- Zustand

UI结构：
AppLayout {
  Sidebar
  MainCanvas
  DetailPanel
  ActionBar
}

UI原则：
- JSON驱动UI
- 纯渲染层，不含业务逻辑
- 状态机驱动交互

---

## 4. 核心页面状态机

Pure Pour:
SELECT_GLASS → SELECT_SPIRIT → POUR → ICE → RESULT

Mood Pour:
INPUT → AI_GENERATE → RENDER → SAVE

Zen Atelier:
MIX → GRAPH_VALIDATE → RESULT / NEW_RECIPE

---

## 5. 后端架构

技术栈：
- FastAPI
- PostgreSQL
- Redis
- S3/OSS

核心API：
POST /pure-pour
POST /mood-pour
POST /zen-mix
POST /journal/save

---

## 6. AI系统架构

CocktailAI核心能力：
- generateRecipe()
- generateStory()
- validateMix()
- unlockHiddenCocktail()

Prompt原则：
- 必须输出JSON结构
- 所有内容结构化
- 禁止纯文本输出作为核心数据

---

## 7. 数据模型

Drink {
  id
  name
  base_spirit
  ingredients
  story
}

Journal {
  id
  drink
  ai_poem
  image
  created_at
}

---

## 8. 动效系统

- Canvas流体模拟（倒酒）
- Shader冰块裂纹
- Framer Motion页面切换
- Lottie辅助动画

---

## 9. AI可编程原则

关键原则：
1. UI = JSON
2. 逻辑 = 状态机
3. 内容 = AI生成
4. 前端 = Renderer

---

## 10. MVP路径

1. JSON UI Renderer
2. Pure Pour模式
3. Mood AI生成
4. Journal卡片系统
5. Zen Atelier模式
