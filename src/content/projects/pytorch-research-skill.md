---
title: PyTorch Research Skill
description: 面向 AI 编程助手的 PyTorch 科研工作规范，按任务加载模块，覆盖项目搭建、数据与训练、实验留档、批量流程编排，以及对现有代码的中文讲解与张量形状分析。
tech: [Python, PyTorch, YAML, Agent Skills]
github: https://github.com/Tommie-P-xl/pytorch_research_skill
featured: true
date: 2026-10-15
---

## 项目简介

**PyTorch Research Skill** 是一套供 AI 编程助手读取的科研代码工作规范。它把常见工作流程、实现约定和示例整理成主入口与任务模块，帮助助手在新建或修改 PyTorch 项目、安排实验、阅读代码时先明确范围，再按阶段参考相关规则。

当前仓库根目录 `VERSION` 与 README 标注的版本均为 **1.3.4**。Skill 的主入口是 [`SKILL.md`](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/skills/pytorch-research-code-style/SKILL.md)，内容按 [Agent Skills 规范](https://agentskills.io/specification)组织。它本身是说明文件和参考示例，不是训练框架或可直接运行的实验脚本；README 中的训练入口、批量实验脚本等，是助手依照要求在用户的目标项目中实现后才会存在。

## 按任务加载的六个模块

主入口先判断当前工作属于项目构建、源码学习还是批量实验，再提示尚未明确的选择。模块使用相对链接连接，按需读取，不要求每次把全部说明装进上下文：

| 模块 | 负责的工作 | 典型加载时机 |
| --- | --- | --- |
| [数据流程与效率](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/skills/pytorch-research-code-style/modules/data-pipeline.md) | 数据划分与样本清单、批量读取、DataLoader 子进程随机种子，以及可选缓存 | 开始编写数据集与数据读取代码前 |
| [模型与训练](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/skills/pytorch-research-code-style/modules/model-training.md) | 模型实现边界、训练与评估循环、设备选择和并行策略 | 开始核心模型与训练实现前 |
| [实验记录与展示](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/skills/pytorch-research-code-style/modules/experiment-reporting.md) | 每次运行独立留档、配置快照、日志、结构化指标和按需图表 | 规划指标保存或绘制实验结果时 |
| [检查点、验证与交付](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/skills/pytorch-research-code-style/modules/validation-delivery.md) | 权重与续训检查点、恢复规则、少量数据检查和交付前核验 | 设计模型保存/恢复或准备交付时 |
| [批量实验与流程编排](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/skills/pytorch-research-code-style/modules/batch-experiments.md) | 参数组、训练/特征提取/测试顺序、产物路径传递、失败隔离与续跑 | 需要重复运行多组配置或串联步骤时 |
| [代码学习与注释](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/skills/pytorch-research-code-style/modules/code-annotation.md) | 调用链追踪、中文 docstring、算法解释、关键张量维度与梯度流 | 独立学习代码或为已实现代码补注释时 |

## 典型工作流程

### 新建或扩展科研项目

先了解用户的数据、算法、实验协议和已有目录，再确定文件职责与配置组织。约定通常把数据读取、模型计算、训练更新和评估指标分开，参数集中在 YAML，路径按项目根目录解析；用户指定的算法、目录和输出形式始终优先。随后按需实现数据、模型、训练与评估、记录和检查点，并在交付时核对入口、配置、依赖和 README 是否一致。

设备策略默认尝试 CUDA，多卡时优先 DDP，条件不合适时可采用 DataParallel；没有可用 CUDA 时才使用 CPU。规则同时强调保持用户配置的总 batch 语义、尊重可见设备，并清楚报告配置错误、缺失文件或依赖。固定随机种子和这些默认值有助于形成一致流程，但不保证跨硬件、软件版本的逐位复现，也不保证训练一定提速或达到某种精度。

### 记录和呈现实验

实验记录模块要求每次运行保留独立目录和实际配置快照，按需要保存运行日志、汇总指标及逐样本预测等结构化数据，再从已保存的数据生成曲线或对比图。实验期间即接入记录逻辑，避免只剩终端输出而无法追溯设置。模块还规定训练集用于更新权重、验证集用于选择和调参、测试集用于最终评估；是否适合某一具体研究任务，仍需结合用户的实验协议判断。

### 编排多组实验

批量模块面向需要重复训练/测试或包含中间步骤的项目。由助手根据目标仓库现有脚本建立配置清单与编排入口，为不同实验组生成独立配置，并把训练模型、NPZ 特征或其他产物记录到 `artifacts.json`。后续步骤检查所需文件后再填入路径；失败的步骤会使依赖步骤跳过，其他互不依赖的实验仍可继续。续跑前还要重新核对配置、输入和输出，避免把上一次运行的陈旧产物误认成本次结果。

README 中的 `python scripts/run_experiments.py --config ...` 是**目标项目实现后的示例命令**，并非克隆本仓库后即可执行的程序。

### 学习已有源码

代码学习模块既可以只在对话中解释，也可以在用户要求时编辑文件。它支持简洁、标准、教学三种说明密度：从用途和易错点，到输入输出、算法步骤、Tensor Shape 变化，进一步解释维度含义与梯度流。对于全项目注释任务，规范要求先确定纳入范围，再逐文件理解和修改并复核，避免只注释入口或 `forward`。用户也可以约束为局部补丁、指定文件或明确要求不改代码。

## 安装、更新与用户控制

仓库把 Agent 使用的 Skill 与维护工具分开：`skills/pytorch-research-code-style/` 存放入口和六个模块，`VERSION` 与 `docs/updates.md` 管理版本和更新说明，`tools/` 提供独立检查/更新与打包工具。可以通过 [CC Switch 仓库安装](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/README.md#使用-cc-switch)、从 [最新 Release](https://github.com/Tommie-P-xl/pytorch_research_skill/releases/latest) 下载 Skill ZIP，或克隆仓库参与开发。ZIP 包含入口、模块和校验清单；更新工具是分开的产物。

更新不是 Skill 的自动行为：加载规则不会自行检查版本、下载更新、改写已有项目或创建定时任务。直接安装的副本可由用户在技能目录外运行仓库提供的 `tools/update_skill.py`，显式传入技能路径并选择 `--check` 或 `--update`；`--auto` 也需要由用户配置的外部任务调用。更新后的 Skill 需要在相应 Agent 中重新加载，而已有项目代码仍需按新规则另行修改。版本与操作细节见[更新说明](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/docs/updates.md)。

## 运行与适用范围

- **使用 Skill**：需要一个能读取 Agent Skills 目录中 Markdown 文件的 AI 编程助手；项目中的训练和数据处理依赖由具体项目决定，通常包括 Python 与 PyTorch，配置示例使用 YAML。
- **更新工具**：直接安装方案要求 Python 3.10+；更新工具使用 Python 标准库，不要求安装 PyTorch。
- **仓库打包**：`tools/build_skill.py` 的维护流程需要 PyYAML；完整的维护检查命令见 [README](https://github.com/Tommie-P-xl/pytorch_research_skill#自动构建与发布)。
- **边界**：Skill 提供提示、约定与示例，不替代研究者对算法正确性、数据许可、实验设计和结果解释的判断。具体代码是否运行、实验是否收敛及性能表现，取决于目标项目、数据、环境和实际验证。

## 项目链接

- [GitHub 源码与完整中文 README](https://github.com/Tommie-P-xl/pytorch_research_skill)
- [1.3.4 Release 与下载](https://github.com/Tommie-P-xl/pytorch_research_skill/releases/tag/v1.3.4)
- [主入口 SKILL.md](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/skills/pytorch-research-code-style/SKILL.md)
- [安装与更新文档](https://github.com/Tommie-P-xl/pytorch_research_skill/blob/main/docs/updates.md)
