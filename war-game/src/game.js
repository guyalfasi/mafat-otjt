/**
 * Represents the main game area and its properties, including the canvas element, team information, and image cache.
 * It provides methods to start the game loop, clear the canvas, draw soldiers and death effects, and load images into the cache.
 * 
 * @property {HTMLCanvasElement} canvas - The canvas element
 * @property {Object} teamA - Team A and its troops and team image 
 * @property {Object} teamB - Same as above except for team B
 * @property {Array} deathEffects - An array to store death effects to be drawn on the canvas
 * @property {Object} imageCache - A cache to store loaded team images
 * @property {number} verticalPosA - The vertical starting position for team A
 * @property {number} verticalPosB  - The vertical starting position for team B
 * @property {boolean} isAuto - Flag if the game is currently automatic or not
 */
const gameArea = {
    canvas: document.getElementById("canvas"),
    context: this.canvas.getContext("2d"),
    teamA: { teamName: 'A', troops: [], teamImg: '' },
    teamB: { teamName: 'B', troops: [], teamImg: '' },
    deathEffects: [],
    imageCache: {},
    verticalPosA: 50,
    verticalPosB: 50,
    isAuto: false,
    
    /**
     * Initializes the game section (canvas and status) and sets up the animation update interval
     */
    start: function() {
        this.interval = setInterval(updateGameArea, 20);
        this.statusText = $('#status-text')
    },
    /**
     * Clears the game area for refresh
     */
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    /**
     * Draws a soldier on the canvas. If soldier has no related team image, draw him as a red/blue circle based on the team
     * @param {object} soldier The soldier to draw
     */
    drawSoldier: function(soldier) {
        if (soldier.troopImg) {
            if (!this.imageCache[soldier.troopImg]) {
                this.loadImage(soldier.troopImg); // saves new image into the cache
            }
            const img = this.imageCache[soldier.troopImg]; 
            if (img) {
                this.context.drawImage(img, soldier.x - 20, soldier.y - 20, 40, 40); // creates image instead of the red/blue circle if found in cache
            }
        } else {
            this.context.beginPath();
            this.context.arc(soldier.x, soldier.y, 20, 0, 2 * Math.PI);
            this.context.fillStyle = soldier.color;
            this.context.fill();
        }
    },
    drawDeath: function(deathEffect) {
        this.context.beginPath();
        this.context.arc(deathEffect.x, deathEffect.y, deathEffect.radius, 0, 2 * Math.PI);
        this.context.fillStyle = 'red';
        this.context.fill();
    },
    /**
     * Loads a image from the inputted URL and saves it on the cache for future use
     * @param {string} imageUrl URL of the image 
     */
    loadImage: function(imageUrl) {
        if (this.imageCache[imageUrl]) { // if the image already exists within the cache then theres no need to save it
            return;
        }

        let img = new Image();
        img.onload = () => {
            this.imageCache[imageUrl] = img; // saves the image into the cache
        };
        img.src = imageUrl;
    }
};

/**
 * Updates the game canvas area for each object and effect displayed inside
 */
const updateGameArea = () => {
    gameArea.clear();
    gameArea.teamA.troops.forEach(soldier => gameArea.drawSoldier(soldier));
    gameArea.teamB.troops.forEach(soldier => gameArea.drawSoldier(soldier));
    gameArea.deathEffects.forEach(deathEffect => {
        gameArea.drawDeath(deathEffect);
        deathEffect.radius += 2;
        if (deathEffect.radius > 30) {
            gameArea.deathEffects = gameArea.deathEffects.filter(e => e !== deathEffect);
        }
    });
};

/**
 * Creates a new soldier object and adds him to a team defined in the parameter
 * @param {string} team The team to add the soldier on
 */
const addSoldier = (team) => {
    if ((team === 'a' && gameArea.teamA.troops.length >= 5) || (team === 'b' && gameArea.teamB.troops.length >= 5)) {
        alert(`Max number of team members on team ${team} reached`);
        return;
    };
    switch (team) {
        case 'a':
            gameArea.teamA.troops = [...gameArea.teamA.troops, { name: `${gameArea.teamA.teamName}${gameArea.teamA.troops.length + 1}`, color: 'blue', x: 40, y: gameArea.verticalPosA, troopImg: gameArea.teamA.teamImg }]
            gameArea.verticalPosA += 50;
            break;
        case 'b':
            gameArea.teamB.troops = [...gameArea.teamB.troops, { name: `${gameArea.teamB.teamName}${gameArea.teamB.troops.length + 1}`, color: 'red', x: 440, y: gameArea.verticalPosB, troopImg: gameArea.teamB.teamImg }]
            gameArea.verticalPosB += 50;
            break;
        default:
            break;
    }
};

/**
 * Removes a soldier from a team defined in the parameter
 * @param {string} team 
 */
const removeSoldier = (team) => {
    if ((team === 'a' && !gameArea.teamA.troops.length) || (team === 'b' && !gameArea.teamB.troops.length)) {
        alert(`Cannot remove from team ${team}, it has no soldiers`);
        return;
    }
    switch (team) {
        case 'a':
            gameArea.teamA.troops.pop()
            gameArea.verticalPosA -= 50;
            break;
        case 'b':
            gameArea.teamB.troops.pop()
            gameArea.verticalPosB -= 50;
            break;
        default:
            break;
    }
}

/**
 * Toggles automatic mode on the game
 */
const handleAutoToggle = () => {
    gameArea.isAuto = !gameArea.isAuto
    gameArea.isAuto ? $('#auto-status').text('Auto mode: ON') : $('#auto-status').text('Auto mode: OFF')
}