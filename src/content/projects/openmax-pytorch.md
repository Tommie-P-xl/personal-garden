---
title: OpenMax-PyTorch
description: 基于 PyTorch 2.8 的 OpenMax 开集识别算法实现
tech: [Python, PyTorch, Deep Learning, scipy]
github: https://github.com/Tommie-P-xl/OpenMax-PyTorch
featured: true
date: 2026-03-27
---

## 项目简介

复现论文 "Towards Open Set Deep Networks" (CVPR 2016) 的核心算法，基于 PyTorch 2.8 框架，主干网络从 AlexNet 升级为 ResNet50，支持自定义 NPY 格式数据集。

## 核心功能

- **开集识别**：识别训练时未见过的未知类别
- **威布尔拟合**：使用威布尔分布拟合距离尾部
- **自动化调优**：自动遍历参数组合，整理实验结果
- **完整流程**：训练 → 威布尔参数计算 → 开集推理 → 评估

## 技术栈

- Python / PyTorch 2.8 / ResNet50
- scipy / scikit-learn / PyYAML
- TensorBoard 可视化 / YAML 配置管理
