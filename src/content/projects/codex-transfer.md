---
title: Codex Transfer
description: Windows 桌面工具，用于浏览、筛选、迁移、复制和清理本地 Codex 聊天记录。
tech: [Python, tkinter, ttkbootstrap, SQLite, Nuitka]
github: https://github.com/Tommie-P-xl/codex-transfer
featured: true
date: 2026-06-29
---

## 项目简介

Codex Transfer 读取本机 Codex 会话数据库及会话文件，并以可排序的表格展示聊天记录。它主要解决切换 `model_provider` 后旧记录不易在 Codex 中找到的问题，可将选中的记录迁移到目标 provider。

## 当前能力

- 按 provider、项目路径或标题筛选会话，并隐藏对应 JSONL 文件已不存在的记录。
- 批量移动、复制和删除记录；复制时同步更新 `session_index.jsonl`。
- 同步 Codex 侧边栏标题，支持单实例运行和窗口布局适配。
- 明暗主题跟随 Windows 设置，支持 DPI 缩放与便携式单文件程序。
- GitHub Actions 可构建 Windows 可执行文件并附加到 Release。

## 运行方式

可从仓库 Releases 下载 Windows 程序，也可安装依赖后从源码运行。详细步骤和 Codex 数据目录说明见仓库 README。
