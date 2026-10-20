---
title: ClaudeBeep
description: 面向 Claude Code 与 Codex 的 Windows 托盘通知管理器；集中配置通知渠道，并为 Claude Code 保留终端与远程交互回复流程。
tech: [Python, Windows, Flask, WinRT, GitHub Actions]
github: https://github.com/Tommie-P-xl/ClaudeBeep
featured: true
featuredOrder: 4
date: 2026-09-09
---

## 项目定位

[ClaudeBeep](https://github.com/Tommie-P-xl/ClaudeBeep) 是一个常驻 Windows 系统托盘的通知管理器，面向日常使用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) 和 Codex 的开发者。它要解决的核心问题很具体：编码代理在后台执行、等待权限确认或提出问题时，使用者容易错过终端状态；而不同代理和通知渠道又常常需要各自配置、各自维护。

ClaudeBeep 把 Claude Code 与 Codex 作为两种独立集成，分别控制启用状态、hook 事件和投递渠道，但共享渠道凭证及底层投递能力。两者的交互能力并不相同：Claude Code 的问题和权限请求可从终端或已接入的远程渠道回复；Codex 集成发送完成、权限或需关注通知，审批和回答仍在 Codex 内完成。这样的边界避免把“收到提醒”误解为“可以远程批准 Codex 操作”。

项目仓库当前 README 标注版本为 **v2.3.3**。最新发布记录列出 v2.3.3，重点修复自动更新后 Windows Defender 仍占用可执行文件时的启动失败：更新器会检查文件是否可独占打开、验证新程序启动，并在失败时重试。可在[最新发布页](https://github.com/Tommie-P-xl/ClaudeBeep/releases/latest)查看安装包和具体变更；历史记录见[中文更新日志](https://github.com/Tommie-P-xl/ClaudeBeep/blob/main/CHANGELOG_CN.md)。

## 主要工作流

```text
Claude Code hooks ─┐
                   ├─ 各自的平台适配器 ─ notification_core ─ 通知渠道
Codex hooks ───────┘                         │
                                             └─ 托盘进程管理的渠道监听与交互回复
```

1. **代理产生事件**：Claude Code 通过 `~/.claude/settings.json` 中的 hooks 接入；Codex 使用 `~/.codex/hooks.json`。可在应用界面分别选择要监听的平台事件和渠道。
2. **适配器处理平台差异**：Claude Code 与 Codex 的事件由各自适配器接收，再汇合到共享的 `notification_core` 投递边界。未安装 hooks 或未启用的平台不会启动对应适配器。
3. **发送通知**：用户为渠道配置凭证后，两个集成可按各自设置复用这些渠道。渠道失败时，其他启用渠道仍可尝试投递。
4. **接收 Claude Code 回复**：对于 `PermissionRequest` / `Elicitation`，ClaudeBeep 可发送带编号选项的通知。用户可以在终端输入，也可以从已启用的远程渠道回复；先到的答案生效。
5. **管理常驻状态**：托盘进程拥有渠道监听和 keepalive，hook 进程将任务交给相应流程。微信发送队列以 JSON 文件在进程间传递，避免另建连接破坏 iLink 的会话绑定要求。

## 功能组成

### 托盘与本地控制台

- 托盘菜单可打开 Web 控制台，进行渠道配置、扫码登录、日志查看，以及分别控制 Claude Code、Codex 的开关、事件和投递渠道。
- 未配置的渠道会在托盘菜单中置灰；渠道凭证只需配置一次，可供两个集成共用。
- 支持按用户设置 Windows 开机自启动、退出时停止后台服务，以及从 GitHub Releases 检查更新。
- 控制台支持亮色、暗色和跟随系统主题，主题偏好会保存；托盘菜单适配 Windows 系统深色模式。项目还声明 Per-Monitor V2 DPI 感知并使用高分辨率托盘图标。

### 事件与通知渠道

Claude Code 的完成、权限和询问事件可以按需启用。Codex 的完成、权限/需关注事件用于通知，不接管 Codex 的审批流程。

README 列出的渠道包括：

- **Windows Toast**：通过 WinRT 显示系统通知，不需要常驻回复监听。
- **微信**：使用 iLink Bot API；README 明确标注为“不推荐”。它由托盘进程维护 `getupdates` 长轮询和会话，再消费 hook 进程写入的发送队列。
- **QQ Bot**：使用 QQ 开放平台 OAuth2，可通过 C2C 或群聊收发，回复监听由 WebSocket 完成。
- **Telegram**：使用 Telegram Bot API，托盘进程维护长轮询监听。
- **飞书 / Lark**：使用开放平台 OAuth2 与 WebSocket 监听。
- **钉钉**：使用开放平台 Stream 连接。

是否可回复取决于平台事件和渠道能力。交互式远程回复针对 Claude Code 的权限/询问事件；Codex 的权限通知仍需返回 Codex 处理。

### 可靠性与安全边界

- 本地 Web UI 绑定 `127.0.0.1`，并拒绝非回环 `Host` 请求；写操作要求 `X-Requested-With` 请求头，降低 DNS rebinding 和跨站请求风险。
- 日志会对渠道凭证及 hook 载荷值脱敏；配置 API 响应中的敏感字段也会被遮盖。README 同时提醒不要提交本地令牌和运行时数据。
- 自动更新会校验下载文件与 `latest.json` 中 SHA256 的一致性，再应用更新；若自动更新失败则可回到下载页面手动处理。
- Windows 全局互斥体限制重复托盘实例；心跳文件用于进程间协调，后台清理任务负责清除过期日志、响应文件和队列残留。
- 各渠道保持相对独立，单个渠道故障不会阻止其他渠道投递。微信 keepalive 不可用时有直接 HTTP 发送的降级路径。

这些设计反映了项目的取舍：ClaudeBeep 将平台集成和渠道投递拆开复用，同时把长连接放在托盘常驻进程中统一管理；代价是 Windows 后台进程、hook 安装状态和渠道会话需要一起维护，微信等远程渠道还受第三方平台协议和登录状态影响。

## 安装与使用

普通用户可以从 [GitHub Releases](https://github.com/Tommie-P-xl/ClaudeBeep/releases/latest) 下载 `ClaudeBeep-Setup-*.exe` 并运行。安装包包含主程序 `ClaudeBeep.exe` 和用于 Codex 集成的 `claudebeep_hook.bat`。首次启动时，安装版在 `%APPDATA%\\ClaudeBeep` 创建配置和运行时目录；开发运行的数据则保留在项目目录。README 说明旧安装目录中的配置会在首次启动时迁移。

安装 Codex hooks 后，需要在 Codex 终端运行 `/hooks`，审阅并信任这些 hook。更新程序后 hook 哈希变化，Codex 可能再次要求审核。README 特别说明：Codex 在 Windows 上不能直接执行 `.exe` 作为 hook，因此安装包提供 `.bat` 包装器。

## 开发、测试与构建

仓库 README 给出的开发命令如下（需要 Windows 环境及项目依赖）：

```powershell
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 运行托盘程序
python tray.py

# 仅打开 Web UI / 安装 hooks / 移除 hooks / 测试已启用渠道
python notify.py --ui
python notify.py --install
python notify.py --uninstall
python notify.py --test

# 运行单元测试
python -m unittest discover tests -v

# 构建单文件可执行程序
./build.ps1
```

`build.ps1` 生成 `dist/ClaudeBeep.exe`。发布流程由 GitHub Actions 版本标签触发：README 示例使用 `v2.3.3` 标签，工作流配置 Python 3.11，运行构建脚本、安装 Inno Setup 并制作安装器，最后将可执行文件和安装器上传为 GitHub Release 资产。这里描述的是仓库文档明确列出的工作流，不代表本地已运行构建。

## 项目资料

- [GitHub 仓库与 README](https://github.com/Tommie-P-xl/ClaudeBeep)
- [最新版本与下载](https://github.com/Tommie-P-xl/ClaudeBeep/releases/latest)
- [中文更新日志](https://github.com/Tommie-P-xl/ClaudeBeep/blob/main/CHANGELOG_CN.md)
- [英文 README](https://github.com/Tommie-P-xl/ClaudeBeep/blob/main/README.md)
- [许可证：MIT](https://github.com/Tommie-P-xl/ClaudeBeep/blob/main/LICENSE)
