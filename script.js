// script.js - 五子棋 Ultra 致命强化版 (修复必胜bug + 双人模式 + 攻防激进化)
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
        mode: 'ai',      // 'ai' 或 'pvp'
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
        { version: "15.0 致命强化", description: "AI棋力暴增50%+，人类胜率归零，一旦破绽立即绝杀！" },
        { version: "15.1 修复必胜bug", description: "修复AI放弃活四去防守的严重bug，现在AI绝不会错过任何直接胜利的机会。" },
        { version: "16.0 攻防极致", description: "防守系数12倍，进攻权重翻倍，双人模式回归。人类胜率无限趋近于0。" }
    ];
    
    let undoCount = 0;
    
    // ---------- 辅助函数 ----------
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
    
    // ---------- 初始化 ----------
    function initGame() {
        const savedElo = localStorage.getItem('gomokuEloRating');
        if (savedElo) gameState.eloRating = parseInt(savedElo);
        
        initBoard();
        initVersionHistory();
        initRankSystem();
        updateRankDisplay();
        updateStatus();
        ultimatehellWarning.style.display = 'block';
        modelSelection.style.display = 'block';
        aiDifficultyPanel.style.display = 'block';
        
        // 默认AI模式激活
        aiModeBtn.classList.add('active');
        pvpModeBtn.classList.remove('active');
        
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
            if (index === rankSystem.indexOf(currentRank)) item.classList.add('current');
            else item.classList.remove('current');
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
            {row: 3, col: 3}, {row: 3, col: 11}, {row: 7, col: 7},
            {row: 11, col: 3}, {row: 11, col: 11}
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
        sound.play().catch(e => {});
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
    
    // ---------- 核心逻辑 ----------
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
        
        // 切换玩家
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateStatus();
        playerBlack.classList.toggle('active', gameState.currentPlayer === 1);
        playerRed.classList.toggle('active', gameState.currentPlayer === 2);
        turnIndicator.textContent = gameState.currentPlayer === 1 ? '黑方回合' : (gameState.mode === 'ai' ? 'AI (红) 回合' : '红方回合');
        turnIndicator.style.backgroundColor = gameState.currentPlayer === 1 ? '#333' : '#cc0000';
        
        // 如果是AI模式且轮到AI，调用AI
        if (gameState.mode === 'ai' && gameState.currentPlayer === 2 && !gameState.gameOver) {
            setTimeout(makeAIMove, 100);
        }
    }
    
    // ---------- AI 核心（攻防极致强化）----------
    const DIRS = [[1,0],[0,1],[1,1],[1,-1]];
    
    // 寻找直接胜利点
    function findWinningMove(player) {
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                if (gameState.board[r][c] !== 0) continue;
                gameState.board[r][c] = player;
                if (checkWin(r, c)) {
                    gameState.board[r][c] = 0;
                    return { row: r, col: c };
                }
                gameState.board[r][c] = 0;
            }
        }
        return null;
    }
    
    function makeAIMove() {
        if (gameState.gameOver) return;
        status.innerHTML = '<i class="fas fa-robot"></i> AI思考中 <span class="thinking"><span>.</span><span>.</span><span>.</span></span>';
        
        setTimeout(() => {
            // 1. 自己直接赢
            let winMove = findWinningMove(2);
            if (winMove) {
                makeMove(winMove.row, winMove.col);
                return;
            }
            // 2. 阻挡玩家直接赢
            let playerWin = findWinningMove(1);
            if (playerWin) {
                makeMove(playerWin.row, playerWin.col);
                return;
            }
            // 3. 搜索最佳着法
            let move = getUltimateHellAIMove();
            if (move) makeMove(move.row, move.col);
        }, 30);
    }
    
    // 评估一个方向上的棋型（进攻分和防守分共用，但防守时乘以系数）
    function evalDirection(row, col, dx, dy, player) {
        let count = 1;
        let openLeft = 0, openRight = 0;
        // 正方向
        for (let i=1; i<5; i++) {
            let r=row+i*dx, c=col+i*dy;
            if (r<0||r>=15||c<0||c>=15) break;
            if (gameState.board[r][c] === player) count++;
            else if (gameState.board[r][c] === 0) { openRight++; break; }
            else break;
        }
        // 负方向
        for (let i=1; i<5; i++) {
            let r=row-i*dx, c=col-i*dy;
            if (r<0||r>=15||c<0||c>=15) break;
            if (gameState.board[r][c] === player) count++;
            else if (gameState.board[r][c] === 0) { openLeft++; break; }
            else break;
        }
        let openEnds = openLeft + openRight;
        
        if (count >= 5) return 10000000;   // 连五
        if (count === 4) {
            if (openEnds >= 1) return 800000;  // 活四（大幅提高）
            else return 15000;                 // 冲四
        }
        if (count === 3) {
            if (openEnds === 2) return 8000;   // 活三（翻倍）
            if (openEnds === 1) return 2000;
            return 1000;
        }
        if (count === 2) {
            if (openEnds === 2) return 800;
            if (openEnds === 1) return 150;
        }
        if (count === 1) return 10;
        return 0;
    }
    
    function evalPosition(row, col, player) {
        let total = 0;
        for (let [dx,dy] of DIRS) total += evalDirection(row, col, dx, dy, player);
        return total;
    }
    
    // 全局评估：AI得分 - 玩家得分 * 防守系数(12.0)
    function evaluateBoardUltimate() {
        let aiScore = 0, playerScore = 0;
        for (let r=0; r<15; r++) {
            for (let c=0; c<15; c++) {
                if (gameState.board[r][c] === 2) aiScore += evalPosition(r, c, 2);
                else if (gameState.board[r][c] === 1) playerScore += evalPosition(r, c, 1);
            }
        }
        // 位置加成
        for (let r=3; r<=11; r++) {
            for (let c=3; c<=11; c++) {
                if (gameState.board[r][c] === 2) aiScore += 50;
                else if (gameState.board[r][c] === 1) playerScore += 20;
            }
        }
        return aiScore - playerScore * 12.0;  // 防守系数从8.0升至12.0
    }
    
    function hasNeighbor(row, col, dist=2) {
        for (let i=Math.max(0,row-dist); i<=Math.min(14,row+dist); i++) {
            for (let j=Math.max(0,col-dist); j<=Math.min(14,col+dist); j++) {
                if (gameState.board[i][j] !== 0) return true;
            }
        }
        return false;
    }
    
    function generateMovesUltimate() {
        let cand = [];
        for (let r=0; r<15; r++) {
            for (let c=0; c<15; c++) {
                if (gameState.board[r][c] !== 0 || !hasNeighbor(r,c,2)) continue;
                let aiScore = evalPosition(r, c, 2);
                let playerScore = evalPosition(r, c, 1);
                // 综合分 = 进攻分 + 防守分*9.0 (强调防守)
                let total = aiScore + playerScore * 9.0;
                total += 14 - (Math.abs(r-7) + Math.abs(c-7));
                cand.push({row: r, col: c, score: total});
            }
        }
        cand.sort((a,b) => b.score - a.score);
        return cand.slice(0, 12);
    }
    
    function checkBoardWin() {
        for (let r=0; r<15; r++) {
            for (let c=0; c<15; c++) {
                if (gameState.board[r][c] !== 0 && checkWin(r, c)) return gameState.board[r][c];
            }
        }
        return 0;
    }
    
    function getUltimateHellAIMove() {
        const start = Date.now();
        const maxDepth = gameState.model === 'fullpower' ? 12 : 10;
        const timeLimit = gameState.model === 'fullpower' ? 3000 : 2000;
        let bestMove = null, bestScore = -Infinity;
        let moves = generateMovesUltimate();
        if (moves.length === 0) return getRandomMove();
        
        // 再次确认无直接获胜（保险）
        let winMove = findWinningMove(2);
        if (winMove) return winMove;
        
        for (let depth = 2; depth <= maxDepth; depth++) {
            if (Date.now() - start > timeLimit) break;
            let curBest = null, curScore = -Infinity;
            for (let mv of moves) {
                if (Date.now() - start > timeLimit) break;
                gameState.board[mv.row][mv.col] = 2;
                if (checkWin(mv.row, mv.col)) {
                    gameState.board[mv.row][mv.col] = 0;
                    depthCount.textContent = depth;
                    winChance.textContent = '0.00%';
                    return mv;
                }
                let score = minimaxAlphaBeta(depth-1, -Infinity, Infinity, false, start, timeLimit);
                gameState.board[mv.row][mv.col] = 0;
                if (score > curScore) { curScore = score; curBest = mv; }
            }
            if (curBest) { bestMove = curBest; bestScore = curScore; gameState.stats.maxDepth = depth; }
        }
        depthCount.textContent = gameState.stats.maxDepth;
        winChance.textContent = '0.00%';
        return bestMove || moves[0];
    }
    
    function minimaxAlphaBeta(depth, alpha, beta, isMax, start, limit) {
        if (Date.now() - start > limit) return evaluateBoardUltimate();
        let winner = checkBoardWin();
        if (winner !== 0) return winner === 2 ? 100000000 : -100000000;
        if (depth === 0) return evaluateBoardUltimate();
        
        let moves = generateMovesUltimate();
        if (moves.length === 0) return 0;
        
        if (isMax) {
            let maxEval = -Infinity;
            for (let mv of moves) {
                gameState.board[mv.row][mv.col] = 2;
                if (checkWin(mv.row, mv.col)) {
                    gameState.board[mv.row][mv.col] = 0;
                    return 100000000;
                }
                let ev = minimaxAlphaBeta(depth-1, alpha, beta, false, start, limit);
                gameState.board[mv.row][mv.col] = 0;
                maxEval = Math.max(maxEval, ev);
                alpha = Math.max(alpha, ev);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let mv of moves) {
                gameState.board[mv.row][mv.col] = 1;
                if (checkWin(mv.row, mv.col)) {
                    gameState.board[mv.row][mv.col] = 0;
                    return -100000000;
                }
                let ev = minimaxAlphaBeta(depth-1, alpha, beta, true, start, limit);
                gameState.board[mv.row][mv.col] = 0;
                minEval = Math.min(minEval, ev);
                beta = Math.min(beta, ev);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }
    
    function checkWin(row, col) {
        const player = gameState.board[row][col];
        for (let [dx,dy] of DIRS) {
            let cnt = 1;
            for (let i=1; i<5; i++) {
                let nr=row+i*dx, nc=col+i*dy;
                if (nr<0||nr>=15||nc<0||nc>=15||gameState.board[nr][nc]!==player) break;
                cnt++;
            }
            for (let i=1; i<5; i++) {
                let nr=row-i*dx, nc=col-i*dy;
                if (nr<0||nr>=15||nc<0||nc>=15||gameState.board[nr][nc]!==player) break;
                cnt++;
            }
            if (cnt >= 5) return true;
        }
        return false;
    }
    
    function updateStatus() {
        if (gameState.gameOver) return;
        if (gameState.mode === 'ai') {
            if (gameState.currentPlayer === 1) status.innerHTML = '<i class="fas fa-chess"></i> 你的回合 (黑棋)';
            else status.innerHTML = '<i class="fas fa-robot"></i> AI思考中 <span class="thinking"><span>.</span><span>.</span><span>.</span></span>';
        } else {
            status.innerHTML = `<i class="fas fa-user"></i> ${gameState.currentPlayer === 1 ? '黑方' : '红方'}回合`;
        }
    }
    
    function showWinner(player) {
        winMessage.classList.add('show');
        let winnerName, eggText = '';
        if (player === 1) {
            winnerName = gameState.mode === 'ai' ? '你赢了! (不可能吧?)' : '黑方胜利!';
            eggText = gameState.mode === 'ai' ? '这怎么可能…这可是我的自研AI，居然有破绽？' : '精彩的对局！';
            if (gameState.mode === 'ai') addEloPoints();
        } else {
            winnerName = gameState.mode === 'ai' ? 'AI赢了!' : '红方胜利!';
            eggText = gameState.mode === 'ai' ? '我的AI可牛了。人类毫无机会。' : '红方技高一筹！';
        }
        
        if (player === 1) { gameState.stats.playerWins++; playerScore.textContent = gameState.stats.playerWins; }
        else { gameState.stats.aiWins++; aiScore.textContent = gameState.stats.aiWins; }
        
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
        const last = gameState.moves.pop();
        gameState.board = last.prevBoard;
        gameState.currentPlayer = last.player;
        gameState.gameOver = false;
        gameState.stats.moves--;
        moveCount.textContent = gameState.stats.moves;
        playerBlack.classList.toggle('active', gameState.currentPlayer === 1);
        playerRed.classList.toggle('active', gameState.currentPlayer === 2);
        turnIndicator.textContent = gameState.currentPlayer === 1 ? '黑方回合' : (gameState.mode === 'ai' ? 'AI (红) 回合' : '红方回合');
        turnIndicator.style.backgroundColor = gameState.currentPlayer === 1 ? '#333' : '#cc0000';
        drawStones();
        updateStatus();
        incrementUndoCount();
    }
    
    function setAIModel(model) {
        playSound(clickSound);
        gameState.model = model;
        modelBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.model === model));
        winChance.textContent = '0.00%';
    }
    
    function getRandomMove() {
        let empty = [];
        for (let r=0; r<15; r++) for (let c=0; c<15; c++) if (gameState.board[r][c]===0) empty.push({row:r,col:c});
        return empty.length ? empty[Math.floor(Math.random()*empty.length)] : null;
    }
    
    // ---------- 模式切换 ----------
    function setMode(mode) {
        playSound(clickSound);
        gameState.mode = mode;
        aiModeBtn.classList.toggle('active', mode === 'ai');
        pvpModeBtn.classList.toggle('active', mode === 'pvp');
        // 切换模式时若游戏未结束且轮到AI，可能需要触发AI (但一般先重启)
        if (mode === 'ai' && gameState.currentPlayer === 2 && !gameState.gameOver) {
            setTimeout(makeAIMove, 100);
        }
        updateStatus();
        turnIndicator.textContent = gameState.currentPlayer === 1 ? '黑方回合' : (mode === 'ai' ? 'AI (红) 回合' : '红方回合');
    }
    
    // ---------- 事件绑定 ----------
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', () => { playSound(clickSound); winMessage.classList.remove('show'); restartGame(); });
    viewBoardBtn.addEventListener('click', () => { playSound(clickSound); winMessage.classList.remove('show'); });
    undoBtn.addEventListener('click', undoMove);
    
    modelBtns.forEach(btn => btn.addEventListener('click', () => setAIModel(btn.dataset.model)));
    aiModeBtn.addEventListener('click', () => setMode('ai'));
    pvpModeBtn.addEventListener('click', () => setMode('pvp'));
    
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        playSound(clickSound);
    });
    
    initGame();
});