---
title: Codex Transfer
description: 轻量级 Windows 桌面工具，用于管理 Codex 聊天历史记录
tech: [Python, tkinter, Nuitka, SQLite]
github: https://github.com/Tommie-P-xl/codex-transfer
featured: true
date: 2026-06-07
---

## 项目简介

Codex Transfer 是一个轻量级 Windows 桌面工具，专为 [OpenAI Codex](https://github.com/openai/codex) 用户设计。读取本地 Codex 聊天数据库，在可排序表格中展示所有会话记录，支持批量迁移、复制和删除。

## 核心功能

- **浏览/筛选**：按提供商、项目路径、标题关键词过滤
- **批量操作**：移动、复制、删除会话记录
- **主题同步**：自动检测 Windows 深色/浅色主题
- **DPI 感知**：支持 100%–200% 缩放，适配 1366×768 到 3840×2160 分辨率
- **便携式**：单文件 exe，Nuitka 编译，仅 6–9MB

## 技术栈

- Python 3.10+ / tkinter + ttkbootstrap
- SQLite 内置数据库 / Nuitka 原生编译
- ctypes 系统 API / GitHub Actions 自动构建
