---
title: Deep Learning Learning Resources
description: 以章节代码、主题笔记和 PyTorch Notebook 组织的个人深度学习学习库，覆盖神经网络基础、训练方法、CNN、轻量网络与视觉 Transformer。
tech: [Python, NumPy, PyTorch, Jupyter Notebook]
github: https://github.com/Tommie-P-xl/resource_deeplearning
featured: false
date: 2026-09-20
---

## 项目简介

这是一个以“边读、边运行、边记录”为主的个人学习仓库，内容围绕神经网络基础和计算机视觉模型展开。它把《深度学习入门：基于 Python 的理论与实现》的章节代码、按主题整理的 Jupyter 学习笔记，以及 PyTorch 模型 Notebook 放在同一处，便于从基础概念逐步对照代码理解模型。

仓库主要是学习材料与示例代码的集合，并非统一封装的训练框架或经过基准测试的模型库。不同目录来自不同学习阶段，依赖、数据路径和运行入口可能不同；阅读或运行单个示例时，应以对应 Notebook、脚本和目录说明为准。

## 内容分区

### 1. PyTorch 经典网络与工具 Notebook

`pytorch_经典网络/` 收录六个按编号整理的模型 Notebook：

| Notebook | 关注内容 |
| --- | --- |
| `001_AlexNet.ipynb` | 参数配置、网络定义、数据集读取，以及训练和验证代码；Notebook 将训练与验证步骤分开说明。 |
| `002_ResNet.ipynb` | 残差学习的动机，Basic Block 与 Bottleneck 结构，以及不同深度 ResNet 的模块差异。 |
| `003_ResNeXt.ipynb` | 聚合变换、分组卷积与多分支表示，并对照 ResNet 的瓶颈结构理解 cardinality 这一设计维度。 |
| `004_MobileNetV2.ipynb` | 轻量卷积网络相关设计；Notebook 中也先回顾 MobileNetV1 的深度可分离卷积及宽度、分辨率系数。 |
| `005_MobileNetV3.ipynb` | h-swish、SE 通道注意力，以及相较 MobileNetV2 的结构设计变化。 |
| `006_VisionTransformer.ipynb` | 注意力计算、多头注意力与 Transformer 结构，并通过张量形状示意辅助理解视觉模型中的模块。 |

同一目录还包含 `A001_TensorBoard.ipynb`（SummaryWriter、标量和图像记录）、`A002_python面向对象.ipynb`（类、属性、继承与 `super()`）等配套学习材料。它们是相邻的基础工具/语言笔记，不属于模型性能对比实验。

### 2. 按主题整理的学习笔记

`学习笔记/` 包含 `ch2.ipynb` 至 `ch7.ipynb`。从 Notebook 标题和章节内容可见，主题大致沿着以下顺序展开：

1. **感知机**：从逻辑门和简单线性组合认识最初的神经网络单元。
2. **神经网络与激活函数**：了解阶跃函数、Sigmoid、ReLU 等非线性函数在网络中的作用。
3. **学习与梯度**：整理损失函数、数值微分、梯度法和学习算法的基本流程。
4. **误差反向传播**：通过计算图、Sigmoid 层、矩阵形式和 Softmax 层记录反向传播过程。
5. **学习技巧**：覆盖 SGD、Momentum、AdaGrad、Adam 等参数更新方法；Notebook 还记录梯度消失、权重初始化、过拟合控制、Batch Normalization 与超参数搜索等相关内容。
6. **卷积神经网络**：整理卷积层、池化层和基于 `im2col` 的展开思路。

这些是个人 Notebook 记录，内容完整度与表述方式以各文件当前版本为准；它们不等同于一套经过统一审核的课程讲义。

### 3. 《深度学习入门》章节代码

`鱼书1_深度学习入门-基于python的理论和实现/` 保留了第 1 至第 8 章的 Python 示例代码，并带有 `common/`、`dataset/`、`学习笔记/` 等配套目录。章节脚本覆盖从基础绘图和感知机、神经网络推理，到损失与梯度、反向传播、优化技巧、卷积网络及更深层网络的示例；共享目录中包含函数、梯度、层、优化器、训练器和数据集相关代码。对应 README 指出，代码解释请参考原书；执行方式是进入相应章节目录后运行 Python 脚本。

仓库另有 `鱼书四部曲/` 文件夹，当前可见四份 PDF，标题分别涉及《深度学习入门：基于 Python 的理论与实现》《深度学习入门：强化学习》《深度学习入门：自制框架》和《深度学习进阶：自然语言处理》。它们是仓库中单独存放的书籍文件，不代表本项目原创出版物，也不应与代码目录下的许可证混为一谈。

## 建议的阅读顺序

仓库 README 给出的路线从 Python / NumPy 和神经网络基础开始，再学习反向传播、CNN 与 PyTorch，随后阅读 AlexNet、ResNet、MobileNet，最后进入 Vision Transformer。可以用 `学习笔记/` 对照概念，用《深度学习入门》的章节脚本观察从零实现的基本步骤，再读 `pytorch_经典网络/` 中的 Notebook 比较不同结构的设计。README 还建议关注张量形状、参数量、计算量和边缘端部署适用性；这属于阅读时可以追问的问题，不意味着仓库已经提供了完整的统一测评结果。

## 使用方式与环境

先克隆仓库，然后按目标内容选择 Notebook 或章节脚本：

```bash
git clone https://github.com/Tommie-P-xl/resource_deeplearning.git
cd resource_deeplearning
```

顶层 README 建议使用 Python、PyTorch、Jupyter Notebook / JupyterLab 或 VS Code，并给出了 `numpy`、`matplotlib`、`jupyter`、`torch`、`torchvision` 的常用安装示例。PyTorch 版本需根据本机环境选择；仓库没有统一锁定所有目录依赖的环境文件，因此应检查具体 Notebook 的导入、数据路径和运行单元。书籍配套代码目录另有 README，列出的基础要求为 Python 3.x、NumPy 与 Matplotlib，并说明可进入章节目录执行脚本。

## 资料与版权说明

仓库 README 已说明，第三方书籍、论文、数据集和其他资料的版权归各自作者或版权方所有，建议通过官方渠道获取。特别是 `鱼书四部曲/` 中的书籍 PDF，不能因为它们与代码同处一个仓库就视为 MIT 授权。`鱼书1_深度学习入门-基于python的理论和实现/` 中单独附有 MIT License 文件，许可文件标注的代码版权人为 Koki Saitoh；该许可范围不能自动延伸到其他书籍、PDF、数据集或 Notebook 中的第三方材料。使用、转载或再分发时应分别核对原始来源及对应授权。

## 项目链接

- [GitHub 仓库与最新目录](https://github.com/Tommie-P-xl/resource_deeplearning)
- [PyTorch 经典网络 Notebook](https://github.com/Tommie-P-xl/resource_deeplearning/tree/main/pytorch_%E7%BB%8F%E5%85%B8%E7%BD%91%E7%BB%9C)
- [主题学习笔记](https://github.com/Tommie-P-xl/resource_deeplearning/tree/main/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0)
