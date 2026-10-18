---
title: Scattering-ViT
description: 面向射频时频谱图分类的研究代码，包含可学习散射网络、ViT 与 CNN 基线、多种组合模型，以及训练、评估和频谱图处理脚本。
tech: [Python, PyTorch, Kymatio, timm, Vision Transformer, RF]
github: https://github.com/Tommie-P-xl/MulScatteringViT
featured: true
date: 2026-04-03
---

## 项目定位

[Scattering-ViT](https://github.com/Tommie-P-xl/MulScatteringViT) 是一个面向射频（RF）信号识别的实验仓库。它把 RF 信号的时频谱图当作单通道图像，尝试在图像分类骨干前加入散射变换，再用 Vision Transformer（ViT）或 CNN 完成多分类。仓库同时提供纯 ViT、纯 ResNet 等对照模型，便于在同一训练入口和数据管线下配置不同架构。

项目 README 将目标描述为“高精度”RF 分类，但仓库首页没有给出可复核的测试集指标表、固定基准协议或可下载的训练权重。因此这里把它作为**模型实现与实验流程仓库**介绍，不据此声称某种架构已经取得特定精度或优于基线。

## 任务与数据流

仓库面向“时频图 → 类别”的监督分类任务。README 中给出的主要输入是按类别目录组织的单通道 NumPy 频谱图：

```text
data_root/
├── class_00/
│   ├── sample_001.npy
│   └── sample_002.npy
├── class_01/
│   └── ...
└── ...
```

README 举例使用 `DroneRFb_1000` 数据目录，并把样本描述为 `512 × 512` 浮点数组。仓库里的 `SpectrogramDataset` 按类别子目录收集 `.npy`，按类别名排序生成标签；样本读取后转成 `float32`，增加单通道维度，并按配置尺寸处理。数据加载器把样本随机拆成训练、验证和测试子集，再以 `0.5` 均值和 `0.5` 标准差做归一化。当前切分是对样本索引随机划分，代码没有实现按设备、采集批次或场景分组的隔离切分；需要严谨评估跨场景泛化时，应先确认数据集本身的划分方案。

有一个值得注意的输入细节：README 写的是 `512 × 512`，而数据集类的注释提到了 `(543, 512)` 输入；实际读取逻辑在尺寸不匹配时直接截取前 `512` 行和 `512` 列，不是缩放或居中裁剪。准备数据时应检查 `.npy` 的实际 shape、数值范围和预处理方式，避免静默裁切改变时频图内容。仓库包含 STFT/DFT 相关脚本和可视化脚本，但训练数据接口读取的是已生成的 `.npy`；README 没有明确说明从原始 IQ 数据到训练集的完整、可复现转换命令。

整体流程可以概括为：

1. 预先准备并按类别存放的 RF 时频谱图 `.npy` 文件。
2. 数据集读取、单通道张量转换、尺寸截取与归一化，并划分 train/val/test。
3. 根据 YAML 配置构建散射前端、ViT/CNN 分类器或纯视觉基线。
4. 训练期间记录损失和分类指标，保存检查点；随后用测试脚本生成分类评估结果。

## 模型与散射网络

README 按组合方式列出了以下模型家族：

| 家族 | README 中的名称 | 说明 |
| --- | --- | --- |
| 散射 + ViT | `mulsn_vit`、`sn_vit`、`mulsn_sx_vit` | 多尺度散射、标准散射或选择散射阶数，再连接 ViT 分类器 |
| 散射 + CNN | `sn_resnet50`、`mulsn_sx_resnet50` | 将散射特征交给 ResNet50 分类器 |
| 视觉基线 | `resnet50`、`vit`、`DeiT`、`PVT`、`Swin` | 不同 CNN 或 Transformer 分类骨干 |

配置目录也列有相应 YAML，包括 `mulsn_vit.yaml`、`sn_vit.yaml`、`mulsn_sx_vit.yaml`、`mulsn_sx_resnet50.yaml`、`sn_resnet50.yaml`、`resnet50.yaml`、`vit.yaml`、`DeiT.yaml`、`PVT.yaml` 和 `Swin.yaml`。配置名代表仓库提供的实验入口，不等同于这些模型都已在同一数据划分和硬件上完成公平对比。

按 README 对散射部分的说明，网络支持 `S0`、`S1`、`S2` 多阶系数；可学习小波部分以 Morlet 小波为基础，涉及方向和尺度参数，并列出 canonical、pixelwise、equivariant 等参数化选项以及 Tight-Frame 初始化。多尺度版本的 README 描述为进行多分辨率散射分析并组合不同尺度的特征；选择阶数版本则用于配置散射阶数。这里仅记录 README 明确列出的能力，不把这些文字扩展成未由文档或实验报告证明的稳定性、鲁棒性或精度结论。

在组合模型里，散射模块负责产生供分类器使用的表示，ViT 后端负责处理特征并输出类别分数。仓库同时保留纯视觉分类模型，适合围绕“散射前端是否有帮助”设计消融；但要得出比较结论，仍需固定数据拆分、预处理、训练轮数、随机种子和计算资源，并报告多次运行结果。

## 训练配置与评估

README 给出的基本训练和测试命令为：

```bash
pip install -r requirement.txt

# 训练示例
python train.py --config config/resnet50.yaml

# 测试示例
python test.py \
  --config config/resnet50.yaml \
  --checkpoint ./checkpoints/best_model.pth \
  --output_root ./test_results

# 查看训练日志
tensorboard --logdir="./tf-logs"
```

`config/resnet50.yaml` 是一个具体实验设置，而非所有模型的通用默认值。当前仓库配置中，该例使用 `DroneRFb_1000` 路径、`512 × 512` 输入、24 类、50 个 epoch、batch size 32、梯度累积步数 2、AdamW、初始学习率 `1e-4`、权重衰减 `1e-5`、plateau 调度器、随机种子 42，并启用混合精度；验证集与测试集比例各为 0.15。改用其他模型时，应对应选择其配置文件，并检查其中的前端、后端、类别数和数据路径是否与当前数据匹配。

README 和训练/评估脚本列出的能力包括混合精度、梯度累积、学习率调度、梯度裁剪、TensorBoard 日志与检查点；测试脚本还可计算 Top-1/Top-5、混淆矩阵、分类报告，以及参数量、计算量和推理速度等指标。后几项属于**运行时可计算的评估项**，不是仓库已经发布的性能结果。测试应在目标硬件上实际运行，并记录环境、checkpoint、数据拆分和命令，才能复核数值。

## 目录速览

```text
models/
├── base_models.py       # 散射模块
├── top_models.py        # 分类器与 Transformer 结构
└── create_filters.py    # 滤波器相关实现
config/                  # 各模型的 YAML 配置
kymatio/                 # 仓库包含的散射变换代码
data_load.py             # .npy 数据集与 DataLoader
model_factory.py         # 按配置构造模型
train.py / test.py       # 训练、测试和评估入口
dft_stft.py / stft.py    # 时频处理相关脚本
show_stft.py             # 频谱图展示
requirement.txt          # Python 包清单
command.txt              # 命令与数据解压示例
```

GitHub 当前默认分支的 README 文件为 `README.md`、`README.en.md` 和 `README.zh-CN.md`；根目录还包含配置、模型、数据加载、训练评估及频谱处理脚本。README 的中英文版本描述同一项目定位与主要功能，中文版本便于快速了解任务、模型和数据格式。

## 环境与复现注意事项

- README 建议使用 PyTorch 2.x，并列举 `timm`、TensorBoard、scikit-learn、matplotlib、seaborn 等依赖；`requirement.txt` 还包含 NumPy、SciPy、OpenCV、Pillow、pandas、scikit-image、tqdm、joblib 和 `ptflops` 等。
- 当前 `requirement.txt` 未列出 PyTorch 与 torchvision；使用前需按 CUDA/CPU 环境单独安装匹配版本。仓库根目录有 `kymatio/`，而 README 又把 Kymatio 列作散射相关依赖，运行时应核对导入究竟使用本地代码还是安装包，避免版本混用。
- 示例配置里的数据目录是 Linux 环境路径，换机器后需改成自己的数据根目录；类别数、输入通道和图像尺寸也要与数据匹配。
- README 没有提供固定测试集分数表或权重下载入口，因此不应把 README 的“高精度”表述当成可复现的实验结论。评估效率时还要单独记录 GPU/CPU 型号、预热与计时设置。

## 仓库状态

截至本次核对，GitHub 默认分支最近一次提交记录为 **2026-04-03**，该次更新包含 README 文件修改。上游来源： [项目仓库](https://github.com/Tommie-P-xl/MulScatteringViT)、[中文 README](https://github.com/Tommie-P-xl/MulScatteringViT/blob/main/README.zh-CN.md)、[English README](https://github.com/Tommie-P-xl/MulScatteringViT/blob/main/README.en.md)、[配置目录](https://github.com/Tommie-P-xl/MulScatteringViT/tree/main/config)、[数据加载实现](https://github.com/Tommie-P-xl/MulScatteringViT/blob/main/data_load.py)、[训练入口](https://github.com/Tommie-P-xl/MulScatteringViT/blob/main/train.py)、[测试入口](https://github.com/Tommie-P-xl/MulScatteringViT/blob/main/test.py)。
