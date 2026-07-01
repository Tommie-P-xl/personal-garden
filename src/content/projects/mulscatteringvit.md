---
title: Scattering-ViT
description: 基于可学习散射网络和 Vision Transformer 的射频信号分类框架
tech: [Python, PyTorch, ViT, Scattering Transform]
github: https://github.com/Tommie-P-xl/MulScatteringViT
featured: true
date: 2026-04-03
---

## 项目简介

实现了一个前沿深度学习框架，结合可学习散射网络和 Vision Transformer 进行射频信号分类。处理频谱图数据（射频信号的时频表示），实现多信号类型的高精度分类。

## 核心功能

- **多架构支持**：ResNet50、ViT、DeiT、PVT、Swin Transformer 及混合模型
- **可学习散射网络**：可训练的小波散射变换，鲁棒特征提取
- **多尺度处理**：S0、S1、S2 多阶散射系数，多分辨率分析
- **生产就绪**：混合精度训练、梯度累积、学习率调度

## 技术栈

- Python / PyTorch 2.x / Kymatio
- timm (Vision Transformers) / TensorBoard
- scikit-learn / matplotlib / seaborn
