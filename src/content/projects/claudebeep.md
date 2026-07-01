---
title: ClaudeBeep
description: Windows 系统托盘应用，为 Claude Code 提供多渠道通知和交互式审批回复支持
tech: [Python, Windows, Flask, WinRT]
github: https://github.com/Tommie-P-xl/ClaudeBeep
featured: true
date: 2026-05-01
---

## 项目简介

ClaudeBeep 是一个 Windows 系统托盘应用，为 [Claude Code](https://claude.ai/code) 提供多渠道通知和交互式审批回复功能。将原始 Python hook 工作流打包为单一可安装桌面应用——安装一次，从系统托盘管理所有功能。

## 核心功能

- **多渠道通知**：Windows Toast、微信、QQ、Telegram、飞书、钉钉
- **交互式回复**：Claude Code 提问时，可从终端或任意远程渠道回复，先到先得
- **系统托盘管理**：仪表盘、通知源切换、Hook 安装/卸载、开机自启
- **自动更新**：从 GitHub Releases 查询并就地更新
- **高 DPI 适配**：Per-Monitor V2 DPI 感知，高分辨率图标

## 技术栈

- Python 3.10+ / Flask Web UI / WinRT 通知
- 文件队列 IPC / 心跳监控 / 多实例互斥保护
- Inno Setup 安装程序 / GitHub Actions CI/CD
