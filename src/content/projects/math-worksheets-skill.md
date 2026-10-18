---
title: Math Worksheets Skill
description: 面向 AI Agent 的数学练习与讲义工作流，支持新题设计、图片或文本题目复现、独立验算、程序绘图和可选的审核式全局题库。
tech: [Agent Skills, Python, SymPy, LaTeX, XeLaTeX, TikZ, SQLite]
github: https://github.com/Tommie-P-xl/math-worksheets-skill
featured: true
date: 2026-10-16
---

## 项目定位

**Math Worksheets Skill** 是一个可安装到 Claude Code、Codex 等 AI 编程助手中的数学练习工作流。它让 Agent 使用自身已有的模型、文件访问、视觉能力和命令行工具，完成出题或题目整理、解答、验算、排版和交付；项目不提供独立的出题服务，也不要求专用模型订阅。

它覆盖两类不同任务：围绕已学内容设计新练习，以及把用户给出的题目文字、截图或照片忠实地整理成练习册。两者的默认交付和内容规则不同，尤其是复现模式必须保留原题，不得为了便于验算擅自改数字、题意或顺序。

## 能做什么

### 新题与学习材料

- 根据主题、学段、数量、语言、纸张尺寸和难度要求设计练习。未指定题量时，Skill 默认按 10 题处理；会先确认实际学过的知识范围，避免仅凭年级推断教学进度。
- 默认可以交付学生练习册、简洁的分步答案册和知识点总结；用户可明确指定只要其中一部分。总结可以包含规则、例题和独立练习。
- 可按要求安排难度梯度、分层练习、图表题、几何题或函数题。难度与认知负担属于设计估计，不会被描述成经学生样本校准的统计结果。

### 已有题目复现

- 输入可以是粘贴的文本、截图或照片；工作流区分印刷题干、原始图形信息与后加的手写演算、圈选和批注。
- 整理时保留原题措辞、数值、选项、单位、图形约束和题目顺序，不擅自增加新题。重要符号或条件被遮挡时要标出不确定处并询问，不能从“答案看起来合理”反推或补造题目条件。
- 默认输出学生练习册和独立求解后的答案册，知识点总结可选。即使用户只要学生版，也要求内部完成答案检查；答案册不会因此自动交付。
- 题目默认紧凑排版，不额外预留演算空白；只有用户明确要求时才切换为宽松布局。学生题目中的原有填空空格仍应保留。

## 从题目到 PDF 的工作流

1. **明确模式和范围**：识别是新出题、复现已有题目，还是只做知识点总结；确认已学范围、年级或考试要求、题量、语言、纸张与输出目录。
2. **设计或转录**：新题先确定知识跨度、关键推理步骤、方法提示程度、计算负担、分类讨论和难度依据；复现则逐项核对原始题干和图形，记录尚未解决的歧义。
3. **独立求解**：Agent 自行求解，不把用户手写过程或印刷答案直接当作正确答案。机器可计算的数值/符号结果写入验证数据；证明、作图解释等不能由计算机代替判断的部分标记为人工审核。
4. **重绘数学图形**：适合的函数图、数据图和几何关系可用 TikZ、pgfplots 或程序绘制，并尽量使用仓库提供的 LaTeX 模板和图形宏。学生题目图与答案专用辅助线、交点或反射点分开；解答若引入辅助构造，答案图也应显示新增对象。
5. **构建与检查**：构建脚本运行数学与文档检查，调用 TeX 工具编译 PDF，再检查答案项、单位、来源一致性、版面空间及 PDF 文本碰撞等问题。出错时需修复并重新构建。
6. **人工复核并交付**：检查成品 PDF，尤其是 OCR 转录和图形；交付用户指定的文件，并说明尚需人工判断的部分。

## 数学验算与质量边界

仓库包含 `scripts/verify.py` 和一组构建检查脚本。支持的数值或符号结果可用 SymPy 等进行独立计算核对；构建门禁还会检查答案数据与作答项覆盖、单位、题目来源记录、文档结构和输出 PDF 的文字布局。检查成功代表这些受支持的检查通过。

它**不等于**完整证明正确，也不能保证 OCR 对照片的转录绝无错误、教学难度适配所有学生，或每个图形的几何关系都已由机器证明。证明步骤、开放式解释、图像转录、外部图片内容和图形的视觉清晰度仍需人工审阅。构建退出状态 `2` 表示有人工检查项或外部图片审核项待确认，不应将其说成全部机器验证通过。对于遮挡且影响题意的条件，工作流要求先澄清再完成相关题目。

## 可选全局题库

题库将可复用题目示例和命题指南保存在 Agent Skill 安装目录之外，供不同项目中的工作流参考。它使用 Python 标准库和 SQLite，不依赖数据库服务器、向量服务或后台进程；生成 PDF 仍需要常规数学与排版依赖。

