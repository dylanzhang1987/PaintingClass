#!/bin/bash

# PaintingClass 项目启动脚本
# 用途：一键启动数据库、后端和前端服务

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_CONTAINER="painting-mysql"
BACKEND_PORT=3000
FRONTEND_PORT=5173

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  PaintingClass 项目启动${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: 检查 Docker
echo -e "\n${YELLOW}[1/4] 检查 Docker 状态...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}错误: Docker 未运行，请先启动 Docker Desktop${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker 运行正常${NC}"

# Step 2: 启动数据库
echo -e "\n${YELLOW}[2/4] 启动 MySQL 数据库...${NC}"
if docker ps | grep -q "$DB_CONTAINER"; then
    echo -e "${GREEN}✓ 数据库已在运行${NC}"
else
    docker start "$DB_CONTAINER" > /dev/null
    echo -e "${GREEN}✓ 数据库启动成功${NC}"
fi

# Step 3: 检查端口是否被占用
echo -e "\n${YELLOW}[3/4] 检查端口占用...${NC}"

if lsof -i ":$BACKEND_PORT" -sTCP:LISTEN > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ 后端端口 $BACKEND_PORT 已被占用，跳过启动${NC}"
    START_BACKEND=false
else
    START_BACKEND=true
fi

if lsof -i ":$FRONTEND_PORT" -sTCP:LISTEN > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ 前端端口 $FRONTEND_PORT 已被占用，跳过启动${NC}"
    START_FRONTEND=false
else
    START_FRONTEND=true
fi

# Step 4: 启动服务
echo -e "\n${YELLOW}[4/4] 启动应用服务...${NC}"

# 启动后端
if [ "$START_BACKEND" = true ]; then
    cd "$PROJECT_DIR/backend"
    nohup npm run dev > /tmp/paintingclass-backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ 后端启动中 (PID: $BACKEND_PID)${NC}"
    echo "   日志: tail -f /tmp/paintingclass-backend.log"
else
    echo -e "${YELLOW}→ 后端已运行或跳过${NC}"
fi

# 启动前端
if [ "$START_FRONTEND" = true ]; then
    cd "$PROJECT_DIR/frontend"
    nohup npm run dev > /tmp/paintingclass-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓ 前端启动中 (PID: $FRONTEND_PID)${NC}"
    echo "   日志: tail -f /tmp/paintingclass-frontend.log"
else
    echo -e "${YELLOW}→ 前端已运行或跳过${NC}"
fi

# 等待服务就绪
echo -e "\n${YELLOW}等待服务就绪...${NC}"
sleep 3

# 显示启动结果
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  启动完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n访问地址:"
echo -e "  前端: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  后端: ${GREEN}http://localhost:$BACKEND_PORT${NC}"
echo -e "\n进程:"
echo -e "  后端: ${GREEN}$BACKEND_PID${NC}"
echo -e "  前端: ${GREEN}$FRONTEND_PID${NC}"
echo -e "\n${YELLOW}提示: 查看日志使用 tail -f /tmp/paintingclass-*.log${NC}"
