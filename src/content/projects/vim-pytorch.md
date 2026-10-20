---
title: ViM-Pytorch：无人机射频开集识别
description: 用 PyTorch 训练无人机射频 STFT 分类器，并在特征空间上拟合 Virtual-logit Matching（ViM），区分已知类别与未知信号。
tech: [Python, PyTorch, ViM, ResNet, Open-Set Recognition, RF]
github: https://github.com/Tommie-P-xl/ViM-Pytorch
featured: true
featuredOrder: 1
date: 2026-05-08
---

## 项目要解决的问题

这是一个面向无人机射频信号的开集识别实验工程。普通闭集分类默认测试时只会出现训练过的类别；开集识别还要面对训练中完全没有出现的类别。系统先判断样本是否属于已知分布（ID），只有通过检测的样本才会输出具体的已知类别；被拒绝的样本统一视作未知（OOD）。

输入数据是预先生成的单通道 STFT 能量谱，而不是原始 IQ 射频流：每个样本以 NumPy `.npy` 文件保存，仓库文档规定尺寸为 `512 × 512`。模型用分类损失学习已知类，再从分类头前的特征和 logits 计算 ViM 分数。分数越高越倾向于 ID，低于验证集确定的阈值则拒识。

## 从数据到开集判断

### 1. 按类别目录读入 STFT 样本

`dataset.root` 下的每个子目录被视为一个类别，目录名就是类别名。`dataset.unknown_classes` 明确列出的类别与已知类隔离：已知类样本按固定随机种子逐类打乱，再按 `train_ratio` 和 `val_ratio` 划分；剩余样本作为 ID 测试集。未知类的所有 `.npy` 样本只进入最终测试集，并被标为 `-1`。因此训练与验证都不接触未知类样本。

数据集加载器把二维数组转成 `(1, H, W)` Tensor，可按配置保留单通道，或复制为三通道；随后使用 `normalize_mean` 和 `normalize_std` 做归一化。实现只筛选目录中的 `.npy` 文件，不会在每次训练读样本时检查尺寸；可先运行验证脚本检查文件是否可读，并用 `--check_shape` 检查是否都是 `512 × 512`。

```text
data/uav_rf/
├── drone_DJI/          # 已知类示例
│   ├── sample_0001.npy
│   └── ...
├── drone_Parrot/       # 已知类示例
├── unknown_drone_A/    # 在配置中列为未知类
└── unknown_drone_B/    # 在配置中列为未知类
```

仓库不附带真实射频数据。`tools/generate_dummy_dataset.py` 能生成随机数组以检查数据管线能否运行，但这些合成样本不能用于说明真实识别效果。

### 2. 训练已知类分类器

模型工厂支持 ResNet-18、ResNet-50、ResNet-101 和 EfficientNet-B0。分类头类别数根据目录中识别到的已知类别动态创建；可选择 torchvision ImageNet 权重，并将首层卷积改为单通道输入（使用预训练权重时，以三通道卷积核的通道均值初始化单通道卷积）。训练目标是已知类交叉熵分类。

训练器记录训练与验证集 loss、accuracy 和学习率，可选 CUDA AMP 与梯度裁剪，并按验证集分类准确率保存最优检查点。这里的“最优”指闭集验证准确率最高的检查点，不是 ViM 的 OOD 检测分数最优。

### 3. 在训练特征上拟合 ViM，再用验证集定阈值

测试脚本先加载分类器，提取每个样本的分类头前特征、logits 和标签。ViM 实现按以下步骤拟合参数：

1. 根据分类头权重 `W` 和偏置 `b`，通过伪逆求坐标原点 `o = -b · pinv(Wᵀ)`。
2. 将训练集特征减去 `o`，对 `XᵀX` 做对称特征值分解；取最大特征值方向作为主子空间，其余方向组成残差空间基 `NS`。
3. 根据训练集平均最大 logit 与平均残差范数的比值确定缩放系数 `alpha`。
4. 对样本计算 `logsumexp(logits) - alpha × residual_norm`，作为仓库采用的 ViM 分数。残差范数是中心化特征在 `NS` 上投影的 L2 范数。

主子空间维度由 `vim.dim` 控制。`-1` 时，代码按特征维数选择：维数至少 2048 时取 1000，至少 768 时取 512，否则取特征维数的一半。此值是该工程的默认启发式，不是对每个数据集都最优的结论。

验证集只包含已知类。若 `vim.tpr=0.95`，实现取验证集 ViM 分数的第 5 百分位作为阈值，使验证集约 95% 的 ID 分数不低于阈值；测试时分数 `>= threshold` 判为 ID，否则判为 OOD。未知类不参与阈值选择。

## 评估输出与解读

