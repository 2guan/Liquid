# 部署指南 · Deploy

微醺时刻 The Sip & Sigh 以 Docker 容器方式在服务器上运行（Next.js 14 standalone 服务端，含 `/api/*` 大模型代理）。

## 一键部署

### 使用 GitHub 构建好的镜像

推送到 `main` 后，GitHub Actions 会发布镜像到 `ghcr.io/2guan/liquid:latest`。服务器只需要拉取并启动：

```bash
# 1. 准备环境变量（服务端密钥，永远不会进入浏览器）
cp .env.example .env
#    编辑 .env，填入你的 DeepSeek Key（DEEPSEEK_API_KEY=sk-...）
#    可选：修改 HOST_PORT 改变对外端口（默认 3210）

# 2. 拉取 GitHub 构建好的镜像并后台启动
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d

# 3. 访问
#    http://<服务器IP>:3210
```

如果镜像包仍是 private，需要先在服务器登录 GitHub Container Registry：

```bash
echo "<你的 GitHub token>" | docker login ghcr.io -u <你的 GitHub 用户名> --password-stdin
```

### 在服务器本地构建镜像

```bash
# 1. 准备环境变量（服务端密钥，永远不会进入浏览器）
cp .env.example .env
#    编辑 .env，填入你的 DeepSeek Key（DEEPSEEK_API_KEY=sk-...）
#    可选：修改 HOST_PORT 改变对外端口（默认 3210）

# 2. 构建并后台启动
docker compose up -d --build

# 3. 访问
#    http://<服务器IP>:3210
```

## 常用命令

```bash
docker compose -f docker-compose.ghcr.yml logs -f      # 查看日志
docker compose -f docker-compose.ghcr.yml ps           # 查看状态（含 healthcheck）
docker compose -f docker-compose.ghcr.yml restart      # 重启
docker compose -f docker-compose.ghcr.yml down         # 停止并移除容器
docker compose -f docker-compose.ghcr.yml pull         # 拉取 GitHub 最新镜像
docker compose -f docker-compose.ghcr.yml up -d        # 用最新本地镜像启动
```

如果使用本地构建版 `docker-compose.yml`，把上面的 `-f docker-compose.ghcr.yml` 去掉即可。

## 说明

- **端口**：容器内固定监听 `3000`；对外端口由 `.env` 的 `HOST_PORT`（默认 `3210`）决定，映射为 `HOST_PORT:3000`。
- **密钥安全**：`DEEPSEEK_*` 没有 `NEXT_PUBLIC_` 前缀，仅被服务端 `/api/*` 路由读取，不会打包进前端、不会发给浏览器。镜像本身**不包含** `.env`（见 `.dockerignore`），密钥在运行时由 compose 注入。
- **离线兜底**：未配置 Key 或 DeepSeek 不可达时，应用自动回退到内置的离线生成器，功能不中断。
- **镜像体积**：基于 Next.js `output: "standalone"` 多阶段构建，运行镜像只携带追踪到的依赖、静态资源与 `public/`（含自托管中文字体），并以非 root 用户 `nextjs` 运行。
- **反向代理（可选）**：如需 HTTPS/域名，在前面挂 Nginx/Caddy 反代到 `127.0.0.1:3210` 即可。

## 不用 compose 的等价命令

```bash
docker build -t liquid-atelier .
docker run -d --name liquid-atelier --restart unless-stopped \
  -p 3210:3000 --env-file .env liquid-atelier
```
