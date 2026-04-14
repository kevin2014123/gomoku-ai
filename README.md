[![更新日志](https://img.shields.io/badge/📝-更新日志-blue)](./CHANGELOG.md)
# 🌟 如果这个项目对你有帮助，请点个 ⭐ Star 支持一下！  
# 🌟 If this project helps you, please give it a ⭐ Star!  

## 你的每一个 Star，都是对我最大的鼓励 💪  
## Every Star means a lot to me 💪
# 万层地狱五子棋AI / Myriad Hell Gomoku AI

一个具有多级难度的人工智能五子棋游戏，采用完整的Minimax算法配合Alpha-Beta剪枝优化，支持最高14层深度搜索。

An AI Gomoku game with multiple difficulty levels, using complete Minimax algorithm with Alpha-Beta pruning optimization, supporting up to 14-layer depth search.

在线试玩 / Online Demo: https://kevin2014123.github.io/gomoku-ai/

## 功能特性 / Features

游戏模式 / Game Modes:
- AI对战 / AI Battle
- 双人对战 / PvP Mode

AI难度等级 / AI Difficulty Levels:
- 简单 / Easy: 启发式 / Heuristic, 玩家胜率约40% / Player win rate ~40%
- 中等 / Medium: 3层搜索 / 3-layer search, 玩家胜率约20% / Player win rate ~20%
- 困难 / Hard: 5层搜索 / 5-layer search, 玩家胜率约5% / Player win rate ~5%
- 万层地狱 / Myriad Hell: 12-14层搜索 / 12-14 layer search, 玩家胜率低于0.1% / Player win rate <0.1%

万层地狱模式 / Myriad Hell Mode:
- 正常版 / Normal: 12层搜索 / 12-layer search, 5秒时间限制 / 5s time limit
- 满血版 / Full Power: 14层搜索 / 14-layer search, 8秒时间限制 / 8s time limit

段位系统 / Rank System: 8个段位 / 8 ranks, 积分永久保存 / Permanent score storage

## 技术实现 / Technical Implementation

核心算法 / Core Algorithm: Minimax + Alpha-Beta剪枝 / Alpha-Beta Pruning + 迭代加深 / Iterative Deepening

评估函数 / Evaluation Function: 棋型识别 / Pattern recognition, 位置权重 / Position weight, 威胁评估 / Threat assessment

优化 / Optimization: 移动排序 / Move ordering, 只评估有相邻棋子的位置 / Only evaluate positions with adjacent stones


## 本地运行 / Local Run

用浏览器打开index.html即可 / Open index.html in browser

## 版本历史 / Version History

v1.0 基础功能 / Basic features
v5.0 增加地狱模式 / Added Hell Mode
v8.0 添加满血版模型 / Added Full Power model
v10.0 完整Minimax算法 / Complete Minimax algorithm
v11.0 段位系统 / Rank system
v12.5 预判对手功能 / Opponent prediction
v13.0 修复AI功能缺失问题 / Fixed AI function missing issues

## 测试数据 / Test Data

总对局数 / Total games: 10000+
万层地狱模式人类胜率 / Myriad Hell human win rate: 低于0.1% / <0.1%

## 作者 / Author

谢子涵（Kevin）

## 许可证 / License

GNU General Public License v3.0 (GPL-3.0)

Copyright (C) 2026 谢子涵 / Xie Zihan

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
[![更新日志](https://img.shields.io/badge/📝-更新日志-blue)](./CHANGELOG.md)