const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const size = 400;
const rows = 21; // Must be odd for the wall-carving logic
const cols = 21;
const cellSize = size / rows;

canvas.width = size;
canvas.height = size;

let maze = [];
let visited = [];

// Initialize and Generate
function initMaze() {
    maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // Start generating from (1,1)
    generate(1, 1);
    
    // Define Start and End
    maze[1][1] = 2; // Start
    maze[rows - 2][cols - 2] = 3; // Exit
    
    draw();
}

// Randomized DFS for Generation
function generate(r, c) {
    maze[r][c] = 0;
    const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);

    for (let [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && maze[nr][nc] === 1) {
            maze[r + dr / 2][c + dc / 2] = 0; // Remove wall between
            generate(nr, nc);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, size, size);
    for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
            if (maze[r][col] === 1) ctx.fillStyle = "#2c3e50"; // Wall
            else if (maze[r][col] === 2) ctx.fillStyle = "#e74c3c"; // Start
            else if (maze[r][col] === 3) ctx.fillStyle = "#2ecc71"; // Exit
            else if (maze[r][col] === 4) ctx.fillStyle = "#f1c40f"; // Path
            else ctx.fillStyle = "#fff"; // Open space
            
            ctx.fillRect(col * cellSize, r * cellSize, cellSize, cellSize);
        }
    }
}

// DFS Solver
async function solve(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || maze[r][c] === 1 || visited[r][c]) return false;
    
    if (maze[r][c] === 3) return true; // Exit found

    visited[r][c] = true;
    if (maze[r][c] === 0) maze[r][c] = 4; // Mark path visually
    
    draw();
    await new Promise(res => setTimeout(res, 50)); // Delay for animation

    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (let [dr, dc] of dirs) {
        if (await solve(r + dr, c + dc)) return true;
    }

    if (maze[r][c] === 4) maze[r][c] = 0; // Backtrack visually
    draw();
    return false;
}

function startSolving() {
    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    solve(1, 1);
}

initMaze();