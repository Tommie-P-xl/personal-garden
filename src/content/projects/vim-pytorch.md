---
title: ViM UAV Open-Set Recognition
description: 将 Virtual-logit Matching 用于无人机射频信号开集识别，使用 STFT 能量谱和可配置分类主干。
tech: [Python, PyTorch, ViM, ResNet-50, Signal Processing]
github: https://github.com/Tommie-P-xl/ViM-Pytorch
featured: true
date: 2026-05-08
---

## 项目简介

该项目把 CVPR 2022 的 Virtual-logit Matching（ViM）应用于无人机射频信号开集识别。任务同时判断样本是否属于已知分布，并为已知样本输出类别。

## 当前流程

- 输入为按类别目录组织的 512×512 STFT 能量谱 `.npy` 文件。
- 通过配置选择 ResNet-50 等分类主干，完成已知类训练。
- 从特征空间与 logits 计算 ViM 分数，使用阈值区分已知类和 OOD 样本。
- 提供数据集结构验证、虚拟数据生成、训练和测试脚本。
- 评估包含 AUROC、AUPR、FPR@TPR95 及开集分类指标。

## 技术

Python、PyTorch、YAML 配置、TensorBoard 与 NumPy。完整的数据准备、训练和测试命令见仓库 README。
