#!/bin/bash

# PaintingClass 项目停止脚本
# 用途：停止后端和前端服务（数据库保持运行）

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}========================================${NC}"
echo -e "${RED}  PaintingClass 项目停止${NC}"
echo -e "${RED}========================================${NC}"

# 停止后端
echo -e "\n${YELLOW}停止后端服务...${NC}"
if lsof -ti:3000 | xargs kill -9 2>/dev/null; then
    echo -e "${GREEN}✓ 后端已停止${NC}"
else
    echo -e "${YELLOW}→ 后端未运行${NC}"
fi

# 停止前端
echo -e "\n${YELLOW}停止前端服务...${NC}"
if lsof -ti:5173 | xargs kill -9 2>/dev/null; then
    echo -e "${GREEN}✓ 前端已停止${NC}"
else
    echo -e "${YELLOW}→ 前端未运行${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  停止完成${NC}"
echo -e "${GREEN}========================================${NC}"
