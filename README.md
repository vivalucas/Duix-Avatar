# Duix-Avatar 局域网分机部署指南（Fork 版）

本 Fork 将原项目的“单机本地部署”改为“前后端分离、同局域网两台设备部署”。下面给出完整改动与部署步骤，便于复现与参考。

## 概述
- 后端：Ubuntu（示例 IP `10.1.1.6`，实际以用户局域网服务器 IP 为准）运行 TTS 与视频生成容器，数据目录挂载至 `/data/duix_avatar_data`。
- 前端：Windows 11（示例 IP `10.1.1.8`，实际以用户局域网客户端 IP 为准）运行 Electron 客户端，通过局域网访问后端 API；本地使用符号链接 `D:\duix_avatar_data` 指向 Ubuntu 的 SMB 共享。

## 改动清单（代码）
- 修改 `src/main/config/config.js` 支持通过环境变量覆盖后端地址与数据根目录：
  - `DUIX_TTS_URL`（默认 `http://10.1.1.6:18180`）
  - `DUIX_F2F_URL`（默认 `http://10.1.1.6:8383/easy`）
  - `DUIX_DATA_ROOT_WIN`（默认 `D:\duix_avatar_data`）
  - `DUIX_DATA_ROOT_LINUX`（默认 Linux `~/duix_avatar_data`）
- 若不设置环境变量，代码仍按示例 IP 工作；发布时请按使用者自有局域网实际 IP 与路径配置。
- `deploy/docker-compose-linux.yml` 的卷挂载（Ubuntu）：
  - TTS：`/data/duix_avatar_data/voice/data:/code/data`
  - 视频生成：`/data/duix_avatar_data/face2face:/code/data`

## 部署拓扑
- Ubuntu（服务器）：Docker 运行 `duix-avatar-tts`、`duix-avatar-gen-video` 等服务，对外暴露 `18180` 与 `8383`。
- Windows（客户端）：经 `http://<LAN_SERVER_IP>:18180` 与 `http://<LAN_SERVER_IP>:8383/easy` 调用后端；本地 `D:\duix_avatar_data` 为符号链接指向 `\\<LAN_SERVER_IP>\duix_avatar_data`（Samba 共享名建议为 `duix_avatar_data`）。

## Ubuntu 后端部署
1. 准备目录（示例）：
   - `sudo mkdir -p /data/duix_avatar_data/voice/data/origin_audio`
   - `sudo mkdir -p /data/duix_avatar_data/face2face/temp`
2. 安装 GPU 运行时（如需）：
   - `sudo apt-get install -y nvidia-container-toolkit`
3. 修改 `deploy/docker-compose-linux.yml` 的 `volumes` 为 `/data/...`（本仓库已改）。
4. 启动服务：`docker compose -f deploy/docker-compose-linux.yml up -d`
5. 验证端口监听：
   - 宿主机：`ss -tlnp | grep 18180`、`ss -tlnp | grep 8383`
   - 宿主机：`curl -I http://127.0.0.1:18180`、`curl -I http://127.0.0.1:8383/easy`

## Windows 前端部署
1. 打开“开发人员模式”。
2. 验证 UNC 是否可见：
   - `Test-Path "\\<LAN_SERVER_IP>\duix_avatar_data"`
   - 如返回 `False`，先建立连接：`net use \\<LAN_SERVER_IP>\duix_avatar_data /persistent:yes`
3. 用 CMD 创建目录符号链接（不依赖映射盘）：
   - `cmd /c mklink /D D:\duix_avatar_data \\<LAN_SERVER_IP>\duix_avatar_data`
4. 构建或安装客户端：
   - 开发者：`npm install && npm run build:win`
   - 或直接运行已构建安装包。
5. 可选：通过环境变量定制前端后端地址与路径：
   - 设置系统环境变量 `DUIX_TTS_URL`、`DUIX_F2F_URL`、`DUIX_DATA_ROOT_WIN`，然后运行客户端。

## 连通性验证
- Windows 端：
  - `Test-NetConnection -ComputerName <LAN_SERVER_IP> -Port 18180`
  - `Test-NetConnection -ComputerName <LAN_SERVER_IP> -Port 8383`
- Ubuntu 端：
  - `curl -I http://127.0.0.1:18180`、`curl -I http://127.0.0.1:8383/easy`

## 常见问题
- 访问 `D:\duix_avatar_data` 报“重分析点缓冲区数据无效”:
  - 原因：Junction 不支持 UNC；请使用目录符号链接（`mklink /D`）。
- TTS 端口连接被重置或拒绝：
  - 容器未在 `8080` 监听或 GPU 显存不足（OOM）。可暂用 CPU 运行（`CUDA_VISIBLE_DEVICES=""`）或释放显存后重启容器。
- Windows 打包时符号链接权限：
  - 开启“开发人员模式”、以管理员运行、或改用未打包版本测试。

## 参考链接（保留）
- 原项目地址（duix 官方）：https://github.com/duixcom/Duix.Avatar
- 原说明文档（中文）：https://github.com/duixcom/Duix.Avatar/blob/main/README_zh.md
- 原说明文档（英文）：https://github.com/duixcom/Duix.Avatar/blob/main/README.md
