---
title: ClaudeBeep
description: Windows 托盘通知工具，让 Claude Code 与 Codex 共用通知渠道，并按平台独立配置事件和开关。
tech: [Python, Windows, Flask, WinRT, GitHub Actions]
github: https://github.com/Tommie-P-xl/ClaudeBeep
featured: true
date: 2026-09-09
---

## 项目简介

ClaudeBeep 是面向 Windows 的 Claude Code 与 Codex 通知管理器。它将两种编程助手作为独立集成：各自配置启用状态和事件，复用一套通知渠道凭据。未安装或未启用的平台不会启动对应适配器。

## 当前能力

- 通过系统托盘和 Web 控制面板管理集成、渠道、日志与启动项。
- 支持 Windows Toast、微信、QQ、Telegram、飞书和钉钉通知。
- Claude Code 支持将审批或问题回复从终端及已配置的远程渠道送回会话。
- Codex 集成发送完成和权限相关通知；审批和回答仍在 Codex 内完成。
- 支持明暗主题、高 DPI 显示、GitHub Releases 更新检查。

## 技术

Python 3.10+、Windows 托盘与 WinRT、Flask Web UI；项目提供 Windows 安装包和独立可执行文件发布流程。
