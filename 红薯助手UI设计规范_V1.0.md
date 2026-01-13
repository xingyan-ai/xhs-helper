# 红薯助手 UI 设计规范 V1.0

**设计风格**：现代简约 · 卡片式 · 轻质感  
**设计灵感**：YouMind AI Creation Studio  
**创建日期**：2025-01-03

---

## 📐 目录

1. [设计理念](#1-设计理念)
2. [配色方案](#2-配色方案)
3. [字体规范](#3-字体规范)
4. [间距系统](#4-间距系统)
5. [组件设计](#5-组件设计)
6. [页面布局](#6-页面布局)
7. [动效规范](#7-动效规范)
8. [响应式设计](#8-响应式设计)
9. [CSS实现代码](#9-css实现代码)

---

## 1. 设计理念

### 1.1 核心设计原则

**简洁优雅**
- 去除一切不必要的装饰
- 以内容和功能为核心
- 用留白创造呼吸感

**亲和友好**
- 柔和的圆角设计
- 温暖的配色方案
- 清晰的信息层级

**专业高效**
- 一目了然的操作流程
- 即时的状态反馈
- 流畅的交互体验

### 1.2 设计关键词

```
轻量 | 现代 | 卡片 | 圆润 | 柔和 | 简洁
```

---

## 2. 配色方案

### 2.1 主色调系统

**基于"红薯"意象的自然配色**

```css
/* 主品牌色 - 红薯橙 */
--primary-50:   #FFF4E6;   /* 极浅橙 - 背景使用 */
--primary-100:  #FFE8CC;   /* 浅橙 - 悬停背景 */
--primary-200:  #FFD8A8;   /* 淡橙 */
--primary-300:  #FFC078;   /* 中浅橙 */
--primary-400:  #FFA94D;   /* 中橙 */
--primary-500:  #FF8C29;   /* 标准橙 - 主按钮 ⭐ */
--primary-600:  #E67817;   /* 深橙 - 悬停状态 */
--primary-700:  #C25F0A;   /* 更深橙 */
--primary-800:  #994900;   /* 暗橙 */
--primary-900:  #703600;   /* 极深橙 */

/* 辅助色 - 藤蔓绿 */
--secondary-50:  #F0F9F4;   /* 极浅绿 */
--secondary-100: #D4EFE0;   /* 浅绿 */
--secondary-200: #A8DFBB;   /* 淡绿 */
--secondary-300: #7AC896;   /* 中浅绿 */
--secondary-400: #4FB276;   /* 中绿 */
--secondary-500: #2D9D5D;   /* 标准绿 - 辅助按钮 ⭐ */
--secondary-600: #1F8A4F;   /* 深绿 */
--secondary-700: #157741;   /* 更深绿 */
--secondary-800: #0D6333;   /* 暗绿 */
--secondary-900: #074F26;   /* 极深绿 */
```

### 2.2 中性色系统

**柔和灰阶 - 营造舒适阅读体验**

```css
/* 中性色 - 柔和灰 */
--neutral-0:   #FFFFFF;   /* 纯白 - 卡片背景 */
--neutral-50:  #FAFBFC;   /* 极浅灰 - 浅色背景 */
--neutral-100: #F4F6F8;   /* 浅灰 - 主背景 ⭐ */
--neutral-200: #E8ECEF;   /* 淡灰 - 分割线 */
--neutral-300: #D1D7DC;   /* 中浅灰 - 边框 */
--neutral-400: #B0B8BF;   /* 中灰 - 禁用文字 */
--neutral-500: #8A939C;   /* 标准灰 - 次要文字 ⭐ */
--neutral-600: #6B7580;   /* 深灰 - 辅助文字 */
--neutral-700: #4E5761;   /* 更深灰 - 正文 ⭐ */
--neutral-800: #31373E;   /* 暗灰 - 标题 */
--neutral-900: #1A1F25;   /* 极深灰 - 强调标题 */
```

### 2.3 功能色系统

**清晰的状态表达**

```css
/* 成功色 - 清新绿 */
--success-50:  #EDFBF2;
--success-500: #22C55E;   /* 标准成功色 ⭐ */
--success-600: #16A34A;   /* 深成功色 */

/* 警告色 - 琥珀黄 */
--warning-50:  #FFFBEB;
--warning-500: #F59E0B;   /* 标准警告色 ⭐ */
--warning-600: #D97706;   /* 深警告色 */

/* 错误色 - 柔和红 */
--error-50:    #FEF2F2;
--error-500:   #EF4444;   /* 标准错误色 ⭐ */
--error-600:   #DC2626;   /* 深错误色 */

/* 信息色 - 天空蓝 */
--info-50:     #F0F9FF;
--info-500:    #3B82F6;   /* 标准信息色 ⭐ */
--info-600:    #2563EB;   /* 深信息色 */
```

### 2.4 应用场景映射

| 元素 | 配色 | CSS变量 |
|------|------|---------|
| **主背景** | 极浅灰 #F4F6F8 | `var(--neutral-100)` |
| **卡片背景** | 纯白 #FFFFFF | `var(--neutral-0)` |
| **主按钮** | 红薯橙 #FF8C29 | `var(--primary-500)` |
| **主按钮悬停** | 深橙 #E67817 | `var(--primary-600)` |
| **辅助按钮** | 藤蔓绿 #2D9D5D | `var(--secondary-500)` |
| **标题文字** | 暗灰 #31373E | `var(--neutral-800)` |
| **正文文字** | 深灰 #4E5761 | `var(--neutral-700)` |
| **次要文字** | 标准灰 #8A939C | `var(--neutral-500)` |
| **分割线** | 淡灰 #E8ECEF | `var(--neutral-200)` |
| **边框** | 中浅灰 #D1D7DC | `var(--neutral-300)` |

---

## 3. 字体规范

### 3.1 字体家族

```css
/* 主字体 - 系统默认字体栈 */
--font-family-base: 
  -apple-system, 
  BlinkMacSystemFont, 
  "Segoe UI", 
  Roboto, 
  "Helvetica Neue", 
  Arial, 
  "Noto Sans", 
  "PingFang SC",
  "Hiragino Sans GB",
  "Microsoft YaHei",
  sans-serif;

/* 等宽字体 - 用于代码或数字 */
--font-family-mono: 
  "SF Mono", 
  Monaco, 
  "Cascadia Code", 
  "Roboto Mono", 
  Consolas, 
  monospace;
```

### 3.2 字体大小

```css
/* 字体尺寸系统 */
--text-xs:   12px;   /* 极小字 - 标签、备注 */
--text-sm:   13px;   /* 小字 - 次要信息 */
--text-base: 14px;   /* 基础字号 - 正文 ⭐ */
--text-md:   15px;   /* 中等 - 强调正文 */
--text-lg:   16px;   /* 大字 - 小标题 */
--text-xl:   18px;   /* 特大 - 主标题 */
--text-2xl:  20px;   /* 超大 - 强调标题 */
--text-3xl:  24px;   /* 巨大 - 页面标题 */
```

### 3.3 字重

```css
/* 字重系统 */
--font-normal:    400;   /* 正常 - 正文 */
--font-medium:    500;   /* 中等 - 强调 ⭐ */
--font-semibold:  600;   /* 半粗 - 标题 */
--font-bold:      700;   /* 粗体 - 强调标题 */
```

### 3.4 行高

```css
/* 行高系统 */
--leading-tight:  1.25;   /* 紧凑 - 标题 */
--leading-normal: 1.5;    /* 正常 - 正文 ⭐ */
--leading-loose:  1.75;   /* 宽松 - 长文本 */
```

### 3.5 字体应用示例

| 元素 | 字号 | 字重 | 颜色 |
|------|------|------|------|
| 主标题 | 20px | 600 | neutral-800 |
| 次级标题 | 16px | 600 | neutral-800 |
| 正文 | 14px | 400 | neutral-700 |
| 辅助文字 | 13px | 400 | neutral-500 |
| 按钮文字 | 14px | 500 | neutral-0 |
| 标签 | 12px | 500 | neutral-600 |

---

## 4. 间距系统

### 4.1 间距单位

**基于8px栅格的间距系统**

```css
/* 间距单位 - 8px为基础单位 */
--space-0:  0px;
--space-1:  4px;    /* 0.5倍 */
--space-2:  8px;    /* 1倍 - 基础单位 ⭐ */
--space-3:  12px;   /* 1.5倍 */
--space-4:  16px;   /* 2倍 ⭐ */
--space-5:  20px;   /* 2.5倍 */
--space-6:  24px;   /* 3倍 ⭐ */
--space-8:  32px;   /* 4倍 */
--space-10: 40px;   /* 5倍 */
--space-12: 48px;   /* 6倍 */
--space-16: 64px;   /* 8倍 */
--space-20: 80px;   /* 10倍 */
```

### 4.2 间距应用规则

| 场景 | 间距值 | 说明 |
|------|--------|------|
| 组件内部小间距 | 8px | 文字与图标间距 |
| 组件内部标准间距 | 16px | 内容区块间距 |
| 组件之间间距 | 24px | 按钮组、表单项间距 |
| 卡片内边距 | 20px | 卡片padding |
| 区块间距 | 32px | 大区块间距 |
| 页面边距 | 20px | 侧边栏padding |

---

## 5. 组件设计

### 5.1 按钮设计

#### 主按钮（Primary Button）

**用途**：主要操作（开始采集、保存配置）

```css
/* 样式规范 */
高度：36px
内边距：0 20px
圆角：8px
字号：14px
字重：500
背景：--primary-500 (#FF8C29)
文字：--neutral-0 (白色)
阴影：0 1px 3px rgba(255, 140, 41, 0.15)

/* 状态 */
悬停：背景变为 --primary-600 (#E67817)
      阴影：0 2px 6px rgba(255, 140, 41, 0.25)
按下：背景变为 --primary-700 (#C25F0A)
      阴影：0 1px 2px rgba(255, 140, 41, 0.2)
禁用：背景 --neutral-200 (#E8ECEF)
      文字 --neutral-400 (#B0B8BF)
      无阴影
```

#### 次要按钮（Secondary Button）

**用途**：辅助操作（导出、同步）

```css
/* 样式规范 */
高度：36px
内边距：0 20px
圆角：8px
字号：14px
字重：500
背景：--neutral-0 (白色)
文字：--neutral-700 (#4E5761)
边框：1px solid --neutral-300 (#D1D7DC)
阴影：0 1px 2px rgba(0, 0, 0, 0.04)

/* 状态 */
悬停：背景 --neutral-50 (#FAFBFC)
      边框 --neutral-400 (#B0B8BF)
按下：背景 --neutral-100 (#F4F6F8)
禁用：背景 --neutral-50 (#FAFBFC)
      文字 --neutral-400 (#B0B8BF)
```

#### 危险按钮（Danger Button）

**用途**：删除、清空操作

```css
/* 样式规范 */
高度：32px
内边距：0 16px
圆角：6px
字号：13px
字重：500
背景：--neutral-0 (白色)
文字：--error-500 (#EF4444)
边框：1px solid --error-200

/* 状态 */
悬停：背景 --error-50 (#FEF2F2)
      文字 --error-600 (#DC2626)
```

### 5.2 输入框设计

```css
/* 样式规范 */
高度：40px
内边距：0 16px
圆角：8px
字号：14px
背景：--neutral-0 (白色)
边框：1px solid --neutral-300 (#D1D7DC)
文字：--neutral-800 (#31373E)
占位符：--neutral-400 (#B0B8BF)

/* 状态 */
聚焦：边框 --primary-500 (#FF8C29)
      阴影：0 0 0 3px rgba(255, 140, 41, 0.1)
错误：边框 --error-500 (#EF4444)
      阴影：0 0 0 3px rgba(239, 68, 68, 0.1)
禁用：背景 --neutral-100 (#F4F6F8)
      文字 --neutral-400 (#B0B8BF)
```

### 5.3 Tab标签设计

```css
/* 样式规范 */
高度：40px
内边距：0 20px
圆角：顶部8px
字号：14px
字重：500
默认：背景 transparent
      文字 --neutral-600 (#6B7580)
      下边框：2px solid transparent

/* 激活状态 */
背景：--neutral-0 (白色)
文字：--primary-600 (#E67817)
下边框：2px solid --primary-500 (#FF8C29)

/* 悬停状态（未激活） */
文字：--neutral-800 (#31373E)
背景：--neutral-50 (#FAFBFC)
```

### 5.4 卡片设计

#### 笔记卡片

```css
/* 样式规范 */
背景：--neutral-0 (白色)
圆角：12px
边框：1px solid --neutral-200 (#E8ECEF)
阴影：0 2px 8px rgba(0, 0, 0, 0.04)
内边距：16px

/* 结构 */
┌──────────────────────────┐
│ [序号标签]               │ ← 左上角，8px圆角
│ ┌────────────────────┐  │
│ │   封面图片 16:9     │  │ ← 12px圆角
│ │   aspect-ratio     │  │
│ └────────────────────┘  │
│ [笔记标题]               │ ← 16px字号，2行截断
│ [作者名称]               │ ← 13px字号，灰色
│ 点赞数: 1000             │ ← 13px字号，monospace
│                 [删除]    │ ← 右下角，小按钮
└──────────────────────────┘

/* 悬停状态 */
阴影：0 4px 16px rgba(0, 0, 0, 0.08)
边框：1px solid --neutral-300 (#D1D7DC)
向上平移：transform: translateY(-2px)
```

#### 博主信息卡片

```css
/* 样式规范 */
背景：--neutral-0 (白色)
圆角：16px
边框：1px solid --neutral-200 (#E8ECEF)
阴影：0 2px 12px rgba(0, 0, 0, 0.05)
内边距：24px

/* 结构 */
┌──────────────────────────┐
│ ┌────┐                   │
│ │头像│ [博主名称]        │ ← 头像60x60，圆形
│ │60px│ 小红书号: xxx     │
│ └────┘                   │
│                          │
│ [简介文字...]            │
│                          │
│ 粉丝数: 50000            │
└──────────────────────────┘
```

### 5.5 状态提示框

```css
/* 样式规范 */
最小高度：48px
内边距：12px 16px
圆角：10px
字号：13px
字重：400
背景：根据状态变化
边框：根据状态变化
图标：左侧，16x16

/* 成功状态 */
背景：--success-50 (#EDFBF2)
文字：--success-700
边框：1px solid --success-200
图标：✓ 绿色

/* 错误状态 */
背景：--error-50 (#FEF2F2)
文字：--error-700
边框：1px solid --error-200
图标：× 红色

/* 信息状态 */
背景：--info-50 (#F0F9FF)
文字：--info-700
边框：1px solid --info-200
图标：ⓘ 蓝色

/* 警告状态 */
背景：--warning-50 (#FFFBEB)
文字：--warning-700
边框：1px solid --warning-200
图标：⚠ 黄色
```

---

## 6. 页面布局

### 6.1 侧边栏整体布局

```
宽度：400px
高度：100vh
背景：--neutral-100 (#F4F6F8)
内边距：20px

┌─────────────────────────────────┐
│ [顶部区域 - 60px]                │
│  - Logo + 标题                  │
│  - 帮助链接                      │
├─────────────────────────────────┤
│ [状态提示区 - 动态高度]          │
│  - 操作反馈信息                  │
├─────────────────────────────────┤
│ [Tab切换区 - 48px]              │
│  - 4个Tab标签                   │
├─────────────────────────────────┤
│ [内容区 - 自适应高度]            │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │  [操作区域]               │ │
│  │  - 按钮组                 │ │
│  │                           │ │
│  │  [结果展示区]             │ │
│  │  - 卡片列表               │ │
│  │  - 滚动容器               │ │
│  │                           │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### 6.2 顶部区域设计

```css
/* 样式规范 */
高度：60px
背景：transparent
内边距：0
边距底部：20px

/* 结构 */
┌─────────────────────────────────┐
│ 🍠 红薯助手         [?帮助]     │
│ Sweet Potato Helper             │
└─────────────────────────────────┘

/* Logo */
大小：28px
颜色：渐变色（从primary-500到primary-600）

/* 标题 */
中文：18px，font-weight: 600，neutral-900
英文：12px，font-weight: 400，neutral-500

/* 帮助链接 */
字号：13px
颜色：neutral-600
悬停：primary-500
```

### 6.3 Tab区域设计

```css
/* 容器样式 */
高度：48px
背景：--neutral-200 (#E8ECEF)
圆角：12px
内边距：4px
显示：flex
间距：4px

/* Tab按钮 */
高度：40px
内边距：0 16px
圆角：8px
字号：14px
过渡：all 0.2s ease

/* 布局 */
┌─────────────────────────────────┐
│ [单篇笔记][博主笔记][博主信息][配置] │
└─────────────────────────────────┘
宽度：自适应，均分
```

### 6.4 内容区域设计

```css
/* 容器样式 */
高度：calc(100vh - 160px)
背景：transparent
溢出：auto
内边距：20px 0

/* 滚动条样式 */
宽度：6px
背景：transparent

滚动条轨道：
  背景：transparent

滚动条滑块：
  背景：--neutral-300 (#D1D7DC)
  圆角：3px

滚动条滑块悬停：
  背景：--neutral-400 (#B0B8BF)
```

### 6.5 操作按钮区设计

```css
/* 容器样式 */
背景：--neutral-0 (白色)
圆角：12px
边框：1px solid --neutral-200 (#E8ECEF)
内边距：16px
边距底部：20px
阴影：0 1px 3px rgba(0, 0, 0, 0.04)

/* 按钮布局 */
显示：flex
间距：12px
对齐：center

/* 结构 */
┌─────────────────────────────────┐
│  [开始采集]                      │ ← 主按钮，全宽
├─────────────────────────────────┤
│  [清空][导出][同步飞书]          │ ← 次要按钮，等宽
└─────────────────────────────────┘
```

---

## 7. 动效规范

### 7.1 过渡时长

```css
/* 时长系统 */
--duration-fast:   150ms;   /* 快速 - 按钮悬停 */
--duration-base:   200ms;   /* 基础 - 一般过渡 ⭐ */
--duration-slow:   300ms;   /* 缓慢 - 卡片展开 */
--duration-slower: 400ms;   /* 更慢 - 页面切换 */
```

### 7.2 缓动函数

```css
/* 缓动曲线 */
--ease-in:        cubic-bezier(0.4, 0, 1, 1);
--ease-out:       cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);  /* 推荐 ⭐ */
--ease-bounce:    cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 7.3 动效应用

**按钮悬停**
```css
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
/* 变化：背景色、阴影 */
```

**卡片悬停**
```css
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
/* 变化：阴影、位移、边框色 */
transform: translateY(-2px);
```

**Tab切换**
```css
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
/* 变化：背景色、文字色、下划线 */
```

**加载状态**
```css
/* 旋转动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
animation: spin 1s linear infinite;
```

**淡入淡出**
```css
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 从下滑入 */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
```

---

## 8. 响应式设计

### 8.1 侧边栏宽度适配

```css
/* 标准宽度 */
--sidebar-width: 400px;

/* 窄屏适配 */
@media (max-width: 500px) {
  --sidebar-width: 360px;
}

/* 超窄屏适配 */
@media (max-width: 380px) {
  --sidebar-width: 100%;
}
```

### 8.2 字号适配

```css
/* 小屏幕字号调整 */
@media (max-width: 400px) {
  --text-xs:   11px;
  --text-sm:   12px;
  --text-base: 13px;
  --text-lg:   14px;
  --text-xl:   16px;
}
```

---

## 9. CSS实现代码

### 9.1 CSS变量定义

```css
:root {
  /* ===== 配色系统 ===== */
  
  /* 主色 - 红薯橙 */
  --primary-50:  #FFF4E6;
  --primary-100: #FFE8CC;
  --primary-500: #FF8C29;
  --primary-600: #E67817;
  --primary-700: #C25F0A;
  
  /* 辅助色 - 藤蔓绿 */
  --secondary-500: #2D9D5D;
  --secondary-600: #1F8A4F;
  
  /* 中性色 */
  --neutral-0:   #FFFFFF;
  --neutral-50:  #FAFBFC;
  --neutral-100: #F4F6F8;
  --neutral-200: #E8ECEF;
  --neutral-300: #D1D7DC;
  --neutral-400: #B0B8BF;
  --neutral-500: #8A939C;
  --neutral-600: #6B7580;
  --neutral-700: #4E5761;
  --neutral-800: #31373E;
  --neutral-900: #1A1F25;
  
  /* 功能色 */
  --success-50:  #EDFBF2;
  --success-500: #22C55E;
  --success-600: #16A34A;
  
  --error-50:    #FEF2F2;
  --error-500:   #EF4444;
  --error-600:   #DC2626;
  
  --warning-50:  #FFFBEB;
  --warning-500: #F59E0B;
  
  --info-50:     #F0F9FF;
  --info-500:    #3B82F6;
  
  /* ===== 字体系统 ===== */
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                      "Helvetica Neue", Arial, "PingFang SC", sans-serif;
  
  --text-xs:   12px;
  --text-sm:   13px;
  --text-base: 14px;
  --text-lg:   16px;
  --text-xl:   18px;
  --text-2xl:  20px;
  
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;
  
  --leading-normal: 1.5;
  
  /* ===== 间距系统 ===== */
  --space-2:  8px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  
  /* ===== 圆角系统 ===== */
  --radius-sm:  6px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-full: 9999px;
  
  /* ===== 阴影系统 ===== */
  --shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md:  0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-lg:  0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-xl:  0 8px 24px rgba(0, 0, 0, 0.12);
  
  /* ===== 动效系统 ===== */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 9.2 基础样式重置

```css
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--neutral-700);
  background: var(--neutral-100);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--neutral-300);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--neutral-400);
}
```

### 9.3 主容器样式

```css
.sidebar-container {
  width: 400px;
  height: 100vh;
  background: var(--neutral-100);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

### 9.4 按钮组件样式

```css
/* 主按钮 */
.btn-primary {
  height: 36px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--neutral-0);
  background: var(--primary-500);
  border: none;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-600);
  box-shadow: 0 2px 6px rgba(255, 140, 41, 0.25);
}

.btn-primary:active:not(:disabled) {
  background: var(--primary-700);
  transform: translateY(1px);
}

.btn-primary:disabled {
  background: var(--neutral-200);
  color: var(--neutral-400);
  cursor: not-allowed;
  box-shadow: none;
}

/* 次要按钮 */
.btn-secondary {
  height: 36px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--neutral-700);
  background: var(--neutral-0);
  border: 1px solid var(--neutral-300);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  white-space: nowrap;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--neutral-50);
  border-color: var(--neutral-400);
}

.btn-secondary:disabled {
  background: var(--neutral-50);
  color: var(--neutral-400);
  cursor: not-allowed;
}

/* 危险按钮 */
.btn-danger {
  height: 32px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--error-500);
  background: var(--neutral-0);
  border: 1px solid var(--error-200);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-danger:hover:not(:disabled) {
  background: var(--error-50);
  color: var(--error-600);
}
```

### 9.5 卡片组件样式

```css
/* 笔记卡片 */
.note-card {
  background: var(--neutral-0);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
  box-shadow: var(--shadow-md);
  padding: 16px;
  margin-bottom: 16px;
  transition: all var(--duration-base) var(--ease-in-out);
  position: relative;
}

.note-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--neutral-300);
  transform: translateY(-2px);
}

.note-card-number {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 28px;
  height: 28px;
  background: var(--primary-500);
  color: var(--neutral-0);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  z-index: 1;
}

.note-card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-lg);
  background: var(--neutral-100);
  margin-bottom: 12px;
}

.note-card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--neutral-800);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.note-card-author {
  font-size: var(--text-sm);
  color: var(--neutral-500);
  margin-bottom: 8px;
}

.note-card-likes {
  font-size: var(--text-sm);
  color: var(--neutral-600);
  font-family: var(--font-family-mono);
}
```

### 9.6 Tab组件样式

```css
/* Tab容器 */
.tab-container {
  background: var(--neutral-200);
  border-radius: var(--radius-lg);
  padding: 4px;
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
}

/* Tab按钮 */
.tab-button {
  flex: 1;
  height: 40px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--neutral-600);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-in-out);
}

.tab-button:hover:not(.active) {
  background: var(--neutral-50);
  color: var(--neutral-800);
}

.tab-button.active {
  background: var(--neutral-0);
  color: var(--primary-600);
  box-shadow: var(--shadow-sm);
}
```

### 9.7 输入框样式

```css
.input-field {
  width: 100%;
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-300);
  background: var(--neutral-0);
  color: var(--neutral-800);
  font-size: var(--text-base);
  font-family: var(--font-family-base);
  transition: all var(--duration-base) var(--ease-in-out);
}

.input-field::placeholder {
  color: var(--neutral-400);
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(255, 140, 41, 0.1);
}

.input-field:disabled {
  background: var(--neutral-100);
  color: var(--neutral-400);
  cursor: not-allowed;
}
```

### 9.8 状态提示样式

```css
.status-message {
  min-height: 48px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  line-height: 1.5;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideUp 300ms var(--ease-in-out);
}

.status-message.success {
  background: var(--success-50);
  color: var(--success-700);
  border: 1px solid var(--success-200);
}

.status-message.error {
  background: var(--error-50);
  color: var(--error-700);
  border: 1px solid var(--error-200);
}

.status-message.info {
  background: var(--info-50);
  color: var(--info-700);
  border: 1px solid var(--info-200);
}

/* 动画 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 10. 设计交付清单

### 10.1 开发所需文件

- [x] UI设计规范文档（本文档）
- [ ] 完整CSS样式文件（sidebar.css）
- [ ] Logo图标（SVG格式）
- [ ] 插件图标（16x16, 48x48, 128x128 PNG）
- [ ] 示例截图（用于文档）

### 10.2 关键设计决策记录

| 决策点 | 选择方案 | 理由 |
|-------|---------|------|
| 主色调 | 红薯橙 #FF8C29 | 贴合产品名称，温暖友好 |
| 辅助色 | 藤蔓绿 #2D9D5D | 自然意象，与主色形成对比 |
| 圆角风格 | 8-16px | 现代柔和，参考YouMind风格 |
| 间距基准 | 8px栅格 | 统一规范，易于实现 |
| 字体基准 | 14px | 适合阅读，平衡美观与功能 |

---

## 附录：设计参考

### 视觉参考
- YouMind AI Creation Studio（主要参考）
- Notion（卡片设计）
- Linear（现代简约）
- Arc Browser（圆角设计）

### 配色灵感
- 红薯实物配色
- 自然食物色系
- 温暖友好的橙色系

---

**文档版本**：V1.0  
**最后更新**：2025-01-03  
**设计负责人**：[您的名字]

如需调整设计规范，请更新本文档并通知开发团队。


