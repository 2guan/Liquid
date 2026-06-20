# 🍸 流体工坊（The Liquid Atelier）
# 产品设计与交互体验规格文档

---

# 1. 产品愿景（Product Vision）

“流体工坊”是一款AI驱动的沉浸式数字调酒体验应用。

核心目标：

- 🎨 将复古英式酒吧视觉数字化
- 🧠 将AI转化为“调酒师 + 诗人 + 化学家”
- 🍸 将调酒过程转化为互动式艺术体验
- 📓 将每一杯酒转化为可收藏的情绪记忆

---

# 2. 视觉系统（Visual System）

## 2.1 核心美学

- 复古英式酒吧
- 手绘写实插画风格
- 暖琥珀色灯光
- 深色桃花心木材质
- 铜质与玻璃高光反射

---

## 2.2 UI关键词

- Warm / Dark / Amber lighting
- Hand-drawn illustration
- Vintage bar atmosphere
- Paper texture + wood texture
- Cinematic close-up lighting

---

# 3. 四大核心模式（Core Experience Modes）

---

## 3.1 纯饮模式 Pure Pour

### 定位
探索单一烈酒的本质表达

### 流程
SELECT_GLASS → SELECT_SPIRIT → POUR → ICE → RESULT

### 体验特点
- 长按倒酒动画
- 冰块融化视觉反馈
- 酒液光影折射模拟

---

## 3.2 调酒模式 Mixology Chronicles

### 定位
经典鸡尾酒制作 + 精准配比挑战

### 流程
SELECT_RECIPE → INGREDIENT_LAYERING → TIMING_ACTION → RESULT

### 体验特点
- 比例刻度控制
- 摇壶霜化动画
- 成功/失败反馈机制

---

## 3.3 微醺模式 Mood Pour

### 定位
情绪 → AI → 酒的生成系统

### 流程
INPUT_EMOTION → AI_GENERATE → RENDER → JOURNAL

### AI输出
- 酒名
- 配方
- 风味隐喻
- 情绪映射散文

---

## 3.4 禅意模式 Zen Atelier

### 定位
自由创作 + 风味实验空间

### 流程
FREE_MIX → GRAPH_BUILD → AI_ANALYSIS → RESULT

### 特点
- 非线性组合
- 植物风味扩散动画
- 隐藏配方解锁机制

---

# 4. AI系统设计（AI Experience Layer）

## 4.1 AI角色定义

- 🍸 Master Mixologist（调酒师）
- 📖 Flavor Poet（风味诗人）
- 🧪 Taste Chemist（风味化学家）

---

## 4.2 AI输出结构（统一标准）

```json
{
  "name": "",
  "ingredients": [],
  "ratio": [],
  "glass": "",
  "taste_profile": "",
  "story": "",
  "emotion_mapping": ""
}
```

---

## 5. 游戏化系统（Gamification）

## 5.1 工坊阶级系统

- Barback（见习）
- Apprentice Mixologist（学徒）
- Flavor Architect（风味架构师）
- Master Mixologist（首席调酒师）

---

## 5.2 解锁机制

- 完成经典配方
- 触发隐藏AI酒款
- 在Zen模式中生成匹配配方

---

# 6. 流体日记系统（Liquid Journal）

## 功能

- 自动生成酒卡片
- AI生成诗意描述
- 可导出分享图
- 可收藏回顾

---

## 数据结构

```json
{
  "title": "",
  "drink": "",
  "recipe": "",
  "tasting_notes": "",
  "ai_poem": "",
  "image": ""
}
```

---

# 7. 用户核心交互流程（UX Flow）

## 7.1 主循环

进入APP → 选择模式 → 调酒交互 → AI生成结果 → 日记保存

---

## 7.2 核心体验节奏

- 选择（Choice）
- 操作（Interaction）
- 生成（AI Creation）
- 沉浸（Narrative）
- 记录（Memory）

---

# 8. 页面结构（Screens）

- Home / Mode Select
- Pure Pour Scene
- Mixology Table
- Mood Input Interface
- Zen Atelier Canvas
- Result Story Page
- Liquid Journal Archive

---

# 9. 动效原则（Motion Principles）

- 液体 = 流体模拟
- 冰 = 冷却渐变 + crack effect
- 酒 = 光折射 shimmer
- UI切换 = 纸张翻页 / 镜头推拉

---

# 10. 设计核心总结

> “流体工坊”不是一个工具类应用，而是一个：

🎭 AI驱动的沉浸式风味叙事系统
