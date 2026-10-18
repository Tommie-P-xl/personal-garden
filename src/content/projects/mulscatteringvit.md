---
title: Scattering-ViT
description: 射频信号分类研究代码，探索可学习散射变换、多尺度特征与视觉 Transformer 的组合。
tech: [Python, PyTorch, Kymatio, timm, Vision Transformer]
github: https://github.com/Tommie-P-xl/MulScatteringViT
featured: true
date: 2026-04-03
---

## 项目简介

Scattering-ViT 面向射频信号的时频谱图分类，包含可学习散射网络、常规视觉模型和散射网络与分类器组合的实验实现。仓库 README 提供训练、测试、数据格式及架构说明。

## 当前内容

- 多尺度散射系数（S0、S1、S2）与可学习小波滤波器实现。
- 支持 ResNet、ViT、DeiT、PVT、Swin 等模型及混合架构。
- 包含训练、评估、STFT 处理与可视化脚本。
- 使用单通道 512×512 `.npy` 时频谱图作为 README 中说明的输入示例。

## 技术

Python、PyTorch、Kymatio、timm，以及 TensorBoard、scikit-learn 和常用绘图库。