题目以稳定 ID 和内容指纹管理，可附带学段、年级/考试、知识点、题型、方法、难度特征、解答、图形描述、验证状态和来源。相同题目的年级或考试标签可以合并到同一条记录；工具会提示可能的重复项，但相似度匹配并不能证明两道题在数学上等价。每一类标签每题最多 5 个。

题库的默认规则是**不自动保存**：

- 收录用户上传的题目时，Agent 逐题展示拟保存内容及标签，询问用户是否保存、信息是否准确；用户可更正或拒绝。
- 新生成题目与命题指南更新分别征求同意；对某一道题的同意不会替代对其他题或指南的同意。
- `preview` 负责校验提案、来源哈希和重复候选，不创建待办记录或复制来源文件；只有获得针对该提案的明确同意后，才以预览摘要调用 `commit`。
- 已批准写入会记录可追溯的修改信息，并按工具策略在写入前备份。未获同意的材料仅用于当前任务，不进入全局存储。

题库还提供按学段、学科、标签和关键词检索的精简参考上下文，以及 `stats`、`doctor`、备份、恢复和文本导出等维护命令。每个学段与学科维护一份可编辑的 Markdown 命题指南；参考题目和指南用于辅助设计，不会自动证明新题质量。

## 安装与运行依赖

### 安装 Skill

推荐从仓库 [Releases](https://github.com/Tommie-P-xl/math-worksheets-skill/releases/latest) 下载 `math-worksheets-v*.zip`，通过 CC Switch 安装，或解压后把 `math-worksheets/` 目录放入 Agent 的个人 Skill 目录。Claude Code 的目录示例为 `~/.claude/skills/math-worksheets/`，Codex 为 `~/.agents/skills/math-worksheets/`。也可以克隆源码后，在提示中直接指定其中的 `SKILL.md`。

### PDF 构建依赖

| 依赖 | 用途 |
| --- | --- |
| Bash | 执行构建和编译脚本；Windows 可用 Git Bash 或 MSYS2 |
| Python 与 SymPy（至少 1.12） | 数学结果检查和相关脚本；README 给出的评测基线为 SymPy 1.14.0 |
| Tectonic 或 `pdflatex` | 编译 LaTeX 文档；需有 pgfplots 1.18 或更新版本 |
| XeLaTeX 与中文字体 | 编译中文或其他 Unicode 内容；仓库示例采用 ctex 和 Fandol 字体 |
| Poppler `pdftotext` | 检查编译后 PDF 中的文字位置与重叠 |

多个 Python 环境并存时，可通过 `MWS_PYTHON` 指定安装了 SymPy 的解释器；中文文档可设置 `MWS_LATEX_ENGINE=xelatex`。题库命令只需 Python 标准库，和完整 PDF 生成工作流的依赖不同。

## 仓库结构

- `SKILL.md`：技能入口，说明模式选择、数学和图形要求、构建方式及验证边界。
- `references/authoring.md`、`references/reproduction.md`：新题设计与原题复现规则。
- `references/solutions.md`、`references/problem-library.md`、`references/latex-templates.md`：解答展示、常见题型校验和 LaTeX/图形模板。
- `references/question-bank.md`：全局题库的审核、检索、存储与备份工作流。
- `scripts/verify.py`、`scripts/checks/`、`scripts/build.sh`：数学验证、文档门禁和完整构建链。
- `scripts/question_bank.py`：题库初始化、检索、预览、批准写入及维护命令。
- `templates/`：练习册 LaTeX 导言和数学图形宏。
- `tests/`：题库、运行环境、发布包与构建相关测试和夹具。
- `docs/examples/`、`docs/samples/`：复现示例、输出 PDF/图片及示例预览。

## 适用场景

- 教师或家长希望按明确教学范围制作可打印练习、答案和复习材料。
- 学习者要把教材、作业或试卷照片整理成清晰版本，并保留原题条件。
- 需要在函数图、统计图或几何图中一致地呈现题目与解答。
- 希望积累可审核、可检索的题目示例和命题指南，同时保留逐项确认权。

如果输入照片中的关键条件模糊、题目依赖不可替代的复杂实景图片，或任务要求自动证明开放式几何推理，仍需补充清晰材料或人工审核；该项目不会用猜测来填补缺失信息。

## 项目链接

- [GitHub 仓库与完整文档](https://github.com/Tommie-P-xl/math-worksheets-skill)
- [中文 README](https://github.com/Tommie-P-xl/math-worksheets-skill/blob/main/README.zh-CN.md)
- [技能入口与工作流](https://github.com/Tommie-P-xl/math-worksheets-skill/blob/main/SKILL.md)
- [全局题库说明](https://github.com/Tommie-P-xl/math-worksheets-skill/blob/main/references/question-bank.md)
- [原题复现规则](https://github.com/Tommie-P-xl/math-worksheets-skill/blob/main/references/reproduction.md)
