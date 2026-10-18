---
title: OpenMax PyTorch
description: 基于 PyTorch 的 OpenMax 开集识别实现，包含模型训练、类均值激活向量计算、Weibull 拟合与推理评估。
tech: [Python, PyTorch, ResNet-50, SciPy, scikit-learn]
github: https://github.com/Tommie-P-xl/OpenMax-PyTorch
featured: true
date: 2026-03-27
---

## 项目简介

本项目实现 CVPR 2016 论文《Towards Open Set Deep Networks》的 OpenMax 流程：以已知类别训练分类模型，统计各类平均激活向量（MAV）及距离分布，再用 Weibull 分布校准输出，为未知类别保留拒识分数。

## 当前能力

- 使用 ResNet-50 主干网络，支持自定义 `.npy` 数据集。
- 可从单一数据集按配置划分训练、验证和测试数据，并指定未知类。
- 提供训练、MAV / 距离统计、Weibull 参数拟合和开集推理脚本。
- 支持固定或自动选择未知类阈值，并记录开集评估结果。

## 技术

Python、PyTorch、SciPy、scikit-learn、PyYAML 与 TensorBoard。数据路径、类别划分和实验参数通过 YAML 配置。
