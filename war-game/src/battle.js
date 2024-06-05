/**
 * Starts a war when called. Checks if both teams are valid (have any members in them),
 * saves the teams so nothing gets erased during the war, disables buttons and starts the war.
 * When the function warLoop returns a team winner, it displays the winner, loads the teams pre-war
 * and reenables button use.
 */
const startWar = async () => {
    if (!gameArea.teamA.troops.length && !gameArea.teamB.troops.length) {
        alert('Unable to start war; both teams are empty');
        return;
    } else if (!gameArea.teamA.troops.length || !gameArea.teamB.troops.length) {
        alert('Unable to start war; one team is empty');
        return;
    }

    const savedTeams = { // save the pre battle state of the teams
        teamA: JSON.parse(JSON.stringify(gameArea.teamA.troops)),
        teamB: JSON.parse(JSON.stringify(gameArea.teamB.troops))
    };

    toggleMenuButtons(true);
    gameArea.statusText.text(`Team ${gameArea.teamA.teamName} vs Team ${gameArea.teamB.teamName}`)
    await delay(2000);

    let teamWinner = await warLoop();
    gameArea.statusText.text(`Team ${teamWinner} won`)
    await delay(3000);

    gameArea.teamA.troops = savedTeams.teamA;
    gameArea.teamB.troops = savedTeams.teamB;
    gameArea.statusText.text("Waiting for war start")
    toggleMenuButtons(false);
}

/**
 * Starts a delay of a few miliseconds
 * @param {Number} ms: The miliseconds to wait (multiply seconds by 1000 to get miliseconds)
 * @returns {Promise} A promise that resolves after the timeout is over 
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Simulates a automatic fight between two inputted fighters. Returns one of the soldiers randomly
 * @param {object} fighterA
 * @param {object} fighterB
 * @returns A random fighter (whoever wins)
 */
const fight = (fighterA, fighterB) => Math.random() > 0.5 ? fighterA : fighterB;

/**
 * Simulates a non automatic fight between two inputted fighters, handles inputs, and returns the result of the fight.
 * The function has handlers for no input pressed, early input and winner handling.
 * @param {object} fighterA The first fighter
 * @param {object} fighterB The second fighter
 * @param {Number} drawTime How long to wait until draw
 * @returns A promise that contains a object representing the result for future handling
 */
