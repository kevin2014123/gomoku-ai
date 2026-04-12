// script.js
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
        { version: "14.0 Ultra", description: "全面升级，修复了无数个bug，提升了所有难度的 AI，所以我将它命名为 Ultra" }
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
            setTimeout(makeAIMove, 300);
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
        }, 100);
    }
    
    function getUltimateHellAIMove() {
        const startTime = Date.now();
        const maxDepth = gameState.model === 'fullpower' ? 14 : 12;
        const timeLimit = gameState.model === 'fullpower' ? 8000 : 5000;
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        const moves = generateMovesUltimate();
        if (moves.length === 0) {
            return getRandomMove();
        }
        
        let depth = 2;
        while (depth <= maxDepth && Date.now() - startTime < timeLimit) {
            let currentBestMove = null;
            let currentBestScore = -Infinity;
            
            for (const move of moves) {
                if (Date.now() - startTime > timeLimit) break;
                
                const { row, col } = move;
                gameState.board[row][col] = 2;
                const score = minimaxAlphaBeta(depth - 1, -Infinity, Infinity, false, startTime, timeLimit);
                gameState.board[row][col] = 0;
                
                if (score > currentBestScore) {
                    currentBestScore = score;
                    currentBestMove = move;
                }
            }
            
            if (currentBestMove && currentBestScore > bestScore) {
                bestMove = currentBestMove;
                bestScore = currentBestScore;
            }
            
            gameState.stats.maxDepth = depth;
            depth++;
        }
        
        depthCount.textContent = gameState.stats.maxDepth;
        
        const chance = gameState.model === 'fullpower' ? 
            Math.max(0.01, Math.min(0.1, bestScore / 10000)) : 
            Math.max(0.1, Math.min(0.3, bestScore / 5000));
        winChance.textContent = `${(chance * 100).toFixed(2)}%`;
        
        return bestMove || moves[0];
    }
    
    function checkBoardWin() {
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (gameState.board[row][col] !== 0 && checkWin(row, col)) {
                    return gameState.board[row][col];
                }
            }
        }
        return 0;
    }
    
    function generateMovesUltimate() {
        const moves = [];
        
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (gameState.board[row][col] === 0 && hasNeighbor(row, col, 3)) {
                    const centerValue = 14 - (Math.abs(row - 7) + Math.abs(col - 7));
                    const playerThreat = countThreatsUltimate(row, col, 1);
                    const aiThreat = countThreatsUltimate(row, col, 2);
                    
                    moves.push({
                        row, 
                        col, 
                        score: centerValue + aiThreat * 450 + playerThreat * 1050
                    });
                }
            }
        }
        
        moves.sort((a, b) => b.score - a.score);
        
        return moves.slice(0, 6);
    }
    
    function hasNeighbor(row, col, distance = 2) {
        for (let i = Math.max(0, row - distance); i <= Math.min(14, row + distance); i++) {
            for (let j = Math.max(0, col - distance); j <= Math.min(14, col + distance); j++) {
                if ((i !== row || j !== col) && gameState.board[i][j] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    function countThreatsUltimate(row, col, player) {
        let threatScore = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        
        for (const [dx, dy] of directions) {
            threatScore += evaluateDirectionUltimate(row, col, dx, dy, player);
        }
        
        return threatScore;
    }
    
    function evaluateDirectionUltimate(row, col, dx, dy, player) {
        let score = 0;
        let count = 0;
        let openEnds = 0;
        
        for (let i = 1; i <= 6; i++) {
            const r = row + i * dx;
            const c = col + i * dy;
            
            if (r < 0 || r >= 15 || c < 0 || c >= 15) break;
            
            if (gameState.board[r][c] === player) {
                count++;
            } else if (gameState.board[r][c] === 0) {
                openEnds++;
                break;
            } else {
                break;
            }
        }
        
        for (let i = 1; i <= 6; i++) {
            const r = row - i * dx;
            const c = col - i * dy;
            
            if (r < 0 || r >= 15 || c < 0 || c >= 15) break;
            
            if (gameState.board[r][c] === player) {
                count++;
            } else if (gameState.board[r][c] === 0) {
                openEnds++;
                break;
            } else {
                break;
            }
        }
        
        if (count >= 4) {
            score += 6000;
        } else if (count === 3) {
            if (openEnds === 2) score += 3000;
            else if (openEnds === 1) score += 1200;
        } else if (count === 2) {
            if (openEnds === 2) score += 750;
            else if (openEnds === 1) score += 225;
        } else if (count === 1) {
            score += 45;
        }
        
        if (count === 4 && openEnds > 0) {
            score += 7500;
        }
        
        return score;
    }
    
    function evaluateBoardUltimate() {
        let aiScore = 0;
        let playerScore = 0;
        
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (gameState.board[row][col] === 2) {
                    aiScore += evaluatePositionUltimate(row, col, 2);
                } else if (gameState.board[row][col] === 1) {
                    playerScore += evaluatePositionUltimate(row, col, 1);
                }
            }
        }
        
        for (let row = 3; row <= 11; row++) {
            for (let col = 3; col <= 11; col++) {
                if (gameState.board[row][col] === 2) {
                    aiScore += 60;
                } else if (gameState.board[row][col] === 1) {
                    playerScore += 30;
                }
            }
        }
        
        return aiScore - playerScore * 5.25;
    }
    
    function evaluatePositionUltimate(row, col, player) {
        let score = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        
        for (const [dx, dy] of directions) {
            score += evaluateDirectionUltimate(row, col, dx, dy, player);
        }
        
        return score;
    }
    
    function minimaxAlphaBeta(depth, alpha, beta, isMaximizing, startTime, timeLimit) {
        if (Date.now() - startTime > timeLimit) {
            return isMaximizing ? -Infinity : Infinity;
        }
        
        const winner = checkBoardWin();
        if (winner !== 0 || depth === 0) {
            return evaluateBoardUltimate();
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            const moves = generateMovesUltimate();
            
            for (const move of moves) {
                gameState.board[move.row][move.col] = 2;
                const eval = minimaxAlphaBeta(depth - 1, alpha, beta, false, startTime, timeLimit);
                gameState.board[move.row][move.col] = 0;
                
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            const moves = generateMovesUltimate();
            
            for (const move of moves) {
                gameState.board[move.row][move.col] = 1;
                const eval = minimaxAlphaBeta(depth - 1, alpha, beta, true, startTime, timeLimit);
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
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            for (let i = 1; i <= 4; i++) {
                const newRow = row + i * dx;
                const newCol = col + i * dy;
                if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
                    gameState.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            for (let i = 1; i <= 4; i++) {
                const newRow = row - i * dx;
                const newCol = col - i * dy;
                if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
                    gameState.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                return true;
            }
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
        
        let winnerName;
        let eggText = "";
        
        if (player === 1) {
            winnerName = "你赢了!";
            eggText = "这怎么可能，这可是我的自研AI";
            addEloPoints();
        } else {
            winnerName = "AI赢了!";
            eggText = "我就知道，这可是我的自研AI";
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
        
        const chance = model === 'fullpower' ? 0.01 : 0.1;
        winChance.textContent = `${chance.toFixed(2)}%`;
    }
    
    function getRandomMove() {
        const emptyCells = [];
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (gameState.board[row][col] === 0) {
                    emptyCells.push({row, col});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        return null;
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
        soundToggle.innerHTML = soundEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute"></i>';
        playSound(clickSound);
    });
    
    initGame();
});