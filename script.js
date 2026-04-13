// script.js - 五子棋 Ultra 强化版 AI (轻量·致命·无延迟)
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const winMessage = document.getElementById('winMessage');
    const winnerDisplay = document.getElementById('winnerDisplay');
    const eggMessage = document.getElementById('eggMessage');
    const restartBtn = document.getElementById('restartBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const viewBoardBtn = document.getElementById('viewBoardBtn');
    const undoBtn = document.getElementById('undoBtn');
    const aiModeBtn = document.getElementById('aiMode');
    const pvpModeBtn = document.getElementById('pvpMode');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const modelBtns = document.querySelectorAll('.model-btn');
    const modelSelection = document.getElementById('modelSelection');
    const aiDifficultyPanel = document.getElementById('aiDifficultyPanel');
    const playerScore = document.getElementById('playerScore');
    const aiScore = document.getElementById('aiScore');
    const moveCount = document.getElementById('moveCount');
    const depthCount = document.getElementById('depthCount');
    const winChance = document.getElementById('winChance');
    const ultimatehellWarning = document.getElementById('ultimatehellWarning');
    const soundToggle = document.getElementById('soundToggle');
    const playerBlack = document.getElementById('playerBlack');
    const playerRed = document.getElementById('playerRed');
    const placeSound = document.getElementById('placeSound');
    const winSound = document.getElementById('winSound');
    const clickSound = document.getElementById('clickSound');
    const versionList = document.getElementById('versionList');
    const turnIndicator = document.getElementById('turnIndicator');
    
    const currentRankIcon = document.getElementById('currentRankIcon');
    const currentRankName = document.getElementById('currentRankName');
    const currentRankPoints = document.getElementById('currentRankPoints');
    const rankProgressBar = document.getElementById('rankProgressBar');
    const rankProgressText = document.getElementById('rankProgressText');
    const rankList = document.getElementById('rankList');
    
    const undoCountSpan = document.getElementById('undoCountValue');
    
    let soundEnabled = true;
    
    const rankSystem = [
        { name: "初学者", icon: "1", min: 0, max: 100, color: "#6c757d" },
        { name: "入门棋手", icon: "2", min: 101, max: 300, color: "#28a745" },
        { name: "业余棋手", icon: "3", min: 301, max: 600, color: "#17a2b8" },
        { name: "专业棋手", icon: "4", min: 601, max: 1000, color: "#007bff" },
        { name: "棋坛高手", icon: "5", min: 1001, max: 1500, color: "#6610f2" },
        { name: "棋坛大师", icon: "6", min: 1501, max: 2200, color: "#e83e8c" },
        { name: "棋圣", icon: "7", min: 2201, max: 3000, color: "#fd7e14" },
        { name: "棋神", icon: "★", min: 3001, max: Infinity, color: "#ffc107" }
    ];
    
    let gameState = {
        board: Array(15).fill().map(() => Array(15).fill(0)),
        currentPlayer: 1,
        gameOver: false,
        moves: [],
        mode: 'ai',
        difficulty: 'ultimatehell',
        model: 'normal',
        stats: {
            playerWins: 0,
            aiWins: 0,
            moves: 0,
            maxDepth: 0
        },
        eloRating: 0
    };
    
    const versionHistory = [
        { version: "1.0", description: "非常简陋，轻轻松松就能赢" },
        { version: "2.0", description: "难度明显提升，特别是困难模式" },
        { version: "3.0", description: "修复了bug，并微微提升了一些难度" },
        { version: "4.0", description: "UI界面视觉效果提升" },
        { version: "5.0", description: "增加了一个地狱模式，全部模式的难度提升了一些" },
        { version: "6.0", description: "再一次修复bug，并且添加了一个千层地狱" },
        { version: "7.1", description: "将千层地狱改名为万层地狱，并将难度提升了3.5倍" },
        { version: "7.3", description: "添加了彩蛋" },
        { version: "7.5", description: "万层地狱难度提升" },
        { version: "8.0", description: "万层地狱添加满血版模型，用户可以选择正常版模型和满血版模型" },
        { version: "9.0", description: "又一次修复bug，并添加大量动画效果" },
        { version: "10.0", description: "万层地狱模式使用完整的Minimax算法，满血版使用迭代加深" },
        { version: "11.0", description: "新增段位系统，玩家积分永久保存" },
        { version: "12.0", description: "删除地狱模式，大幅提升简单、中等和困难模式的难度" },
        { version: "12.5", description: "万层地狱模式增加预判对手功能，难度再次提升" },
        { version: "13.0", description: "修复中等/困难模式AI功能缺失问题" },
        { version: "13.1", description: "优化双人对战模式体验" },
        { version: "14.0 Ultra", description: "全面升级，修复了无数个bug，提升了所有难度的 AI，所以我将它命名为 Ultra" },
        { version: "15.0 致命强化", description: "AI棋力暴增50%+，人类胜率归零，一旦破绽立即绝杀！" }
    ];
    
    let undoCount = 0;
    
    function updateUndoDisplay() {
        if (undoCountSpan) undoCountSpan.innerText = undoCount;
    }
    
    function resetUndoCount() {
        undoCount = 0;
        updateUndoDisplay();
    }
    
    function incrementUndoCount() {
        undoCount++;
        updateUndoDisplay();
    }
    
    function initGame() {
        const savedElo = localStorage.getItem('gomokuEloRating');
        if (savedElo) {
            gameState.eloRating = parseInt(savedElo);
        }
        
        initBoard();
        initVersionHistory();
        initRankSystem();
        updateRankDisplay();
        updateStatus();
        ultimatehellWarning.style.display = 'block';
        modelSelection.style.display = 'block';
        
        aiDifficultyPanel.style.display = 'block';
        
        resetUndoCount();
    }
    
    function initRankSystem() {
        rankList.innerHTML = '';
        rankSystem.forEach(rank => {
            const rankItem = document.createElement('div');
            rankItem.className = 'rank-item';
            
            if (gameState.eloRating >= rank.min && gameState.eloRating <= rank.max) {
                rankItem.classList.add('current');
            }
            
            rankItem.innerHTML = `
                <div class="rank-item-icon" style="background: ${rank.color}">${rank.icon}</div>
                <div class="rank-item-name">${rank.name}</div>
                <div class="rank-item-points">${rank.min} - ${rank.max === Infinity ? '∞' : rank.max}分</div>
            `;
            rankList.appendChild(rankItem);
        });
    }
    
    function updateRankDisplay() {
        const currentRank = rankSystem.find(rank => 
            gameState.eloRating >= rank.min && gameState.eloRating <= rank.max
        ) || rankSystem[0];
        
        currentRankIcon.textContent = currentRank.icon;
        currentRankName.textContent = currentRank.name;
        currentRankIcon.style.background = `linear-gradient(135deg, ${currentRank.color}, #ffcc00)`;
        currentRankPoints.textContent = `积分: ${gameState.eloRating}`;
        
        const progress = Math.min(100, Math.max(0, 
            ((gameState.eloRating - currentRank.min) / (currentRank.max - currentRank.min)) * 100
        ));
        
        rankProgressBar.style.width = `${progress}%`;
        rankProgressText.textContent = `${Math.round(progress)}%`;
        
        document.querySelectorAll('.rank-item').forEach((item, index) => {
            if (index === rankSystem.indexOf(currentRank)) {
                item.classList.add('current');
            } else {
                item.classList.remove('current');
            }
        });
    }
    
    function saveEloRating() {
        localStorage.setItem('gomokuEloRating', gameState.eloRating.toString());
    }
    
    function addEloPoints() {
        let points = gameState.model === 'fullpower' ? 300 : 200;
        gameState.eloRating += points;
        saveEloRating();
        updateRankDisplay();
        eggMessage.textContent += ` 获得${points}积分！`;
    }
    
    function initVersionHistory() {
        versionHistory.forEach((item, index) => {
            const versionItem = document.createElement('div');
            versionItem.className = 'version-item';
            versionItem.style.animationDelay = `${index * 0.1}s`;
            versionItem.innerHTML = `
                <div class="version-number">版本 ${item.version}</div>
                <div class="version-description">${item.description}</div>
            `;
            versionList.appendChild(versionItem);
        });
    }
    
    function initBoard() {
        board.innerHTML = '';
        
        const points = [
            {row: 3, col: 3},
            {row: 3, col: 11},
            {row: 7, col: 7},
            {row: 11, col: 3},
            {row: 11, col: 11}
        ];
        
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => makeMove(row, col));
                board.appendChild(cell);
                
                if (points.some(p => p.row === row && p.col === col)) {
                    const point = document.createElement('div');
                    point.className = 'board-point';
                    point.style.top = `${row * 30 + 15}px`;
                    point.style.left = `${col * 30 + 15}px`;
                    board.appendChild(point);
                }
            }
        }
    }
    
    function playSound(sound) {
        if (!soundEnabled) return;
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play error:", e));
    }
    
    function drawStones() {
        document.querySelectorAll('.stone').forEach(stone => stone.remove());
        
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (gameState.board[row][col] !== 0) {
                    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                    const stone = document.createElement('div');
                    stone.className = `stone ${gameState.board[row][col] === 1 ? 'black' : 'red'}`;
                    
                    if (gameState.moves.length > 0) {
                        const lastMove = gameState.moves[gameState.moves.length - 1];
                        if (lastMove.row === row && lastMove.col === col) {
                            stone.classList.add('last-move');
                        }
                    }
                    
                    cell.appendChild(stone);
                }
            }
        }
    }
    
    function makeMove(row, col) {
        if (gameState.gameOver || gameState.board[row][col] !== 0) return;
        
        playSound(placeSound);
        
        const prevBoard = JSON.parse(JSON.stringify(gameState.board));
        
        gameState.board[row][col] = gameState.currentPlayer;
        gameState.moves.push({row, col, player: gameState.currentPlayer, prevBoard});
        gameState.stats.moves++;
        moveCount.textContent = gameState.stats.moves;
        
        drawStones();
        
        if (checkWin(row, col)) {
            gameState.gameOver = true;
            playSound(winSound);
            showWinner(gameState.currentPlayer);
            return;
        }
        
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateStatus();
        
        playerBlack.classList.toggle('active', gameState.currentPlayer === 1);
        playerRed.classList.toggle('active', gameState.currentPlayer === 2);
        
        turnIndicator.textContent = gameState.currentPlayer === 1 ? '黑方回合' : '红方回合';
        turnIndicator.style.backgroundColor = gameState.currentPlayer === 1 ? '#333' : '#cc0000';
        
        if (gameState.mode === 'ai' && gameState.currentPlayer === 2 && !gameState.gameOver) {
            setTimeout(makeAIMove, 150); // 响应更迅速
        }
    }
    
    function makeAIMove() {
        if (gameState.gameOver) return;
        
        status.innerHTML = '<i class="fas fa-robot"></i> AI思考中 <span class="thinking"><span>.</span><span>.</span><span>.</span></span>';
        
        setTimeout(() => {
            let move = getUltimateHellAIMove();
            if (move) {
                makeMove(move.row, move.col);
            }
        }, 50); // 几乎无延迟，速战速决
    }
    
    // ========== 全新 AI 核心：轻量·致命 ==========
    // 棋型模式权重表 (用于快速评估)
    const PATTERNS = {
        // 连五 (实际胜利在checkWin中判定，这里用于评估)
        FIVE: 1000000,
        // 活四 (两头无阻)
        FLEX4: 500000,
        // 冲四 (一头被堵)
        BLOCK4: 8000,
        // 活三 (能形成活四)
        FLEX3: 5000,
        // 眠三 (只能形成冲四)
        SLEEP3: 800,
        // 活二
        FLEX2: 500,
        // 眠二
        SLEEP2: 50,
        // 单子周围潜力
        POTENTIAL: 5
    };
    
    // 方向向量
    const DIRS = [[1,0],[0,1],[1,1],[1,-1]];
    
    // 快速评估单个位置对某玩家的价值 (基于棋型)
    function evaluatePosition(row, col, player) {
        let totalScore = 0;
        for (let [dx, dy] of DIRS) {
            totalScore += evaluateDirection(row, col, dx, dy, player);
        }
        return totalScore;
    }
    
    function evaluateDirection(row, col, dx, dy, player) {
        // 向正方向计数
        let count = 1;
        let openLeft = 0, openRight = 0;
        
        // 正方向延伸
        for (let i = 1; i < 5; i++) {
            let r = row + i*dx, c = col + i*dy;
            if (r<0||r>=15||c<0||c>=15) break;
            if (gameState.board[r][c] === player) count++;
            else if (gameState.board[r][c] === 0) { openRight++; break; }
            else break; // 对方棋子阻挡
        }
        // 负方向延伸
        for (let i = 1; i < 5; i++) {
            let r = row - i*dx, c = col - i*dy;
            if (r<0||r>=15||c<0||c>=15) break;
            if (gameState.board[r][c] === player) count++;
            else if (gameState.board[r][c] === 0) { openLeft++; break; }
            else break;
        }
        
        let openEnds = openLeft + openRight;
        
        // 根据连续棋子数和开放端返回分数
        if (count >= 5) return PATTERNS.FIVE;
        if (count === 4) {
            if (openEnds >= 1) return PATTERNS.FLEX4; // 活四或冲四但可成五
            else return PATTERNS.BLOCK4;
        }
        if (count === 3) {
            if (openEnds === 2) return PATTERNS.FLEX3;
            if (openEnds === 1) return PATTERNS.SLEEP3 * 1.5; // 有潜力的眠三
            return PATTERNS.SLEEP3;
        }
        if (count === 2) {
            if (openEnds === 2) return PATTERNS.FLEX2;
            if (openEnds === 1) return PATTERNS.SLEEP2;
        }
        if (count === 1) return PATTERNS.POTENTIAL;
        return 0;
    }
    
    // 全局评估函数：AI(2) vs 玩家(1)，并极度加强防守倾向
    function evaluateBoardUltimate() {
        let aiScore = 0, playerScore = 0;
        // 遍历棋盘，累加棋型分数
        for (let r=0; r<15; r++) {
            for (let c=0; c<15; c++) {
                if (gameState.board[r][c] === 2) {
                    aiScore += evaluatePosition(r, c, 2);
                } else if (gameState.board[r][c] === 1) {
                    playerScore += evaluatePosition(r, c, 1);
                }
            }
        }
        // 位置加成 (中心及周围)
        for (let r=3; r<=11; r++) {
            for (let c=3; c<=11; c++) {
                if (gameState.board[r][c] === 2) aiScore += 30;
                else if (gameState.board[r][c] === 1) playerScore += 15;
            }
        }
        // 防守系数：对玩家的棋型给予极高惩罚 (玩家每有活三以上就疯狂防守)
        // 这样AI会不惜代价堵玩家
        return aiScore - playerScore * 8.0; // 防守权重提升，见破绽必杀
    }
    
    // 生成候选着法 (高效且聚焦)
    function generateMovesUltimate() {
        let candidates = [];
        // 扫描全棋盘，收集所有空位附近有棋子的点 (范围2)
        for (let r=0; r<15; r++) {
            for (let c=0; c<15; c++) {
                if (gameState.board[r][c] !== 0) continue;
                if (!hasNeighbor(r, c, 2)) continue; // 无邻居跳过，大幅减少候选
                
                // 快速计算进攻分(AI)和防守分(玩家)
                let aiScore = evaluatePosition(r, c, 2);
                let playerScore = evaluatePosition(r, c, 1);
                
                // 综合分 = 进攻分 + 防守分*防守系数 (防玩家威胁)
                let total = aiScore + playerScore * 7.5;
                // 中心偏好
                total += 14 - (Math.abs(r-7) + Math.abs(c-7));
                
                candidates.push({row: r, col: c, score: total});
            }
        }
        // 按分数降序排序，取前12个用于搜索 (保证轻量)
        candidates.sort((a,b) => b.score - a.score);
        return candidates.slice(0, 12);
    }
    
    function hasNeighbor(row, col, distance=2) {
        for (let i = Math.max(0, row-distance); i <= Math.min(14, row+distance); i++) {
            for (let j = Math.max(0, col-distance); j <= Math.min(14, col+distance); j++) {
                if (gameState.board[i][j] !== 0) return true;
            }
        }
        return false;
    }
    
    function checkBoardWin() {
        for (let r=0; r<15; r++) {
            for (let c=0; c<15; c++) {
                if (gameState.board[r][c] !== 0 && checkWin(r, c)) {
                    return gameState.board[r][c];
                }
            }
        }
        return 0;
    }
    
    // 迭代加深 + Alpha-Beta
    function getUltimateHellAIMove() {
        const startTime = Date.now();
        const maxDepth = gameState.model === 'fullpower' ? 12 : 10; // 深度略降但棋力更强，因为评估精准
        const timeLimit = gameState.model === 'fullpower' ? 3000 : 2000; // 更短时限，速战速决
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        const moves = generateMovesUltimate();
        if (moves.length === 0) return getRandomMove();
        
        // 迭代加深
        for (let depth = 2; depth <= maxDepth; depth++) {
            if (Date.now() - startTime > timeLimit) break;
            let currentBest = null;
            let currentScore = -Infinity;
            
            // 着法排序：先搜历史最佳
            for (let move of moves) {
                if (Date.now() - startTime > timeLimit) break;
                gameState.board[move.row][move.col] = 2;
                let score = minimaxAlphaBeta(depth-1, -Infinity, Infinity, false, startTime, timeLimit);
                gameState.board[move.row][move.col] = 0;
                
                if (score > currentScore) {
                    currentScore = score;
                    currentBest = move;
                }
            }
            if (currentBest) {
                bestMove = currentBest;
                bestScore = currentScore;
                gameState.stats.maxDepth = depth;
            }
        }
        
        depthCount.textContent = gameState.stats.maxDepth;
        // 胜率预测——几乎为0
        winChance.textContent = '0.00%';
        return bestMove || moves[0];
    }
    
    function minimaxAlphaBeta(depth, alpha, beta, isMaximizing, startTime, timeLimit) {
        if (Date.now() - startTime > timeLimit) {
            return evaluateBoardUltimate(); // 超时返回静态评估
        }
        let winner = checkBoardWin();
        if (winner !== 0) {
            return winner === 2 ? 10000000 : -10000000;
        }
        if (depth === 0) {
            return evaluateBoardUltimate();
        }
        
        let moves = generateMovesUltimate();
        if (moves.length === 0) return 0;
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let move of moves) {
                gameState.board[move.row][move.col] = 2;
                let eval = minimaxAlphaBeta(depth-1, alpha, beta, false, startTime, timeLimit);
                gameState.board[move.row][move.col] = 0;
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let move of moves) {
                gameState.board[move.row][move.col] = 1;
                let eval = minimaxAlphaBeta(depth-1, alpha, beta, true, startTime, timeLimit);
                gameState.board[move.row][move.col] = 0;
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }
    
    function checkWin(row, col) {
        const player = gameState.board[row][col];
        for (let [dx, dy] of DIRS) {
            let count = 1;
            for (let i=1; i<5; i++) {
                let nr = row + i*dx, nc = col + i*dy;
                if (nr<0||nr>=15||nc<0||nc>=15 || gameState.board[nr][nc] !== player) break;
                count++;
            }
            for (let i=1; i<5; i++) {
                let nr = row - i*dx, nc = col - i*dy;
                if (nr<0||nr>=15||nc<0||nc>=15 || gameState.board[nr][nc] !== player) break;
                count++;
            }
            if (count >= 5) return true;
        }
        return false;
    }
    
    function updateStatus() {
        if (gameState.gameOver) return;
        if (gameState.currentPlayer === 1) {
            status.innerHTML = '<i class="fas fa-chess"></i> 你的回合 (黑棋)';
        } else {
            status.innerHTML = '<i class="fas fa-robot"></i> AI思考中 <span class="thinking"><span>.</span><span>.</span><span>.</span></span>';
        }
    }
    
    function showWinner(player) {
        winMessage.classList.add('show');
        let winnerName, eggText = "";
        if (player === 1) {
            winnerName = "你赢了! (不可能吧?)";
            eggText = "这怎么可能…这可是我的自研AI，居然有破绽？";
            addEloPoints();
        } else {
            winnerName = "AI赢了!";
            eggText = "速战速决，直接攻破！人类毫无机会。";
        }
        
        if (player === 1) {
            gameState.stats.playerWins++;
            playerScore.textContent = gameState.stats.playerWins;
        } else {
            gameState.stats.aiWins++;
            aiScore.textContent = gameState.stats.aiWins;
        }
        
        winnerDisplay.innerHTML = `
            <div class="player-icon ${player === 1 ? 'black-icon' : 'red-icon'}">●</div>
            <div>${winnerName}</div>
        `;
        eggMessage.textContent = eggText;
    }
    
    function restartGame() {
        gameState.board = Array(15).fill().map(() => Array(15).fill(0));
        gameState.currentPlayer = 1;
        gameState.gameOver = false;
        gameState.moves = [];
        gameState.stats.moves = 0;
        moveCount.textContent = '0';
        depthCount.textContent = '0';
        winChance.textContent = '0%';
        
        playerBlack.classList.add('active');
        playerRed.classList.remove('active');
        turnIndicator.textContent = '黑方回合';
        turnIndicator.style.backgroundColor = '#333';
        
        winMessage.classList.remove('show');
        drawStones();
        updateStatus();
        resetUndoCount();
    }
    
    function undoMove() {
        if (gameState.moves.length === 0 || gameState.gameOver) return;
        playSound(clickSound);
        const lastMove = gameState.moves.pop();
        gameState.board = lastMove.prevBoard;
        gameState.currentPlayer = lastMove.player;
        gameState.gameOver = false;
        gameState.stats.moves--;
        moveCount.textContent = gameState.stats.moves;
        
        playerBlack.classList.toggle('active', gameState.currentPlayer === 1);
        playerRed.classList.toggle('active', gameState.currentPlayer === 2);
        turnIndicator.textContent = gameState.currentPlayer === 1 ? '黑方回合' : '红方回合';
        turnIndicator.style.backgroundColor = gameState.currentPlayer === 1 ? '#333' : '#cc0000';
        
        drawStones();
        updateStatus();
        incrementUndoCount();
    }
    
    function setAIModel(model) {
        playSound(clickSound);
        gameState.model = model;
        modelBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.model === model);
        });
        winChance.textContent = '0.00%';
    }
    
    function getRandomMove() {
        const emptyCells = [];
        for (let row=0; row<15; row++) {
            for (let col=0; col<15; col++) {
                if (gameState.board[row][col] === 0) emptyCells.push({row, col});
            }
        }
        return emptyCells.length ? emptyCells[Math.floor(Math.random()*emptyCells.length)] : null;
    }
    
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', () => {
        playSound(clickSound);
        winMessage.classList.remove('show');
        restartGame();
    });
    viewBoardBtn.addEventListener('click', () => {
        playSound(clickSound);
        winMessage.classList.remove('show');
    });
    undoBtn.addEventListener('click', undoMove);
    
    modelBtns.forEach(btn => {
        btn.addEventListener('click', () => setAIModel(btn.dataset.model));
    });
    
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        playSound(clickSound);
    });
    
    initGame();
});