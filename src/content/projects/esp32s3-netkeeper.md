---
title: ESP32-S3 NetKeeper
description: 基于 ESP-IDF 与 FreeRTOS 的校园网守护设备，集成网络探测、SRun 自动认证、LVGL 触摸界面、Web 配置、双存储同步与电源管理。
tech: [C, ESP32-S3, ESP-IDF, FreeRTOS, LVGL, HTTP, NVS, SDMMC]
github: https://github.com/Tommie-P-xl/esp32s3-netkeeper
featured: true
featuredOrder: 1
category: 嵌入式开发
date: 2026-11-01
---

## 项目要解决的问题

校园网认证失效或 WiFi 断开后，设备需要重新连接与登录。NetKeeper 将一块 ESP32-S3 触摸屏开发板做成独立的网络守护设备：定时探测外网，在确认未认证后执行 SRun 登录，并把网络状态、配置与手动操作放到屏幕和局域网网页中。

项目采用 Waveshare ESP32-S3-Touch-AMOLED-2.16，基于 **ESP-IDF 6.1、FreeRTOS 与 LVGL**。当前仓库版本为 **1.2.1**。认证协议面向 SRun，换学校需要调整 Portal 地址与参数；其他认证系统需要移植协议实现。

## 从网络事件到设备界面

1. **连接与探测**：连接已保存的 WiFi，使用外网探测地址、跳转信息和 SRun 会话状态判断是否需要认证，避免把普通 HTTP 200 直接视为已联网。
2. **认证与恢复**：明确未认证后执行登录，再次探测外网；掉线时保留目标网络并重连，网络状态跟随实际链路更新。
3. **本地操作**：LVGL 触摸界面提供状态查看、WiFi 选择、账号管理与手动认证。WiFi 列表先显示已有结果，再后台扫描，减少操作等待。
4. **网页配置**：固件内嵌 HTML，通过 HTTP 接口管理配置。未解锁时只显示验证码入口，校验成功才展示账号与状态；轮询更新保留正在编辑的输入框。
5. **存储与电源**：配置在 NVS 和可选 SD 卡间同步，支持 SD 热插拔；结合 AXP2101 管理充电状态、低电保护、熄屏与 CPU 降频。

## 工程实现与调试

| 问题 | 实现与取舍 |
| --- | --- |
| 多任务访问显示资源 | LVGL 操作通过统一显示锁协调，亮度命令与绘图共用锁，避免并发访问屏幕 SPI |
| WiFi 扫描后残影、显示块发送失败 | 在网络启动前预留内部 DMA 缓冲并复用，完成一次传输后再复用缓冲，减少运行时连续内存分配失败 |
| 界面扫描卡顿 | 网络扫描放在后台任务中，在显示锁外计算列表状态，只在更新控件时进入临界区 |
| 设备配置持久化 | NVS 与 SD 双存储，支持人可读配置和热插拔，同时保护当前活跃网络 |
| 省电与唤醒 | 结合触摸边沿、LVGL 输入状态与空闲时间控制熄屏和降频，避免充电噪声持续刷新活动时间 |
| 中文字库与固件体积 | 扫描 UI 源码用字生成中文字体子集，保留混排可读性并控制字体大小 |

这些记录覆盖任务同步、网络状态机、内存与外设调试，以及从设备界面到 Web 管理的完整功能链路。

## 最近同步的功能

- 网页验证码校验后再展示完整配置面板，缓存会话需先向设备验证。
- WiFi 后台扫描与刷新指示同步，结果未变化时保留已有列表。
- 修正认证跳转地址读取与 HTTP 200 误判，正常检测保留已有手动认证会话。
- 支持同一 WiFi 切换认证账号、特殊字符输入、SD / Flash 实时同步与低电保护。

## 构建与项目资料

仓库提供 Windows 构建、烧录和串口工具，以及固定 ESP-IDF 版本的 CI。界面截图可在电脑端运行同一份 LVGL UI 源码生成；截图使用模拟数据，便于检查布局。

- [源码、硬件与配置说明](https://github.com/Tommie-P-xl/esp32s3-netkeeper)
- [更新记录](https://github.com/Tommie-P-xl/esp32s3-netkeeper/blob/main/CHANGELOG.md)
- [界面预览与截图说明](https://github.com/Tommie-P-xl/esp32s3-netkeeper#界面预览)
- [固件发布](https://github.com/Tommie-P-xl/esp32s3-netkeeper/releases/latest)
