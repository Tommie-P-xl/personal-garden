---
title: OpenMax PyTorch
description: 基于 ResNet-50 的开集识别复现项目，覆盖闭集训练、MAV 与距离统计、Weibull 尾部拟合、OpenMax 分数重校准和未知类阈值评估。
tech: [Python, PyTorch, ResNet-50, OpenMax, Weibull, SciPy, scikit-learn]
github: https://github.com/Tommie-P-xl/OpenMax-PyTorch
featured: true
featuredOrder: 3
date: 2026-03-27
---

## 项目定位

[OpenMax-PyTorch](https://github.com/Tommie-P-xl/OpenMax-PyTorch) 是对 CVPR 2016 论文 *Towards Open Set Deep Networks* 核心思路的 PyTorch 实现。普通闭集分类器必须把输入分到训练时见过的类别之一；开集识别还要判断输入是否来自训练类别集合之外。本项目先训练一个已知类分类器，再用类内激活距离的尾部拟合 Weibull 分布，推理时把一部分已知类分数转移到“未知”分数。

当前仓库 README 标注项目基于 PyTorch 2.8，并称最低要求为 Python 3.8、PyTorch 2.0。模型文件使用 torchvision 的 ResNet-50，适配单通道输入和可变已知类数；仓库围绕单个 NPY 数据集提供配置、数据划分、训练、参数拟合和评估脚本。这里描述的是仓库当前代码与配置，不代表我已在特定数据集上复现实验结果。

## 处理流程

1. **按类别划分数据**：数据加载器按照 random_seed 对每类样本打乱，再按配置切分训练、验证和测试索引。训练与 Weibull 拟合会排除 unknown_classes；开集测试重新加载完整类别集合，并把这些类别标为 -1。
2. **训练闭集分类器**：train.py 只用剩余已知类训练 ResNet-50；验证集也只含已知类，最佳权重写入 checkpoints/best_model.pth。
3. **构造类中心与距离样本**：compute_weibull_params.py 重用同一随机种子和划分，只在训练子集上收集被分类正确的样本。每类正确样本的激活向量均值就是 MAV（Mean Activation Vector）；再计算每个正确样本到本类 MAV 的距离，形成类内距离分布。
4. **拟合距离尾部**：对每个类别、每个通道，取距离最大的至多 weibull_tail_size 个值，用 scipy.stats.weibull_min.fit 做最大似然拟合。样本不足尾部大小时使用现有全部有效距离。
5. **重校准分数并拒识**：推理计算样本与各类 MAV 的距离和 Weibull CDF 分数，只调整原始 Softmax 排名前 alpha_rank 的类。当前代码采用“概率质量重分配”方案：按 CDF 分数和排名权重衰减已知类概率，并将扣除的概率累计为未知类概率。输出为已知类概率加一个未知类概率，之后再按阈值判为未知或取最大已知类。

这条流程把“模型置信度”与“距已知类典型样本有多远”结合起来。它仍依赖训练数据、类内分布、距离度量、尾部大小和拒识阈值；OpenMax 并不会自动保证未见类别都能被识别。

## 当前实现与需留意之处

- ResNet-50 全局池化后的标准特征维度是 2048，分类头输出维度是已知类数量。不过当前 ResNet50OpenMax.extract_features() 最终返回的是 (logits, logits)，而不是文档注释所写的“fc 前特征、logits”。MAV、距离和 OpenMax 推理目前因此使用分类 logits 空间。阅读结果或复现实验时应按代码实际行为理解；如改为真正的 2048 维表示，需要同步调整训练后参数拟合与推理路径，并重新生成所有 MAV/Weibull 文件。
- README 将 Weibull 分数描述为 1 - CDF，但 WeibullModel.w_score() 实际返回的是 Weibull CDF，推理再用该值计算分数衰减。下文的流程以当前函数实现为准；这与经典 OpenMax/LibMR 的尾部建模不能不加区分地视为完全等价。
- 配置里 n_channels: 1，和 README 举例中的 10 通道不同。代码把激活向量均匀切成通道；当前设置意味着以整个 logits 向量作为一个通道。改变通道数会改变距离与拟合参数，必须重新运行参数计算。
- 当前 test.py 调用的开集数据加载器使用固定划分中的**验证集**；当 threshold_mode: optimal 时，它又在这批验证标签和未知分数上通过 ROC 的 Youden 指数选阈值，并在同一批数据上报告阈值分类指标。因此这组阈值后的指标是验证集选阈值结果，不是独立留出测试集的无偏最终成绩。若要报告泛化性能，应只在验证集确定阈值，再在未参与阈值选择的测试集上评估。
- unknown_threshold: 0.1586 是配置中的固定值；默认 threshold_mode 当前为 optimal，此时固定值不会用于阈值选择。推理还包含“未知分数不低于阈值，或未知分数恰为输出最大值，则拒识”的规则。
- 仓库 README 说的是复现论文“核心算法”，不是原始官方实现的逐行复刻；此仓库用 SciPy 拟合 Weibull，且当前推理脚本明确选用概率重分配分支。

## 数据准备与默认配置

数据集不随代码仓库提供。配置默认指向 DroneRFb-Spectra，期望按类名分目录，每个样本为二维 .npy 数组（README 示例是 512 × 512）：

```text
DroneRFb-Spectra/
├── known_class_a/
│   ├── sample_001.npy
│   └── sample_002.npy
├── known_class_b/
│   └── sample_001.npy
├── 20/
├── 21/
├── 22/
└── 23/
```

目录名作为类别名。当前 config.yaml 将 20、21、22、23 设为未知类；训练和 Weibull 参数计算排除它们，开集测试将它们标为未知。更换数据时需修改 data.data_root 和 unknown_classes，并保证未知类目录名与列表完全一致。

数据读取器要求每个 .npy 样本是二维矩阵，逐样本做 min-max 缩放，再按配置的均值/标准差标准化，最后添加单通道维度。划分默认是训练/验证/测试 = 0.70/0.15/0.15，随机种子 42；划分先按类别进行，再打乱各个子集。配置默认输入通道 1、尺寸 512 × 512、ResNet-50、ImageNet 预训练开关为 true；训练批大小 4、最多 50 个 epoch、Adam、学习率 0.001、余弦调度、早停耐心 10。默认设备配置为 CPU，GPU 需在 YAML 中启用。

OpenMax 默认参数为 weibull_tail_size: 20、alpha_rank: 5、distance_type: eucos、n_channels: 1、threshold_mode: optimal，参数输出目录为 openmax_params/。这些是配置默认值，不是经过搜索验证的推荐最优参数。

## 运行顺序

在仓库根目录准备好数据并修改 config.yaml 后，按顺序执行：

```bash
# 1. 训练闭集分类器
python train.py --config config.yaml

# 2. 用训练集拟合类均值与 Weibull 参数
python compute_weibull_params.py --config config.yaml

# 3. 在脚本当前使用的开集验证集上评估
python test.py --config config.yaml
```

训练权重默认写入 checkpoints/best_model.pth；MAV 与 Weibull 参数写入 openmax_params/；测试指标、预测数组和阈值写入 logs/test_results.npz，ROC 图写入日志目录。项目另有 auto_tune.py，可围绕 Weibull 尾部大小、alpha 排名和距离类型运行参数组合；运行前应检查脚本中的组合、输出路径和备份策略，避免覆盖当前配置或混淆实验产物。

## 代码导航

| 路径 | 职责 |
| --- | --- |
| config.yaml | 模型、训练、数据、设备、日志和 OpenMax 参数 |
| data/dataset.py | 扫描类别文件夹、加载与预处理 NPY 样本 |
| data/data_split.py、data/dataloader.py | 分层索引划分、已知/未知类过滤与 DataLoader |
| models/resnet50_openmax.py、model_factory.py | ResNet-50 及模型、优化器、调度器创建 |
| train.py | 已知类闭集训练与验证 |
| openmax/mav_compute.py | 正确分类样本的类均值激活向量 |
| openmax/openmax_utils.py、openmax/distance_compute.py | 分通道距离度量与距离样本统计 |
| openmax/weibull_fitting.py | 尾部拟合、CDF 分数及参数读写 |
| compute_weibull_params.py | 训练集 MAV/距离/Weibull 参数计算入口 |
| openmax/openmax_inference.py | 分数重校准、批量预测与未知拒识 |
| test.py、utils/metrics.py | 阈值选择、评估和 .npz 结果保存 |
| auto_tune.py | 多组 OpenMax 参数自动化运行 |

## 评估口径与限制

代码提供已知类准确率、未知检测率（未知召回）、已知误拒率、未知预测精确率、AUROC、输入/输出方向 AUPR、OSCR 和混淆矩阵。AUROC/AUPR 使用连续未知类分数；检测率、误拒率和精确率则受最终阈值影响。比较实验时应同时报告这些口径与阈值来源，不能只写一个“开集准确率”。

README 列出的安装方式为：

```bash
pip install torch torchvision numpy scipy scikit-learn pyyaml tqdm
```

它声明 Python ≥ 3.8、PyTorch ≥ 2.0，同时项目简介注明以 PyTorch 2.8 为基础。实际安装时应使用彼此兼容的 PyTorch/torchvision 版本；另外 test.py 导入 Matplotlib 绘制 ROC 曲线，而 README 的依赖命令未列出 matplotlib，运行测试脚本时需确认已安装。训练日志使用 TensorBoard（代码支持缺少该包时关闭对应记录）。这些信息来自仓库 README 和代码导入，不代表在本项目环境中已完整验证安装或运行。

## 参考

- Bendale, A. & Boult, T. E. *Towards Open Set Deep Networks*. CVPR 2016.
- [论文全文](https://openaccess.thecvf.com/content_cvpr_2016/html/Bendale_Towards_Open_Set_CVPR_2016_paper.html)
- [作者官方实现 OSDN](https://github.com/abhijitbendale/OSDN)
