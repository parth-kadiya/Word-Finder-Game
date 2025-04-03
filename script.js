
function getRandomLetter() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[Math.floor(Math.random() * letters.length)];
}


const words = ["SILDOO", "SILDOOD", "SILDOOM", "SILDOOT"];

const rows = 12;
const cols = 12;
let grid = Array.from({ length: rows }, () => Array(cols).fill(null));
let selectedCells = [];
let selectedWord = "";
let isSelecting = false;
let startRow = null;
let startCol = null;
let direction = null;
let foundWords = new Set();

function placeWord(word, row, col, isVertical = false) {
    if (isVertical) {
        if (row + word.length > rows) return false;
        for (let i = 0; i < word.length; i++) {
            grid[row + i][col] = word[i];
        }
    } else {
        if (col + word.length > cols) return false;
        for (let i = 0; i < word.length; i++) {
            grid[row][col + i] = word[i];
        }
    }
    return true;
}

placeWord("SILDOO", 2, 2); // Horizontal
placeWord("SILDOOD", 4, 1, true); // Vertical
placeWord("SILDOOM", 6, 3); // Horizontal
placeWord("SILDOOT", 3, 10, true); // Vertical (row adjusted to fit the word)

function getRandomLetterExcluding(exclude) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let letter;
    do {
        letter = letters[Math.floor(Math.random() * letters.length)];
    } while (exclude.includes(letter));
    return letter;
}


for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        if (grid[r][c] === null) {
            if (r === 2 && c === 8) {
                // Is cell mein D, M, T nahi aayenge
                grid[r][c] = getRandomLetterExcluding("DMT");
            } else {
                grid[r][c] = getRandomLetter();
            }
        }
    }
}


