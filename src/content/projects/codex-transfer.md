---
title: Codex Transfer
description: 面向 Windows 的 Codex 会话管理工具：从本地 SQLite 与 JSONL 会话文件读取历史记录，按 provider 和项目筛选，并支持批量迁移、复制与删除。
tech: [Python 3.10+, tkinter, ttkbootstrap, SQLite, JSONL, Nuitka, GitHub Actions]
github: https://github.com/Tommie-P-xl/codex-transfer
featured: true
date: 2026-06-29
---

## 项目要解决的问题

Codex Transfer 是一个本地 Windows 桌面工具，用来管理 Codex 已保存的会话记录。Codex 会把会话元数据放进 SQLite 数据库，把逐轮对话内容保存在 JSONL rollout 文件中；会话记录还带有 `model_provider`。如果用户更换过 provider 配置，旧会话仍然留在本机，但可能因为归属不匹配而不容易在 Codex 中找到。

这个程序把数据库记录和对应 rollout 文件作为一组关联数据来处理：用户可以在一个表格中核对标题、时间、项目路径、provider 和归档状态，再把选中的会话迁移到另一个 provider、复制一份到新归属，或删除会话。它面向已有本地 Codex 数据的个人用户，不是 Codex 的聊天客户端，也不会将会话上传到远端服务。

## 数据是怎样组织的

默认数据根目录为用户目录下的 `~/.codex`，也可以在应用设置中更改。程序主要读取和维护以下数据：

```text
~/.codex/
├── state_*.sqlite          # 会话索引和元数据，使用其中的 threads 表
├── session_index.jsonl     # Codex 侧边栏的会话标题索引
├── sessions/               # 会话 rollout 文件
│   └── YYYY/MM/DD/rollout-*.jsonl
└── archived_sessions/      # 已归档会话文件
```

`threads` 中一条记录包含会话 ID、标题、provider、项目工作目录、创建和更新时间、归档标记、rollout 相对或绝对路径，以及首条用户消息和预览文本。每个 JSONL 文件由多行 JSON 组成；程序定位其中 `type: session_meta` 的记录，读取或更新它的 `payload.model_provider`，复制时还会更新 `payload.id`。

启动时，程序在数据目录中查找 `state_*.sqlite`，按文件名中的数字后缀优先选择编号较新的数据库，再以修改时间作为排序辅助。随后加载会话行，并检查 rollout 文件是否存在；数据库仍有记录、但对应文件已经不存在的条目会从列表中隐藏，并在状态栏报告隐藏数量。标题优先从 `session_index.jsonl` 取得，缺少索引时回退到数据库标题。

## 主要操作流程

### 浏览与筛选

主窗口以可排序表格展示会话标题、更新时间、项目目录、provider 和归档状态。可以组合 provider 与项目路径筛选；关键字还会匹配显示标题、首条用户消息和预览文本。项目路径中的 Windows 长路径前缀会在界面显示时清理，筛选时再映射回数据库中的原值。表格支持勾选、多选、全选、取消全选和反选。

### 移动会话

移动操作会对选中行逐一定位 rollout 文件，把其中会话元数据的 `model_provider` 改为目标值，然后批量更新 SQLite `threads.model_provider`。它保留原会话 ID 和文件位置，因此这是对现有记录的重新归属，而不是生成副本。

### 复制会话

复制会在原 rollout 所在目录生成一个新文件名和 UUID，将 JSONL 中会话元数据的 ID 与 provider 改为新值，再向 SQLite 插入对应的 `threads` 行。新记录沿用原记录的创建/更新时间、项目路径和显示标题，并追加标题到 `session_index.jsonl`，以便 Codex Desktop 能显示复制后的会话。

### 删除会话

删除会先弹出确认，再删除每条记录对应的 rollout 文件，最后从 SQLite 中删除对应 `threads` 行。这是直接修改本机数据的不可撤销操作；当前工具没有回收站或撤销记录。

## 功能与界面细节

- 查看会话时间、标题、项目路径、provider、归档状态；支持列排序和组合筛选。
- 批量移动、复制、删除，并可选择已有 provider 或在操作时输入新名称。
- 同步 Codex 侧边栏标题；过滤数据库中已没有 rollout 文件的残留行。
- 通过 Windows Mutex 限制多开，重复启动时尝试恢复已有窗口。
- 检测 Windows 深浅色主题，支持跟随系统或选择亮色/暗色；根据屏幕 DPI 设置进程感知，并让表格列宽和布局随窗口尺寸调整。
- 在后台请求 GitHub Releases 检查新版本，并打开发布页面；网络不可用时显示检查失败提示。
- 提供 Nuitka 单文件可执行程序，不需要单独安装 Python 环境即可运行发布版。

