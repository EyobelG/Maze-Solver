\\const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// --- Difficulty & Configuration ---
const rows = 51; // Complexity (must be odd)
const cols = 51; 
const displaySize = 800; 

// --- Williams Purple & Gold Theme ---
const WALL_COLOR = "#3C1053";   // Williams Purple
const START_COLOR = "#FFC72C";  // Williams Gold (Start)
const EXIT_COLOR = "#2ecc71";   // Green (Goal)
const PATH_COLOR = "#FFC72C";   // Williams Gold (Solver Path)
const OPEN_COLOR = "#FFFFFF";   // White (Path)

const cellSize = displaySize / rows;
canvas.width = displaySize;
canvas.height = displaySize;

let maze = [];
let visited = [];
let solving = false; 

/**
 * Initializes a new hard maze
 */
function initMaze() {
    if (solving) return;
    
    // Fill with walls
    maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // Generate maze structure
    generate(1, 1);
    
    // Set fixed Start and Exit
    maze[1][1] = 2; 
    maze[rows - 2][cols - 2] = 3; 
    
    draw();
}

/**
 * Randomized DFS for Maze Generation (Carving)
 */
function generate(r, c) {
    maze[r][c] = 0;
    const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);

    for (let [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && maze[nr][nc] === 1) {
            maze[r + dr / 2][c + dc / 2] = 0; 
            generate(nr, nc);
        }
    }
}

/**
 * Renders the maze to the canvas
 */
function draw() {
    ctx.clearRect(0, 0, displaySize, displaySize);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (maze[r][col] === 1) ctx.fillStyle = WALL_COLOR;
            else if (maze[r][col] === 2) ctx.fillStyle = START_COLOR;
            else if (maze[r][col] === 3) ctx.fillStyle = EXIT_COLOR;
            else if (maze[r][col] === 4) ctx.fillStyle = PATH_COLOR;
            else ctx.fillStyle = OPEN_COLOR;
            
            ctx.fillRect(c * cellSize, r * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
    }
}

/**
 * Recursive DFS Solver with Visualization
 */
async function solve(r, c) {
    // Safety check: Bounds, Walls, or already Visited
    if (r < 0 || r >= rows || c < 0 || c >= cols || maze[r][c] === 1 || visited[r][c]) {
        return false;
    }
    
    // Goal check
    if (maze[r][c] === 3) return true; 

    visited[r][c] = true;
    
    // Mark the path visually (if it's not the start square)
    if (maze[r][c] === 0) {
        maze[r][c] = 4;
    }
    
    draw();
    
    // Animation delay (speed adjusted for large maze)
    await new Promise(res => setTimeout(res, 25)); 

    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (let [dr, dc] of dirs) {
        if (await solve(r + dr, c + dc)) return true;
    }

    // Backtrack visually: Remove gold path if dead end
    if (maze[r][c] === 4) {
        maze[r][c] = 0;
    }
    draw();
    return false;
}

/**
 * Triggered by the "Solve" button
 * Handles resetting states and clearing previous colors
 */
function startSolving() {
    if (solving) return;
    solving = true;
    
    // 1. Reset logic state (visited array)
    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // 2. Reset visual state (remove any previous gold paths)
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (maze[r][c] === 4) {
                maze[r][c] = 0;
            }
        }
    }
    
    draw(); // Draw clear maze before starting solve

    // 3. Begin search from start coordinate
    solve(1, 1).then(() => {
        solving = false;
    });
}

// Initial build
initMaze();