---
title: ViM-Pytorch
description: 基于 Virtual-logit Matching 算法的无人机射频信号开集识别系统
tech: [Python, PyTorch, ViM, Signal Processing]
github: https://github.com/Tommie-P-xl/ViM-Pytorch
featured: true
date: 2026-04-17
---

## 项目简介

将 CVPR 2022 的 ViM（Virtual-logit Matching）算法应用于无人机射频信号的开集识别任务。输入 512×512 STFT 能量谱，无需修改网络结构、无需额外 OOD 数据，推理速度极快。

## 核心功能

- **OOD 检测**：判断输入是已知类还是未知类
- **已知类分类**：对 ID 样本给出具体类别标签
- **特征缓存**：首次运行前向传播，后续直接加载缓存
- **全面评估**：AUROC、AUPR、FPR@TPR95、Open-Set Acc 等指标

## 技术栈

- Python / PyTorch 2.x / ResNet-50
- YAML 配置管理 / TensorBoard 训练可视化
- 混合精度训练 / tqdm 进度条
