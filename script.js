// =====================================================
// 五子棋 Ultra V18.2.1 · 强制落子兜底修复版
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    // ---------- DOM 元素 ----------
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
    const modelBtns = document.querySelectorAll('.model-btn');
    const aiDifficultyPanel = document.getElementById('aiDifficultyPanel');
    const playerScore = document.getElementById('playerScore');
    const aiScore = document.getElementById('aiScore');
    const moveCount = document.getElementById('moveCount');
    const depthCount = document.getElementById('depthCount');
    const winChance = document.getElementById('winChance');
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
    const gameStatusDisplay = document.getElementById('gameStatusDisplay');
    const gameStatusText = document.getElementById('gameStatusText');

    const supportBtn = document.getElementById('supportBtn');
    const agreementOverlay = document.getElementById('agreementOverlay');
    const agreementAgree = document.getElementById('agreementAgree');
    const agreementDisagree = document.getElementById('agreementDisagree');

    // ---------- 全局状态 ----------
    const BOARD_SIZE = 15;
    const EMPTY = 0;
    const PLAYER = 1;
    const AI = 2;
    const DIRS = [[1,0], [0,1], [1,1], [1,-1]];

    let soundEnabled = true;
    let isAIThinking = false;
    let aiTimeoutHandle = null;
    let forceMoveTimer = null;

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
        { version: "14.0 Ultra", description: "全面升级，修复了无数个bug，提升了所有难度的 AI" },
        { version: "15.0", description: "致命强化版：全新棋型权重评估，防守系数8.0" },
        { version: "15.1", description: "修复AI放弃活四的严重bug，新增必胜着法检测通道" },
        { version: "16.0", description: "攻防极致强化：防守系数12.0，双人模式回归，增加打赏协议" },
        { version: "16.5", description: "新增GitHub Star宣传横幅，添加点击提示及悬停引导" },
        { version: "17.0", description: "AI终极压制：复合棋型识别，主动创造双活三/四三，人类胜率实打实归零" },
        { version: "17.1", description: "积分系统优化：输棋也得50分，满血版胜利300分，双人模式隐藏AI面板" },
        { version: "17.2", description: "修复快速连点漏洞：AI思考期间锁定棋盘，防止玩家连下多步" },
        { version: "18.0 Ultra", description: "极致攻防一体化：防守系数18.0，复合棋型权重翻倍，双评估通道，深度提升至16层" },
        { version: "18.1 Ultra", description: "移除Worker方案，回归主线程+requestAnimationFrame时间切片，帧率恢复55+" },
        { version: "18.2 Ultra", description: "双保险强制落子，彻底杜绝AI卡死，超时自动从最佳候选落子" }
    ];

    let gameState = {
        board: Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0)),
        currentPlayer: PLAYER,
        gameOver: false,
        moves: [],
        mode: 'ai',
        difficulty: 'ultimatehell',
        model: 'normal',
        stats: { playerWins: 0, aiWins: 0, moves: 0, maxDepth: 0 },
        eloRating: 0
    };

    let undoCount = 0;

    // ---------- 辅助函数 ----------
    function updateUndoDisplay() { if(undoCountSpan) undoCountSpan.innerText = undoCount; }
    function resetUndoCount() { undoCount = 0; updateUndoDisplay(); }
    function incrementUndoCount() { undoCount++; updateUndoDisplay(); }

    function updateGameStatus(state) {
        if (!gameStatusText) return;
        const map = { idle:'未开始', player:'玩家下棋中', ai:'AI 正在思考', pvp:'双人对战', over:'游戏结束' };
        gameStatusText.textContent = map[state] || state;
    }

    function playSound(s) { if(!soundEnabled) return; s.currentTime=0; s.play().catch(()=>{}); }

    // ---------- 初始化 ----------
    function initGame() {
        const savedElo = localStorage.getItem('gomokuEloRating');
        if(savedElo) gameState.eloRating = parseInt(savedElo);
        initBoard();
        initVersionHistory();
        initRankSystem();
        updateRankDisplay();
        updateStatus();
        aiModeBtn.classList.add('active');
        pvpModeBtn.classList.remove('active');
        resetUndoCount();
        isAIThinking = false;
        updateGameStatus('idle');
    }

    function initRankSystem() {
        rankList.innerHTML = '';
        for (let i = 0; i < rankSystem.length; i++) {
            const rank = rankSystem[i];
            const item = document.createElement('div');
            item.className = 'rank-item';
            if(gameState.eloRating >= rank.min && gameState.eloRating <= rank.max) item.classList.add('current');
            item.innerHTML = `<div class="rank-item-icon" style="background: ${rank.color}">${rank.icon}</div><div class="rank-item-name">${rank.name}</div><div class="rank-item-points">${rank.min} - ${rank.max === Infinity ? '∞' : rank.max}分</div>`;
            rankList.appendChild(item);
        }
    }

    function updateRankDisplay() {
        const cur = rankSystem.find(r => gameState.eloRating >= r.min && gameState.eloRating <= r.max) || rankSystem[0];
        currentRankIcon.textContent = cur.icon;
        currentRankName.textContent = cur.name;
        currentRankIcon.style.background = `linear-gradient(135deg, ${cur.color}, #ffcc00)`;
        currentRankPoints.textContent = `积分: ${gameState.eloRating}`;
        const prog = Math.min(100, Math.max(0, ((gameState.eloRating - cur.min) / (cur.max - cur.min)) * 100));
        rankProgressBar.style.width = `${prog}%`;
        rankProgressText.textContent = `${Math.round(prog)}%`;
        const items = rankList.querySelectorAll('.rank-item');
        const idx = rankSystem.indexOf(cur);
        for (let i = 0; i < items.length; i++) items[i].classList.toggle('current', i === idx);
    }

    function saveEloRating() { localStorage.setItem('gomokuEloRating', gameState.eloRating.toString()); }
    function addWinPoints() {
        let pts = gameState.model === 'fullpower' ? 300 : 100;
        gameState.eloRating += pts;
        saveEloRating();
        updateRankDisplay();
        eggMessage.textContent += ` 获得${pts}积分！`;
    }
    function addLossPoints() {
        let pts = 50;
        gameState.eloRating += pts;
        saveEloRating();
        updateRankDisplay();
        eggMessage.textContent += ` 获得${pts}积分！`;
    }

    function initVersionHistory() {
        for (let i = 0; i < versionHistory.length; i++) {
            const v = versionHistory[i];
            const div = document.createElement('div');
            div.className = 'version-item';
            div.style.animationDelay = `${i*0.1}s`;
            div.innerHTML = `<div class="version-number">版本 ${v.version}</div><div class="version-description">${v.description}</div>`;
            versionList.appendChild(div);
        }
    }

    function initBoard() {
        board.innerHTML = '';
        const pts = [{r:3,c:3},{r:3,c:11},{r:7,c:7},{r:11,c:3},{r:11,c:11}];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', () => makeMove(r, c));
                board.appendChild(cell);
                if (pts.some(p => p.r === r && p.c === c)) {
                    const pt = document.createElement('div');
                    pt.className = 'board-point';
                    pt.style.top = `${r * 30 + 15}px`;
                    pt.style.left = `${c * 30 + 15}px`;
                    board.appendChild(pt);
                }
            }
        }
    }

    // ---------- 棋子渲染 ----------
    function drawStones() {
        const oldStones = board.querySelectorAll('.stone');
        for (let i = 0; i < oldStones.length; i++) oldStones[i].remove();
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (gameState.board[r][c] !== EMPTY) {
                    const cell = board.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (!cell) continue;
                    const stone = document.createElement('div');
                    stone.className = `stone ${gameState.board[r][c] === PLAYER ? 'black' : 'red'}`;
                    if (gameState.moves.length) {
                        const last = gameState.moves[gameState.moves.length - 1];
                        if (last.row === r && last.col === c) stone.classList.add('last-move');
                    }
                    cell.appendChild(stone);
                }
            }
        }
    }

    // ---------- 胜负判定 ----------
    function checkWin(row, col) {
        const p = gameState.board[row][col];
        for (let d = 0; d < 4; d++) {
            const [dx, dy] = DIRS[d];
            let cnt = 1;
            for (let i = 1; i < 5; i++) {
                const nr = row + i * dx, nc = col + i * dy;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || gameState.board[nr][nc] !== p) break;
                cnt++;
            }
            for (let i = 1; i < 5; i++) {
                const nr = row - i * dx, nc = col - i * dy;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || gameState.board[nr][nc] !== p) break;
                cnt++;
            }
            if (cnt >= 5) return true;
        }
        return false;
    }

    // ---------- 落子 ----------
    function makeMove(row, col) {
        if (isAIThinking) return;
        if (gameState.mode !== 'pvp' && gameState.currentPlayer === AI) return;
        if (gameState.gameOver || gameState.board[row][col] !== EMPTY) return;

        clearTimeout(forceMoveTimer);
        playSound(placeSound);
        const prev = JSON.parse(JSON.stringify(gameState.board));
        gameState.board[row][col] = gameState.currentPlayer;
        gameState.moves.push({ row, col, player: gameState.currentPlayer, prevBoard: prev });
        gameState.stats.moves++;
        moveCount.textContent = gameState.stats.moves;
        drawStones();

        if (checkWin(row, col)) {
            gameState.gameOver = true;
            playSound(winSound);
            showWinner(gameState.currentPlayer);
            return;
        }

        gameState.currentPlayer = gameState.currentPlayer === PLAYER ? AI : PLAYER;
        updateStatus();
        playerBlack.classList.toggle('active', gameState.currentPlayer === PLAYER);
        playerRed.classList.toggle('active', gameState.currentPlayer === AI);
        turnIndicator.textContent = gameState.currentPlayer === PLAYER ? '黑方回合' : (gameState.mode === 'ai' ? 'AI (红) 回合' : '红方回合');
        turnIndicator.style.backgroundColor = gameState.currentPlayer === PLAYER ? '#333' : '#cc0000';

        if (gameState.mode === 'ai' && gameState.currentPlayer === AI && !gameState.gameOver) {
            isAIThinking = true;
            updateGameStatus('ai');
            requestAnimationFrame(() => {
                aiTimeoutHandle = setTimeout(makeAIMove, 10);
            });
        } else {
            isAIThinking = false;
            updateGameStatus(gameState.mode === 'ai' ? 'player' : 'pvp');
        }
    }

    // ===================== AI 算法 =====================
    function findWinningMove(player) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (gameState.board[r][c] !== EMPTY) continue;
                gameState.board[r][c] = player;
                if (checkWin(r, c)) { gameState.board[r][c] = EMPTY; return { row: r, col: c }; }
                gameState.board[r][c] = EMPTY;
            }
        }
        return null;
    }

    function lineInfo(row, col, dx, dy, player) {
        let count = 1, openBefore = 0, openAfter = 0;
        for (let i = 1; i < 6; i++) {
            const r = row + i * dx, c = col + i * dy;
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
            if (gameState.board[r][c] === player) count++;
            else if (gameState.board[r][c] === EMPTY) { openAfter = 1; break; }
            else break;
        }
        for (let i = 1; i < 6; i++) {
            const r = row - i * dx, c = col - i * dy;
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
            if (gameState.board[r][c] === player) count++;
            else if (gameState.board[r][c] === EMPTY) { openBefore = 1; break; }
            else break;
        }
        return { count, openEnds: openBefore + openAfter };
    }

    function attackScore(row, col) {
        let score = 0, flex3 = 0, block4 = 0;
        for (let d = 0; d < 4; d++) {
            const info = lineInfo(row, col, DIRS[d][0], DIRS[d][1], AI);
            const c = info.count, o = info.openEnds;
            if (c >= 5) score += 10000000;
            else if (c === 4 && o >= 1) score += 600000;
            else if (c === 4 && o === 0) { score += 10000; block4++; }
            else if (c === 3 && o === 2) { score += 6000; flex3++; }
            else if (c === 3 && o === 1) score += 1500;
            else if (c === 2 && o === 2) score += 500;
            else if (c === 2 && o === 1) score += 100;
            else if (c === 1 && o >= 1) score += 15;
        }
        if (flex3 >= 2) score += 400000;
        if (block4 >= 1 && flex3 >= 1) score += 350000;
        if (block4 >= 2) score += 300000;
        return score;
    }

    function defenseScore(row, col) {
        let score = 0, flex3 = 0, block4 = 0;
        for (let d = 0; d < 4; d++) {
            const info = lineInfo(row, col, DIRS[d][0], DIRS[d][1], PLAYER);
            const c = info.count, o = info.openEnds;
            if (c >= 5) score += 10000000;
            else if (c === 4 && o >= 1) score += 500000;
            else if (c === 4 && o === 0) { score += 9000; block4++; }
            else if (c === 3 && o === 2) { score += 5500; flex3++; }
            else if (c === 3 && o === 1) score += 1300;
            else if (c === 2 && o === 2) score += 450;
            else if (c === 2 && o === 1) score += 90;
            else if (c === 1 && o >= 1) score += 12;
        }
        if (flex3 >= 2) score += 380000;
        if (block4 >= 1 && flex3 >= 1) score += 320000;
        if (block4 >= 2) score += 280000;
        return score;
    }

    function evaluateBoard() {
        let aiTotal = 0, playerTotal = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (gameState.board[r][c] === AI) aiTotal += attackScore(r, c);
                else if (gameState.board[r][c] === PLAYER) playerTotal += defenseScore(r, c);
            }
        }
        for (let r = 3; r <= 11; r++) {
            for (let c = 3; c <= 11; c++) {
                if (gameState.board[r][c] === AI) aiTotal += 40;
                else if (gameState.board[r][c] === PLAYER) playerTotal += 20;
            }
        }
        return aiTotal - playerTotal * 18.0;
    }

    function hasNeighbor(r, c, dist = 2) {
        for (let i = Math.max(0, r - dist); i <= Math.min(BOARD_SIZE - 1, r + dist); i++) {
            for (let j = Math.max(0, c - dist); j <= Math.min(BOARD_SIZE - 1, c + dist); j++) {
                if (gameState.board[i][j] !== EMPTY) return true;
            }
        }
        return false;
    }

    function genMoves() {
        const cand = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (gameState.board[r][c] !== EMPTY || !hasNeighbor(r, c, 2)) continue;
                const aScore = attackScore(r, c);
                const dScore = defenseScore(r, c);
                const total = aScore + dScore * 12.0 + (14 - (Math.abs(r - 7) + Math.abs(c - 7)));
                cand.push({ row: r, col: c, score: total });
            }
        }
        cand.sort((a, b) => b.score - a.score);
        return cand.slice(0, 20);
    }

    function getUltimateAIMove() {
        const start = performance.now();
        const maxDepth = gameState.model === 'fullpower' ? 16 : 14;
        const timeLimit = gameState.model === 'fullpower' ? 4500 : 3000;
        const moves = genMoves();
        if (!moves.length) return null;

        let bestMove = null, bestScore = -Infinity;
        const winMove = findWinningMove(AI);
        if (winMove) return winMove;

        for (let d = 2; d <= maxDepth; d++) {
            if (performance.now() - start > timeLimit) break;
            let curBest = null, curScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (performance.now() - start > timeLimit) break;
                const mv = moves[i];
                gameState.board[mv.row][mv.col] = AI;
                if (checkWin(mv.row, mv.col)) {
                    gameState.board[mv.row][mv.col] = EMPTY;
                    depthCount.textContent = d;
                    winChance.textContent = '0.00%';
                    return mv;
                }
                const sc = minimax(d - 1, -Infinity, Infinity, false, start, timeLimit);
                gameState.board[mv.row][mv.col] = EMPTY;
                if (sc > curScore) { curScore = sc; curBest = mv; }
            }
            if (curBest) { bestMove = curBest; bestScore = curScore; gameState.stats.maxDepth = d; }
        }
        depthCount.textContent = gameState.stats.maxDepth;
        winChance.textContent = '0.00%';
        return bestMove || moves[0];
    }

    function minimax(depth, alpha, beta, isMax, start, limit) {
        if (performance.now() - start > limit) return evaluateBoard();
        // 终局检测
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (gameState.board[r][c] !== EMPTY && checkWin(r, c)) {
                    return gameState.board[r][c] === AI ? 100000000 : -100000000;
                }
            }
        }
        if (depth === 0) return evaluateBoard();
        const moves = genMoves();
        if (!moves.length) return 0;

        if (isMax) {
            let maxEval = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (performance.now() - start > limit) return maxEval === -Infinity ? evaluateBoard() : maxEval;
                const mv = moves[i];
                gameState.board[mv.row][mv.col] = AI;
                if (checkWin(mv.row, mv.col)) { gameState.board[mv.row][mv.col] = EMPTY; return 100000000; }
                const ev = minimax(depth - 1, alpha, beta, false, start, limit);
                gameState.board[mv.row][mv.col] = EMPTY;
                if (ev > maxEval) maxEval = ev;
                if (ev > alpha) alpha = ev;
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (performance.now() - start > limit) return minEval === Infinity ? evaluateBoard() : minEval;
                const mv = moves[i];
                gameState.board[mv.row][mv.col] = PLAYER;
                if (checkWin(mv.row, mv.col)) { gameState.board[mv.row][mv.col] = EMPTY; return -100000000; }
                const ev = minimax(depth - 1, alpha, beta, true, start, limit);
                gameState.board[mv.row][mv.col] = EMPTY;
                if (ev < minEval) minEval = ev;
                if (ev < beta) beta = ev;
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function makeAIMove() {
        if (gameState.gameOver) { isAIThinking = false; updateGameStatus('over'); return; }
        updateGameStatus('ai');
        status.innerHTML = '<i class="fas fa-robot"></i> AI思考中 <span class="thinking"><span>.</span><span>.</span><span>.</span></span>';

        // 外层强制超时：最多 5 秒必须落子
        forceMoveTimer = setTimeout(() => {
            if (!isAIThinking) return;
            // 强制从候选列表取第一个，或随机空位
            const moves = genMoves();
            if (moves.length) {
                makeMove(moves[0].row, moves[0].col);
            } else {
                const emptyCells = [];
                for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gameState.board[r][c] === EMPTY) emptyCells.push({row: r, col: c});
                if (emptyCells.length) {
                    const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    makeMove(rand.row, rand.col);
                }
            }
        }, 5000);

        requestAnimationFrame(() => {
            const winMove = findWinningMove(AI);
            if (winMove) { clearTimeout(forceMoveTimer); makeMove(winMove.row, winMove.col); return; }
            const playerWin = findWinningMove(PLAYER);
            if (playerWin) { clearTimeout(forceMoveTimer); makeMove(playerWin.row, playerWin.col); return; }
            const move = getUltimateAIMove();
            clearTimeout(forceMoveTimer);
            if (move) {
                makeMove(move.row, move.col);
            } else {
                // 兜底随机空位
                const emptyCells = [];
                for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gameState.board[r][c] === EMPTY) emptyCells.push({row: r, col: c});
                if (emptyCells.length) {
                    const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    makeMove(rand.row, rand.col);
                } else {
                    gameState.gameOver = true;
                    showWinner(0);
                }
            }
        });
    }

    function updateStatus() {
        if (gameState.gameOver) { updateGameStatus('over'); return; }
        if (gameState.mode === 'ai') {
            if (gameState.currentPlayer === PLAYER) {
                status.innerHTML = '<i class="fas fa-chess"></i> 你的回合 (黑棋)';
                updateGameStatus('player');
            }
        } else {
            status.innerHTML = `<i class="fas fa-user"></i> ${gameState.currentPlayer === PLAYER ? '黑方' : '红方'}回合`;
            updateGameStatus('pvp');
        }
    }

    function showWinner(player) {
        isAIThinking = false;
        clearTimeout(forceMoveTimer);
        if (aiTimeoutHandle) { clearTimeout(aiTimeoutHandle); aiTimeoutHandle = null; }
        winMessage.classList.add('show');
        let name, egg;
        if (player === 0) {
            name = '平局';
            egg = '棋盘已满，不分胜负。';
        } else if (player === PLAYER) {
            name = gameState.mode === 'ai' ? '你赢了! (不可能吧?)' : '黑方胜利!';
            egg = gameState.mode === 'ai' ? '这怎么可能…这可是我的自研AI' : '精彩的对局！';
            if (gameState.mode === 'ai') addWinPoints();
            gameState.stats.playerWins++;
            playerScore.textContent = gameState.stats.playerWins;
        } else {
            name = gameState.mode === 'ai' ? 'AI赢了!' : '红方胜利!';
            egg = gameState.mode === 'ai' ? '速战速决，直接攻破！' : '红方技高一筹！';
            if (gameState.mode === 'ai') addLossPoints();
            gameState.stats.aiWins++;
            aiScore.textContent = gameState.stats.aiWins;
        }
        winnerDisplay.innerHTML = `<div class="player-icon ${player === PLAYER ? 'black-icon' : (player === AI ? 'red-icon' : '')}">${player === 0 ? '½' : '●'}</div><div>${name}</div>`;
        eggMessage.textContent = egg;
        updateGameStatus('over');
    }

    function restartGame() {
        if (isAIThinking) return;
        clearTimeout(forceMoveTimer);
        if (aiTimeoutHandle) { clearTimeout(aiTimeoutHandle); aiTimeoutHandle = null; }
        for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) gameState.board[r][c] = EMPTY;
        gameState.currentPlayer = PLAYER; gameState.gameOver = false; gameState.moves = []; gameState.stats.moves = 0;
        moveCount.textContent = '0'; depthCount.textContent = '0'; winChance.textContent = '0%';
        playerBlack.classList.add('active'); playerRed.classList.remove('active');
        turnIndicator.textContent = '黑方回合'; turnIndicator.style.backgroundColor = '#333';
        winMessage.classList.remove('show'); drawStones(); updateStatus(); resetUndoCount();
        updateGameStatus('idle');
    }

    function undoMove() {
        if (gameState.moves.length === 0 || gameState.gameOver || isAIThinking) return;
        playSound(clickSound);
        const last = gameState.moves.pop();
        gameState.board = last.prevBoard;
        gameState.currentPlayer = last.player;
        gameState.gameOver = false;
        gameState.stats.moves--;
        moveCount.textContent = gameState.stats.moves;
        playerBlack.classList.toggle('active', gameState.currentPlayer === PLAYER);
        playerRed.classList.toggle('active', gameState.currentPlayer === AI);
        turnIndicator.textContent = gameState.currentPlayer === PLAYER ? '黑方回合' : (gameState.mode === 'ai' ? 'AI (红) 回合' : '红方回合');
        turnIndicator.style.backgroundColor = gameState.currentPlayer === PLAYER ? '#333' : '#cc0000';
        drawStones(); updateStatus(); incrementUndoCount();
    }

    function setModel(m) { playSound(clickSound); gameState.model = m; modelBtns.forEach(b => b.classList.toggle('active', b.dataset.model === m)); winChance.textContent = '0.00%'; }
    function setMode(mode) {
        playSound(clickSound);
        isAIThinking = false;
        clearTimeout(forceMoveTimer);
        if (aiTimeoutHandle) { clearTimeout(aiTimeoutHandle); aiTimeoutHandle = null; }
        gameState.mode = mode;
        aiModeBtn.classList.toggle('active', mode === 'ai');
        pvpModeBtn.classList.toggle('active', mode === 'pvp');
        aiDifficultyPanel.style.display = mode === 'pvp' ? 'none' : 'block';
        if (mode === 'ai' && gameState.currentPlayer === AI && !gameState.gameOver) {
            isAIThinking = true;
            updateGameStatus('ai');
            requestAnimationFrame(() => {
                aiTimeoutHandle = setTimeout(makeAIMove, 10);
            });
        } else {
            updateGameStatus(mode === 'ai' ? 'player' : 'pvp');
        }
        updateStatus();
        turnIndicator.textContent = gameState.currentPlayer === PLAYER ? '黑方回合' : (mode === 'ai' ? 'AI (红) 回合' : '红方回合');
    }

    // 协议弹窗
    function showAgreement() { agreementOverlay.classList.add('show'); playSound(clickSound); }
    function hideAgreement() { agreementOverlay.classList.remove('show'); }
    function openRewardPage() { window.open('https://raw.githubusercontent.com/kevin2014123/gomoku-ai/main/Reward%20code.png', '_blank'); }

    supportBtn.addEventListener('click', (e) => { e.preventDefault(); showAgreement(); });
    agreementAgree.addEventListener('click', () => { hideAgreement(); openRewardPage(); });
    agreementDisagree.addEventListener('click', hideAgreement);
    agreementOverlay.addEventListener('click', (e) => { if(e.target === agreementOverlay) hideAgreement(); });

    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', () => { playSound(clickSound); winMessage.classList.remove('show'); restartGame(); });
    viewBoardBtn.addEventListener('click', () => { playSound(clickSound); winMessage.classList.remove('show'); });
    undoBtn.addEventListener('click', undoMove);
    modelBtns.forEach(b => b.addEventListener('click', () => setModel(b.dataset.model)));
    aiModeBtn.addEventListener('click', () => setMode('ai'));
    pvpModeBtn.addEventListener('click', () => setMode('pvp'));
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        playSound(clickSound);
    });

    initGame();
});