function generateGrid() {
    const table = document.getElementById("wordGrid");
    console.log("Generating Grid...");
    console.log(grid); 

    grid.forEach((row, rowIndex) => {
        let tr = document.createElement("tr");
        row.forEach((letter, colIndex) => {
            let td = document.createElement("td");
            td.textContent = letter;
            td.dataset.row = rowIndex;
            td.dataset.col = colIndex;

            td.addEventListener("mousedown", startSelection);
            td.addEventListener("mousemove", continueSelection);
            td.addEventListener("mouseup", endSelection);

            td.addEventListener("touchstart", startSelection);
            td.addEventListener("touchmove", continueSelection);
            td.addEventListener("touchend", endSelection);

            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}


function startSelection(event) {
    isSelecting = true;
    clearSelection();

    // Prevent touch scrolling
    if (event.touches) {
        event.preventDefault();
    }

    let cell = event.target || event.touches[0].target;
    startRow = parseInt(cell.dataset.row);
    startCol = parseInt(cell.dataset.col);
    direction = null;
    selectCell(cell);
}


function continueSelection(event) {
    if (!isSelecting) return;

    // Prevent default scrolling behavior
    if (event.touches) {
        event.preventDefault();
    }

    let touch = event.touches ? event.touches[0] : event;
    let target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target && target.tagName === "TD") {
        let row = parseInt(target.dataset.row);
        let col = parseInt(target.dataset.col);

        if (selectedCells.length === 1) {
            if (row === startRow) direction = "horizontal";
            else if (col === startCol) direction = "vertical";
        }
        if (direction === "horizontal" && row !== startRow) return;
        if (direction === "vertical" && col !== startCol) return;

        selectCell(target);
    }
}


function selectCell(cell) {
    if (!cell.classList.contains("selected")) { 
        cell.classList.add("selected");
        selectedCells.push(cell);
        selectedWord += cell.textContent;
    }
}

function endSelection() {
    isSelecting = false;
    
    // Agar selection "SILDOO" hai lekin starting cell longer word ke placement se hai, toh cancel selection
    if (selectedWord === "SILDOO") {
        if (
            (startRow === 4 && startCol === 1 && direction === "vertical") ||
            (startRow === 6 && startCol === 3 && direction === "horizontal") ||
            (startRow === 3 && startCol === 10 && direction === "vertical")
        ) {
            clearSelection();
            selectedCells = [];
            selectedWord = "";
            startRow = null;
            startCol = null;
            direction = null;
            return;  // Selection cancel kar diya
        }
    }
    
    if (words.includes(selectedWord)) {
        selectedCells.forEach(cell => cell.classList.add("correct"));
        document.querySelectorAll("#wordList li").forEach(item => {
            if (item.textContent === selectedWord) {
                item.classList.add("found");
                foundWords.add(selectedWord);
            }
        });
        setTimeout(() => {
            selectedCells.forEach(cell => {
                cell.classList.add("correct"); 
            });
        }, 1000);        
        checkWinCondition();
    } else {
        setTimeout(clearSelection, 500);
    }
    
    selectedCells = [];
    selectedWord = "";
    startRow = null;
    startCol = null;
    direction = null;
}


function clearSelection() {
    document.querySelectorAll("td").forEach(cell => {
        if (!cell.classList.contains("correct")) {
            cell.classList.remove("selected");
        }
    });
}

function checkWinCondition() {
    if (foundWords.size === words.length) {
        document.querySelector(".game-container").style.display = "none";
        document.querySelector(".title").textContent = "CONGRATULATIONS, YOU WIN!";
        showVictoryScreen();
    }
}


function showVictoryScreen() {
    let cheeringAudio = new Audio("cheering.mp3");
    cheeringAudio.play();

    let victoryScreen = document.createElement("div");
    victoryScreen.style.position = "fixed";
    victoryScreen.style.top = "0";
    victoryScreen.style.left = "0";
    victoryScreen.style.width = "100vw";
    victoryScreen.style.height = "100vh";
    victoryScreen.style.backgroundColor = "#fceabb"; 
    victoryScreen.style.display = "flex";
    victoryScreen.style.justifyContent = "center";
    victoryScreen.style.alignItems = "center";
    victoryScreen.style.flexDirection = "column";
    victoryScreen.style.zIndex = "9999";

    let congratsText = document.createElement("h1");
    congratsText.innerText = "CONGRATULATIONS, YOU WIN!";
    congratsText.style.color = "#c8781a";
    congratsText.style.fontSize = "2rem";
    congratsText.style.marginBottom = "20px";

    let victoryImage = document.createElement("img");
    victoryImage.src = "Sildoo.jpg"; 
    victoryImage.style.maxWidth = "70%";  
    victoryImage.style.maxHeight = "60vh"; 
    victoryImage.style.objectFit = "contain";

    // **Back to Home Button**
    let backButton = document.createElement("button");
    backButton.innerText = "← Back to Lobby";
    backButton.style.marginTop = "20px";
    backButton.style.padding = "10px 20px";
    backButton.style.fontSize = "16px";
    backButton.style.backgroundColor = "#c8781a";
    backButton.style.color = "white";
    backButton.style.border = "none";
    backButton.style.borderRadius = "5px";
    backButton.style.cursor = "pointer";
    backButton.style.transition = "all 0.3s ease"; // Smooth transition effect
    
    // **Hover Effect**
    backButton.addEventListener("mouseenter", function () {
        backButton.style.backgroundColor = "#a86618"; // Darker shade
        backButton.style.color = "#f0f0f0"; // Light gray text
        backButton.style.transform = "scale(1.05)"; // Slight zoom effect
    });
    
    backButton.addEventListener("mouseleave", function () {
        backButton.style.backgroundColor = "#c8781a"; // Original color
        backButton.style.color = "white"; // Original text color
        backButton.style.transform = "scale(1)"; // Back to normal size
    });
    
   
    backButton.onclick = function () {
        window.location.href = "https://streamgo.in/FUTURA-MAX-AND-LEMAX-FY26-Strategy-Connect/";
    };
    

    
    victoryScreen.appendChild(congratsText);
    victoryScreen.appendChild(victoryImage);
    victoryScreen.appendChild(backButton);  
    document.body.appendChild(victoryScreen);

    // **Canvas for Fireworks**
    let canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none"; 
    canvas.style.zIndex = "10000";
    document.body.appendChild(canvas);

    let ctx = canvas.getContext("2d");

    // **Fireworks Function**
    triggerFireworks(ctx);
}


function triggerFireworks(ctx) {
    let particles = [];

    function createFirework(x, y) {
        for (let i = 0; i < 80; i++) { 
            particles.push({
                x: x,
                y: y,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * 4 - 2,
                alpha: 1,
                color: `hsl(${Math.random() * 360}, 100%, 60%)`
            });
        }
    }

    function animateFireworks() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
        });

        particles = particles.filter((p) => p.alpha > 0);

        particles.forEach((p) => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;

       
        requestAnimationFrame(animateFireworks);
    }

   
    createFirework(100, 100); 
    createFirework(ctx.canvas.width - 100, 100); 
    createFirework(100, ctx.canvas.height - 100); 
    createFirework(ctx.canvas.width - 100, ctx.canvas.height - 100); 

   
    animateFireworks();
}

window.onload = generateGrid;

let backButton = document.createElement("button");
backButton.innerText = "← Back to Lobby";
backButton.style.marginTop = "20px";
backButton.style.padding = "10px 20px";
backButton.style.fontSize = "16px";
backButton.style.backgroundColor = "#c8781a";
backButton.style.color = "white";
backButton.style.border = "none";
backButton.style.borderRadius = "5px";
backButton.style.cursor = "pointer";

backButton.onclick = function () {
    window.location.href = "https://streamgo.in/FUTURA-MAX-AND-LEMAX-FY26-Strategy-Connect/";
};


victoryScreen.appendChild(victoryImage);
victoryScreen.appendChild(backButton);
