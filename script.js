const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// --- Tweak these for Difficulty ---
const rows = 51; // MUST be odd. 51 is very large and complex.
const cols = 51; // MUST be odd. 
const displaySize = 800; // Total canvas display size in pixels

// Define Cell Types / State colors
const WALL_COLOR = "#3C1053"; // Williams Purple for walls
const START_COLOR = "#FFC72C"; // Williams Gold for start
const EXIT_COLOR = "#2ecc71"; // Keep Green for clarity of goal
const PATH_COLOR = "#FFC72C"; // Williams Gold for the solver path
const OPEN_COLOR = "#FFFFFF"; // Pure White for open spaces

const cellSize = displaySize / rows;
canvas.width = displaySize;
canvas.height = displaySize;

let maze = [];
let visited = [];
let solving = false; // Prevent multiple solve calls

function initMaze() {
    if (solving) return; // Don't allow generation mid-solve
    
    maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // Start generating from (1,1)
    generate(1, 1);
    
    // Define Start and End in the extreme corners
    maze[1][1] = 2; // Start
    maze[rows - 2][cols - 2] = 3; // Exit
    
    draw();
}

// Randomized DFS for Generation - Standard recursive approach
function generate(r, c) {
    maze[r][c] = 0;
    
    // Neighbors are 2 steps away (carving logic)
    // Directions are shuffled to ensure randomness
    const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);

    for (let [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        
        // Safety checks for boundaries and unvisited wall cells
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && maze[nr][nc] === 1) {
            maze[r + dr / 2][c + dc / 2] = 0; // Carve path through wall between
            generate(nr, nc);
        }
    }
}

// Render the grid to the canvas
function draw() {
    ctx.clearRect(0, 0, displaySize, displaySize);
    for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
            if (maze[r][col] === 1) ctx.fillStyle = WALL_COLOR; // Wall
            else if (maze[r][col] === 2) ctx.fillStyle = START_COLOR; // Start
            else if (maze[r][col] === 3) ctx.fillStyle = EXIT_COLOR; // Exit
            else if (maze[r][col] === 4) ctx.fillStyle = PATH_COLOR; // Active Solver Path
            else ctx.fillStyle = OPEN_COLOR; // Open space (0)
            
            // Draw slightly smaller to create grid line effect (subtle)
            ctx.fillRect(col * cellSize, r * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
    }
}

// Recursive DFS Solver with Visualization (async/await)
async function solve(r, c) {
    // 1. Safety Checks (Dead End / Bounds / Wall / Already Visited)
    if (r < 0 || r >= rows || c < 0 || c >= cols || 
        maze[r][c] === 1 || visited[r][c]) {
        return false;
    }
    
    // 2. Goal Check
    if (maze[r][c] === 3) return true; // Exit found!

    // 3. Mark current as Visited
    visited[r][c] = true;
    
    // Mark Visually if it's not the start cell
    if (maze[r][c] === 0) maze[r][c] = 4;
    
    draw();
    
    // Delay for animation (faster for larger maze)
    await new Promise(res => setTimeout(res, 35)); 

    // 4. Explore Neighbors in a set order (this is DFS)
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (let [dr, dc] of dirs) {
        if (await solve(r + dr, c + dc)) return true; // Path propagated up!
    }

    // 5. Backtracking (if no neighbors worked)
    // Remove from visual path, but leave as 'visited' so we don't return
    if (maze[r][c] === 4) maze[r][c] = 0; 
    draw();
    return false;
}

// Wrapper to prevent issues with start button
function startSolving() {
    if (solving) return;
    solving = true;
    
    // Reset visited status for the solver, not the generator
    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // Start solving from (1,1)
    solve(1, 1).then(() => {
        solving = false; // Allow re-solving or generating new
    });
}

// Initial maze on load
initMaze();