测试流程报告 ID/OOD 检测 AUROC、AUPR-In、AUPR-Out、FPR@TPR95、指定阈值下的检测准确率与 F1；另报告只在 ID 测试样本上计算的 Closed-Set Accuracy 和各已知类准确率。测试样本中已知类的分类结果来自分类 logits 的 `argmax`，并不另设第二个分类模型。

当前评估器有一个需要留意的实现边界：构造综合开集预测时，OOD 样本不论 ViM 分数是否越过阈值，预测标签都被写成拒绝类。因此 `Open-Set Acc` 和 `Open Macro-F1` 会把被错误接纳的 OOD 样本也算作拒绝正确，不能据此评价 OOD false-accept。现阶段应结合原始检测指标、Closed-Set Accuracy 和混淆情况解读；若要使用综合指标，应先修正这段预测构造逻辑并重新评估。

此外，当前 FPR@TPR95 用排序后的 ID 分数选取经验阈值，再统计 OOD 分数达到该阈值的比例。它和验证集 `tpr` 所用的 NumPy 百分位阈值是两个不同计算步骤，样本量较小时可能有离散差异。指标代表代码在指定测试划分上的计算结果，不等于跨设备、跨采集环境的泛化保证。

## 主要配置

配置集中在 `configs/config.yaml`：

| 配置项 | 用途 | 仓库默认值 |
| --- | --- | --- |
| `dataset.root` | 类别子目录所在位置 | `./data/uav_rf` |
| `dataset.unknown_classes` | 完全留到测试阶段的未知类别目录名 | `unknown_drone_A`、`unknown_drone_B` |
| `dataset.train_ratio` / `val_ratio` | 每个已知类中的训练与验证占比 | `0.70` / `0.15` |
| `model.backbone` | torchvision 分类主干 | `resnet50` |
| `model.pretrained` | `imagenet` 或 `none` | `imagenet` |
| `model.single_channel_input` | 单通道输入适配 | `true` |
| `train.epochs` / `batch_size` | 训练轮数与批大小 | `100` / `64` |
| `train.optimizer` / `scheduler` | 优化器及学习率计划 | AdamW / cosine |
| `train.amp` / `grad_clip` | CUDA 混合精度与梯度裁剪 | `true` / `5.0` |
| `vim.dim` / `vim.tpr` | ViM 残差子空间维数与 ID 保留率 | `-1` / `0.95` |
| `paths.*` | 检查点、日志、特征缓存及结果位置 | `outputs/`、`runs/` |

每类样本数量较少时，整数截断可能使训练或验证分片为空；训练 DataLoader 还会丢弃最后一个不完整 batch。虽然 YAML 中有 `test_ratio`，当前 `DatasetBuilder` 实际上没有读取它，而是把已知类中 `train_ratio` 和 `val_ratio` 分走后的全部剩余样本放入测试集。正式运行前请检查类别样本数和拆分后统计，而不要只依赖默认比例。

## 运行方式

在仓库根目录安装 `requirements.txt` 中列出的依赖（PyTorch、torchvision、NumPy、SciPy、scikit-learn、PyYAML、TensorBoard、tqdm 和 Pillow），准备真实数据并按需修改配置：

```bash
pip install -r requirements.txt

# 检查目录、类别和样本数
python tools/verify_dataset.py --config configs/config.yaml

# 可选：逐个检查 .npy 是否能读取且形状为 512×512
python tools/verify_dataset.py --config configs/config.yaml --check_shape

# 训练已知类分类器
python train.py --config configs/config.yaml

# 用最优检查点拟合 ViM 并评估开集测试集
python test.py --config configs/config.yaml

# 指定检查点，或在数据/权重变化后强制重提特征
python test.py --config configs/config.yaml --checkpoint outputs/best_model.pth --force_recompute
```

测试脚本把 train、val、test 三个分片提取到 `outputs/feature_cache/{split}_features.npz`，包含 `features`、`logits` 和 `labels`，以减少重复网络前向计算。缓存名只按分片区分，没有绑定检查点、数据文件列表或配置摘要；更换权重、数据或预处理设置后应使用 `--force_recompute`，避免误用旧特征。结果默认保存到 `outputs/test_results.txt`。

## 实现范围与复现边界

该仓库提供的是可配置的实验代码骨架和指标计算流程。仓库 README 描述了 ViM 的理论动机，但 README 中没有提供可复核的真实数据划分、训练日志、测试结果或硬件基准；因此这里不声称已达到特定识别率，也不把“无需额外 OOD 数据”“推理快”等理论/动机性描述当作本仓库已实测结论。要形成可复现结果，需要记录真实数据来源及版本、已知/未知类别清单、随机种子、完整配置、检查点和测试输出。
