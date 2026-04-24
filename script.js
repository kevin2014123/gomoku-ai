// script.js - 五子棋 Ultra 致命强化版 (含打赏协议)
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
    const modelBtns = document.querySelectorAll('.model-btn');
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
    
    // 协议弹窗元素
    const supportBtn = document.getElementById('supportBtn');
    const agreementOverlay = document.getElementById('agreementOverlay');
    const agreementAgree = document.getElementById('agreementAgree');
    const agreementDisagree = document.getElementById('agreementDisagree');
    
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
        stats: { playerWins: 0, aiWins: 0, moves: 0, maxDepth: 0 },
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
        { version: "14.0 Ultra", description: "全面升级，修复了无数个bug，提升了所有难度的 AI" },
        { version: "15.1", description: "修复AI放弃活四的严重bug，增加双人对战回归" },
        { version: "16.0", description: "增加打赏用户协议弹窗" }
    ];
    
    let undoCount = 0;
    function updateUndoDisplay() { if(undoCountSpan) undoCountSpan.innerText = undoCount; }
    function resetUndoCount() { undoCount = 0; updateUndoDisplay(); }
    function incrementUndoCount() { undoCount++; updateUndoDisplay(); }
    
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
    }
    
    function initRankSystem() {
        rankList.innerHTML = '';
        rankSystem.forEach(rank => {
            const item = document.createElement('div');
            item.className = 'rank-item';
            if(gameState.eloRating >= rank.min && gameState.eloRating <= rank.max) item.classList.add('current');
            item.innerHTML = `<div class="rank-item-icon" style="background: ${rank.color}">${rank.icon}</div><div class="rank-item-name">${rank.name}</div><div class="rank-item-points">${rank.min} - ${rank.max === Infinity ? '∞' : rank.max}分</div>`;
            rankList.appendChild(item);
        });
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
        document.querySelectorAll('.rank-item').forEach((el, idx) => el.classList.toggle('current', idx === rankSystem.indexOf(cur)));
    }
    
    function saveEloRating() { localStorage.setItem('gomokuEloRating', gameState.eloRating.toString()); }
    function addEloPoints() {
        let pts = gameState.model === 'fullpower' ? 300 : 200;
        gameState.eloRating += pts;
        saveEloRating();
        updateRankDisplay();
        eggMessage.textContent += ` 获得${pts}积分！`;
    }
    
    function initVersionHistory() {
        versionHistory.forEach((v, i) => {
            const div = document.createElement('div');
            div.className = 'version-item';
            div.style.animationDelay = `${i*0.1}s`;
            div.innerHTML = `<div class="version-number">版本 ${v.version}</div><div class="version-description">${v.description}</div>`;
            versionList.appendChild(div);
        });
    }
    
    function initBoard() {
        board.innerHTML = '';
        const pts = [{r:3,c:3},{r:3,c:11},{r:7,c:7},{r:11,c:3},{r:11,c:11}];
        for(let r=0; r<15; r++) for(let c=0; c<15; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => makeMove(r, c));
            board.appendChild(cell);
            if(pts.some(p => p.r===r && p.c===c)) {
                const pt = document.createElement('div');
                pt.className = 'board-point';
                pt.style.top = `${r*30+15}px`;
                pt.style.left = `${c*30+15}px`;
                board.appendChild(pt);
            }
        }
    }
    
    function playSound(s) { if(!soundEnabled) return; s.currentTime=0; s.play().catch(()=>{}); }
    
    function drawStones() {
        document.querySelectorAll('.stone').forEach(s => s.remove());
        for(let r=0; r<15; r++) for(let c=0; c<15; c++) if(gameState.board[r][c] !== 0) {
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            const stone = document.createElement('div');
            stone.className = `stone ${gameState.board[r][c] === 1 ? 'black' : 'red'}`;
            if(gameState.moves.length) {
                const last = gameState.moves[gameState.moves.length-1];
                if(last.row === r && last.col === c) stone.classList.add('last-move');
            }
            cell.appendChild(stone);
        }
    }
    
    const DIRS = [[1,0],[0,1],[1,1],[1,-1]];
    function checkWin(row, col) {
        const p = gameState.board[row][col];
        for(let [dx,dy] of DIRS) {
            let cnt = 1;
            for(let i=1; i<5; i++) { let nr=row+i*dx, nc=col+i*dy; if(nr<0||nr>=15||nc<0||nc>=15||gameState.board[nr][nc]!==p) break; cnt++; }
            for(let i=1; i<5; i++) { let nr=row-i*dx, nc=col-i*dy; if(nr<0||nr>=15||nc<0||nc>=15||gameState.board[nr][nc]!==p) break; cnt++; }
            if(cnt >= 5) return true;
        }
        return false;
    }
    
    function makeMove(row, col) {
        if(gameState.gameOver || gameState.board[row][col] !== 0) return;
        playSound(placeSound);
        const prev = JSON.parse(JSON.stringify(gameState.board));
        gameState.board[row][col] = gameState.currentPlayer;
        gameState.moves.push({row, col, player: gameState.currentPlayer, prevBoard: prev});
        gameState.stats.moves++;
        moveCount.textContent = gameState.stats.moves;
        drawStones();
        if(checkWin(row, col)) {
            gameState.gameOver = true;
            playSound(winSound);
            showWinner(gameState.currentPlayer);
            return;
        }
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateStatus();
        playerBlack.classList.toggle('active', gameState.currentPlayer === 1);
        playerRed.classList.toggle('active', gameState.currentPlayer === 2);
        turnIndicator.textContent = gameState.currentPlayer === 1 ? '黑方回合' : (gameState.mode === 'ai' ? 'AI (红) 回合' : '红方回合');
        turnIndicator.style.backgroundColor = gameState.currentPlayer === 1 ? '#333' : '#cc0000';
        if(gameState.mode === 'ai' && gameState.currentPlayer === 2 && !gameState.gameOver) setTimeout(makeAIMove, 100);
    }
    
    function findWinningMove(player) {
        for(let r=0; r<15; r++) for(let c=0; c<15; c++) if(gameState.board[r][c]===0) {
            gameState.board[r][c] = player;
            if(checkWin(r, c)) { gameState.board[r][c] = 0; return {row: r, col: c}; }
            gameState.board[r][c] = 0;
        }
        return null;
    }
    
    function makeAIMove() {
        if(gameState.gameOver) return;
        status.innerHTML = '<i class="fas fa-robot"></i> AI思考中 <span class="thinking"><span>.</span><span>.</span><span>.</span></span>';
        setTimeout(() => {
            // 1. 自己直接赢
            let winMove = findWinningMove(2);
            if(winMove) { makeMove(winMove.row, winMove.col); return; }
            // 2. 阻挡玩家直接赢
            let playerWin = findWinningMove(1);
            if(playerWin) { makeMove(playerWin.row, playerWin.col); return; }
            // 3. 搜索
            let move = getUltimateHellAIMove();
            if(move) makeMove(move.row, move.col);
        }, 30);
    }
    
    function evalDir(row, col, dx, dy, player) {
        let cnt=1, openL=0, openR=0;
        for(let i=1; i<5; i++) { let r=row+i*dx, c=col+i*dy; if(r<0||r>=15||c<0||c>=15) break; if(gameState.board[r][c]===player) cnt++; else if(gameState.board[r][c]===0) { openR++; break; } else break; }
        for(let i=1; i<5; i++) { let r=row-i*dx, c=col-i*dy; if(r<0||r>=15||c<0||c>=15) break; if(gameState.board[r][c]===player) cnt++; else if(gameState.board[r][c]===0) { openL++; break; } else break; }
        let ends = openL+openR;
        if(cnt>=5) return 10000000;
        if(cnt===4) return ends>=1 ? 800000 : 15000;
        if(cnt===3) return ends===2 ? 8000 : (ends===1 ? 2000 : 1000);
        if(cnt===2) return ends===2 ? 800 : (ends===1 ? 150 : 50);
        return cnt===1 ? 10 : 0;
    }
    
    function evalPos(r, c, player) { let s=0; for(let d of DIRS) s+=evalDir(r,c,d[0],d[1],player); return s; }
    
    function evaluateBoard() {
        let ai=0, pl=0;
        for(let r=0; r<15; r++) for(let c=0; c<15; c++) {
            if(gameState.board[r][c]===2) ai+=evalPos(r,c,2);
            else if(gameState.board[r][c]===1) pl+=evalPos(r,c,1);
        }
        for(let r=3; r<=11; r++) for(let c=3; c<=11; c++) {
            if(gameState.board[r][c]===2) ai+=50;
            else if(gameState.board[r][c]===1) pl+=20;
        }
        return ai - pl * 12.0;
    }
    
    function hasNeighbor(r,c,d=2) {
        for(let i=Math.max(0,r-d); i<=Math.min(14,r+d); i++) for(let j=Math.max(0,c-d); j<=Math.min(14,c+d); j++) if(gameState.board[i][j]!==0) return true;
        return false;
    }
    
    function genMoves() {
        let cand=[];
        for(let r=0; r<15; r++) for(let c=0; c<15; c++) if(gameState.board[r][c]===0 && hasNeighbor(r,c,2)) {
            let aiS=evalPos(r,c,2), plS=evalPos(r,c,1);
            cand.push({row:r, col:c, score: aiS + plS*9.0 + 14 - (Math.abs(r-7)+Math.abs(c-7))});
        }
        cand.sort((a,b)=>b.score-a.score);
        return cand.slice(0,12);
    }
    
    function getUltimateHellAIMove() {
        let start=Date.now(), maxD=gameState.model==='fullpower'?12:10, limit=gameState.model==='fullpower'?3000:2000;
        let moves=genMoves(); if(!moves.length) return null;
        let best=null, bestScore=-Infinity;
        let winMove=findWinningMove(2); if(winMove) return winMove;
        for(let d=2; d<=maxD; d++) {
            if(Date.now()-start>limit) break;
            let curBest=null, curScore=-Infinity;
            for(let mv of moves) {
                if(Date.now()-start>limit) break;
                gameState.board[mv.row][mv.col]=2;
                if(checkWin(mv.row, mv.col)) { gameState.board[mv.row][mv.col]=0; depthCount.textContent=d; return mv; }
                let sc = minimax(d-1, -Infinity, Infinity, false, start, limit);
                gameState.board[mv.row][mv.col]=0;
                if(sc>curScore) { curScore=sc; curBest=mv; }
            }
            if(curBest) { best=curBest; bestScore=curScore; gameState.stats.maxDepth=d; }
        }
        depthCount.textContent=gameState.stats.maxDepth;
        winChance.textContent='0.00%';
        return best || moves[0];
    }
    
    function minimax(depth, alpha, beta, isMax, start, limit) {
        if(Date.now()-start>limit) return evaluateBoard();
        let w = (()=>{ for(let r=0;r<15;r++) for(let c=0;c<15;c++) if(gameState.board[r][c]!==0 && checkWin(r,c)) return gameState.board[r][c]; return 0; })();
        if(w!==0) return w===2 ? 100000000 : -100000000;
        if(depth===0) return evaluateBoard();
        let moves=genMoves(); if(!moves.length) return 0;
        if(isMax) {
            let maxE=-Infinity;
            for(let mv of moves) {
                gameState.board[mv.row][mv.col]=2;
                if(checkWin(mv.row,mv.col)) { gameState.board[mv.row][mv.col]=0; return 100000000; }
                let e=minimax(depth-1, alpha, beta, false, start, limit);
                gameState.board[mv.row][mv.col]=0;
                maxE=Math.max(maxE,e); alpha=Math.max(alpha,e); if(beta<=alpha) break;
            }
            return maxE;
        } else {
            let minE=Infinity;
            for(let mv of moves) {
                gameState.board[mv.row][mv.col]=1;
                if(checkWin(mv.row,mv.col)) { gameState.board[mv.row][mv.col]=0; return -100000000; }
                let e=minimax(depth-1, alpha, beta, true, start, limit);
                gameState.board[mv.row][mv.col]=0;
                minE=Math.min(minE,e); beta=Math.min(beta,e); if(beta<=alpha) break;
            }
            return minE;
        }
    }
    
    function updateStatus() {
        if(gameState.gameOver) return;
        if(gameState.mode==='ai') status.innerHTML = gameState.currentPlayer===1 ? '<i class="fas fa-chess"></i> 你的回合 (黑棋)' : '<i class="fas fa-robot"></i> AI思考中...';
        else status.innerHTML = `<i class="fas fa-user"></i> ${gameState.currentPlayer===1?'黑方':'红方'}回合`;
    }
    
    function showWinner(player) {
        winMessage.classList.add('show');
        let name, egg;
        if(player===1) { name=gameState.mode==='ai'?'你赢了! (不可能吧?)':'黑方胜利!'; egg=gameState.mode==='ai'?'这怎么可能…这可是我的自研AI':'精彩的对局！'; if(gameState.mode==='ai') addEloPoints(); }
        else { name=gameState.mode==='ai'?'AI赢了!':'红方胜利!'; egg=gameState.mode==='ai'?'速战速决，直接攻破！':'红方技高一筹！'; }
        if(player===1) { gameState.stats.playerWins++; playerScore.textContent=gameState.stats.playerWins; }
        else { gameState.stats.aiWins++; aiScore.textContent=gameState.stats.aiWins; }
        winnerDisplay.innerHTML = `<div class="player-icon ${player===1?'black-icon':'red-icon'}">●</div><div>${name}</div>`;
        eggMessage.textContent = egg;
    }
    
    function restartGame() {
        gameState.board = Array(15).fill().map(() => Array(15).fill(0));
        gameState.currentPlayer=1; gameState.gameOver=false; gameState.moves=[]; gameState.stats.moves=0;
        moveCount.textContent='0'; depthCount.textContent='0'; winChance.textContent='0%';
        playerBlack.classList.add('active'); playerRed.classList.remove('active');
        turnIndicator.textContent='黑方回合'; turnIndicator.style.backgroundColor='#333';
        winMessage.classList.remove('show'); drawStones(); updateStatus(); resetUndoCount();
    }
    
    function undoMove() {
        if(gameState.moves.length===0||gameState.gameOver) return;
        playSound(clickSound);
        const last=gameState.moves.pop();
        gameState.board=last.prevBoard; gameState.currentPlayer=last.player; gameState.gameOver=false;
        gameState.stats.moves--; moveCount.textContent=gameState.stats.moves;
        playerBlack.classList.toggle('active', gameState.currentPlayer===1);
        playerRed.classList.toggle('active', gameState.currentPlayer===2);
        turnIndicator.textContent = gameState.currentPlayer===1?'黑方回合':(gameState.mode==='ai'?'AI (红) 回合':'红方回合');
        turnIndicator.style.backgroundColor = gameState.currentPlayer===1?'#333':'#cc0000';
        drawStones(); updateStatus(); incrementUndoCount();
    }
    
    function setModel(m) { playSound(clickSound); gameState.model=m; modelBtns.forEach(b=>b.classList.toggle('active', b.dataset.model===m)); winChance.textContent='0.00%'; }
    function setMode(mode) {
        playSound(clickSound); gameState.mode=mode;
        aiModeBtn.classList.toggle('active', mode==='ai'); pvpModeBtn.classList.toggle('active', mode==='pvp');
        if(mode==='ai' && gameState.currentPlayer===2 && !gameState.gameOver) setTimeout(makeAIMove, 100);
        updateStatus();
        turnIndicator.textContent = gameState.currentPlayer===1?'黑方回合':(mode==='ai'?'AI (红) 回合':'红方回合');
    }
    
    // 协议弹窗逻辑
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
    modelBtns.forEach(b=>b.addEventListener('click', ()=>setModel(b.dataset.model)));
    aiModeBtn.addEventListener('click', ()=>setMode('ai'));
    pvpModeBtn.addEventListener('click', ()=>setMode('pvp'));
    soundToggle.addEventListener('click', ()=>{ soundEnabled=!soundEnabled; soundToggle.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>'; playSound(clickSound); });
    
    initGame();
});