## 配置与运行边界

配置保存在 `%APPDATA%/CodexTransfer/config.json`，内容包括 Codex 数据目录、主题和窗口几何信息。默认数据目录为 `~/.codex`；若没有已保存路径，则 `CODEX_HOME` 环境变量可指定目录。配置文件中的已保存路径优先于环境变量。主题值为 `auto`、`dark` 或 `light`；用户也可以在界面里选择数据目录和主题。

应用依赖本机 Codex 数据目录以及兼容的 `state_*.sqlite` 数据库、`threads` 表和 JSONL 会话元数据结构。当前实现针对 Windows 桌面使用：单实例、DPI、主题读取等系统行为通过 Windows API 完成；非 Windows 平台不会执行同一套 Windows 体验。移动、复制、删除会同时改动文件与数据库，操作前建议先关闭 Codex，并为 `.codex` 目录保留备份。对损坏或无法解析的 JSONL 行，重写逻辑会原样保留；如果目标文件中没有可修改的 `session_meta`，移动操作不会自动创建该记录。

## 技术实现与代码结构

界面采用 Python 内置 `tkinter`，并以 `ttkbootstrap` 提供主题化控件；会话元数据通过标准库 `sqlite3` 访问，rollout 与标题索引按 JSONL 逐行读取和写回。Pillow 负责应用图标处理，`ctypes` 访问 Windows Mutex、DPI 和窗口相关 API。应用更新检查使用标准库 HTTP 客户端访问 GitHub Releases API。

```text
codex-transfer/
├── main.py                      # 程序入口、单实例检测、DPI 初始化
├── core/
│   ├── config.py                # APPDATA 配置读取和保存
│   ├── database.py              # state SQLite 查询和会话记录增删改
│   └── rollout.py               # JSONL rollout 的迁移、复制和删除
├── ui/
│   ├── app.py                   # 主窗口、筛选表格和批量操作
│   ├── theme.py                 # Windows 系统主题检测
│   └── widgets.py               # 带动态勾选状态的表格控件
├── assets/icon.ico              # 多尺寸应用图标
├── .github/workflows/
│   └── build-release.yml        # Windows 构建与 Release 附件发布
├── build.py                     # Nuitka 单文件打包入口
├── requirements.txt             # UI、图像与打包依赖
├── README.md                    # 英文说明
└── README_CN.md                 # 中文说明
```

## 安装、源码运行与构建

### 直接使用发布版

从 [GitHub Releases](https://github.com/Tommie-P-xl/codex-transfer/releases) 下载 `CodexTransfer.exe` 并运行。发布程序是单文件 Windows 可执行文件，不需要安装步骤。

### 从源码运行

需要 Python 3.10 或更高版本。README 给出的最小运行依赖是 `ttkbootstrap` 和 `Pillow`：

```powershell
git clone https://github.com/Tommie-P-xl/codex-transfer.git
cd codex-transfer
python -m pip install ttkbootstrap Pillow
python main.py
```

如果要安装完整构建依赖，使用仓库的依赖清单并执行构建脚本：

```powershell
python -m pip install -r requirements.txt
python build.py
```

构建脚本调用 Nuitka，启用 tkinter 插件、包含 `assets` 目录、关闭控制台，并将单文件程序输出到 `dist/CodexTransfer.exe`。脚本会检查构建退出码，并在产物存在时打印可执行文件大小。

### 自动构建与发布

`.github/workflows/build-release.yml` 在推送 `v*` 标签或手动触发时运行，使用 `windows-latest` 与 Python 3.11 安装依赖并执行 `build.py`。生成的 exe 会作为 Actions artifact 上传；标签触发时还会将它附加到对应 GitHub Release。当前 README 标注版本为 **v1.4.0**，该版本与程序入口及应用内版本检查常量一致；GitHub 的最新 Release 页面也指向 v1.4.0。

## 后续可以继续完善的方向

当前迁移和删除会分别写入文件与数据库，尚未形成跨文件/数据库的事务回滚机制；复制或移动过程中断电或写入失败时，用户需要自行检查文件与索引的一致性。后续可考虑加入操作前备份、逐条结果报告、异常回滚、数据库只读预览，以及对不同 Codex 数据格式版本的兼容检测。它们是可继续完善的方向，不代表当前版本已经支持。

## 项目链接

- [GitHub 仓库与完整说明](https://github.com/Tommie-P-xl/codex-transfer)
- [最新 Release 与 Windows 下载](https://github.com/Tommie-P-xl/codex-transfer/releases/latest)