const handleDuel = (fighterA, fighterB, drawTime) => {
    return new Promise(resolve => {
        let validPress = false;        
        const inputTimeout = setTimeout(() => { // timeout to handle late inputs
            document.removeEventListener('keydown', handleKeyPress);
            resolve({ result: "noInput" })
        }, 2000 + drawTime);

        const drawTimeout = setTimeout(() => { // timeout to handle draw time, makes input valid
            validPress = true;
            gameArea.statusText.text("Draw!");
        }, drawTime);

        const handleKeyPress = (event) => {
            if (!validPress && (event.key.toUpperCase() === 'A' || event.key.toUpperCase() === 'L')) { // handle all invalid/early presses
                clearTimeout(inputTimeout);
                clearTimeout(drawTimeout);
                document.removeEventListener('keydown', handleKeyPress);
                resolve({ result: "earlyPress", earlyPresser: event.key.toUpperCase() === 'A' ? gameArea.teamA.teamName : gameArea.teamB.teamName })
            }
            if (validPress) {
                switch (event.key.toUpperCase()) {
                    case 'A':
                        clearTimeout(inputTimeout);
                        document.removeEventListener('keydown', handleKeyPress);
                        resolve({ result: "winner", winner: fighterA });
                        break;
                    case 'L':
                        clearTimeout(inputTimeout);
                        document.removeEventListener('keydown', handleKeyPress);
                        resolve({ result: "winner", winner: fighterB });
                        break;
                    default:
                        break;
                }
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    })
};

/**
 * The main game loop. Chooses a random fighter from the two teams, move them to the center and fight until one team is empty
 * If the game is on automatic mode, the fights are handled automatically
 * If the game is not on automatic mode, the fights are handled using the handleDuel function
 * When a fight winner is receieved remove the loser from his team and play a death effect
 * @returns {string} The winning team name
 */
const warLoop = async () => {
    do {
        let fighterA = gameArea.teamA.troops[Math.floor(Math.random() * gameArea.teamA.troops.length)];
        let fighterB = gameArea.teamB.troops[Math.floor(Math.random() * gameArea.teamB.troops.length)];

        if (!fighterA || !fighterB) break;

        fighterAPos = { x: fighterA.x, y: fighterA.y }
        fighterBPos = { x: fighterB.x, y: fighterB.y }

        await Promise.all([moveTo(fighterA, 200, 150), moveTo(fighterB, 280, 150)])

        gameArea.statusText.text(`${fighterA.name} vs ${fighterB.name}`)

        await delay(1000);
        let winner;
        let teamAStrikes = 0;
        let teamBStrikes = 0;
        while (!winner) {
            if (gameArea.isAuto) {
                winner = fight(fighterA, fighterB);
            } else {
                gameArea.statusText.text(`Wait... Team ${gameArea.teamA.teamName}: Press A, Team ${gameArea.teamB.teamName}: Press L`);

                let drawTime = Math.floor((Math.random() * 8 * 1000) + 2000);
                duelResult = await handleDuel(fighterA, fighterB, drawTime);

                switch (duelResult.result) {
                    case 'noInput':
                        gameArea.statusText.text("No one pressed A/L, restarting duel");
                        await delay(2000);
                        continue;
                    case 'earlyPress':
                        duelResult.earlyPresser === gameArea.teamA.teamName ? teamAStrikes++ : teamBStrikes++;
                        if (teamAStrikes === 3 || teamBStrikes === 3) {
                            gameArea.statusText.text(`Strike 3, team ${duelResult.earlyPresser} is out!`);
                            winner = teamAStrikes !== 3 ? fighterA : fighterB
                        } else {
                            let currentPressCount = duelResult.earlyPresser === gameArea.teamA.teamName ? teamAStrikes : teamBStrikes;
                            gameArea.statusText.text(`Team ${duelResult.earlyPresser} pressed too early, they have ${currentPressCount} strikes now`);
                        }
                        await delay(1000);
                        continue;
                    case 'winner':
                        winner = duelResult.winner;
                        break;
                }
            }
        }
        gameArea.statusText.text(`${winner.name} won`);

        const handleCombatOutcome = async (winner, loser, winnerOriginalPosition) => {
            gameArea.deathEffects.push({ x: loser.x, y: loser.y, radius: 8 });
            const loserTeam = loser === fighterA ? gameArea.teamA : gameArea.teamB;
            loserTeam.troops = loserTeam.troops.filter(soldier => soldier !== loser);
            await delay(1000);
            await moveTo(winner, winnerOriginalPosition.x, winnerOriginalPosition.y);
        }

        winner === fighterA ? await handleCombatOutcome(winner, fighterB, fighterAPos) : await handleCombatOutcome(winner, fighterA, fighterBPos);

    } while (gameArea.teamA.troops.length && gameArea.teamB.troops.length);
    return gameArea.teamA.troops.length ? gameArea.teamA.teamName : gameArea.teamB.teamName;
}

/**
 * Moves a soldier object towards a specified location on the game area.
 * @param {Object} soldier - The soldier object
 * @param {number} targetX - The x-coordinate
 * @param {number} targetY - The y-coordinate
 * @returns {Promise} A promise that resolves once the soldier has reached the target location
 */
const moveTo = (soldier, targetX, targetY) => new Promise(resolve => {
    const speed = 2;
    const animateMove = () => {
        let dx = targetX - soldier.x;
        let dy = targetY - soldier.y;
        let distance = Math.sqrt(dx ** 2 + dy ** 2);

        if (distance > speed) {
            soldier.x += dx / distance * speed;
            soldier.y += dy / distance * speed;
            requestAnimationFrame(animateMove);
        } else {
            soldier.x = targetX;
            soldier.y = targetY;
            resolve();
        }
    };
    animateMove();
});
