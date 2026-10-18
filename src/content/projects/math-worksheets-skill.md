---
title: Math Worksheets Skill
description: 面向 AI 编程助手的数学练习与讲义工作流，可从题目文本或图片生成可打印练习、答案和图示。
tech: [Python, SymPy, LaTeX, XeLaTeX, Poppler, Agent Skills]
github: https://github.com/Tommie-P-xl/math-worksheets-skill
featured: true
date: 2026-10-16
---

## 项目简介

这是一个可安装到 AI 编程助手的数学练习 Skill。用户可以描述练习目标，也可以提供已有题目的文本、截图或照片；Skill 协助生成可打印的练习纸、独立核对的答案，以及可选的讲解指南和程序绘制的数学图示。内容覆盖小学数学至 AP Calculus BC。

## 当前能力

- 根据主题、难度和范围编写新题，或整理用户提供的题目。
- 生成含答案的打印版 PDF；中文排版可使用 XeLaTeX。
- 使用 SymPy 等工具独立检查数学结果，并通过代码绘制图形。
- 可选的 SQLite 题库默认不自动归档；题库更新前需逐项审核。

## 运行依赖

Skill 本身以说明文件和脚本形式提供；完整工作流依赖 Bash、Python、SymPy 及 TeX / LaTeX 工具链，PDF 检查可使用 Poppler。安装包和支持范围以仓库最新 Release 与 README 为准。
