/**
 * Handle the team change name form
 * @param {string} team The team to handle the input 
 */
const handleTeamNameSubmit = (team) => {
    const teamInput = document.getElementById(`${team === 'teamA' ? 'team-a' : 'team-b'}-name`);
    if (teamInput.value === '') {
        alert('Team name is empty');
        return;
    }
    if (teamInput.value.length >= 24) {
        alert('Team name longer than 24 letters')
        return;
    }
    gameArea[team].teamName = teamInput.value;
    gameArea[team].troops.forEach((s, index) => { // change the name for every troop inside the team
        s.name = `${teamInput.value}${index + 1}`
    })
    alert(`${team === 'teamA' ? 'Team A' : 'Team B'}'s name set to ${teamInput.value}`)
    teamInput.value = ''
}

document.getElementById("team-a-form").addEventListener("submit", (event) => { // listeners for team name submit events
    event.preventDefault();
    handleTeamNameSubmit("teamA");
});

document.getElementById("team-b-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleTeamNameSubmit("teamB");
});

/**
 * Sets the team image for a team
 * @param {event} event The image input change event
 * @param {string} team The team to set the image on 
 */
const setTeamImage = (event, team) => {
    let reader = new FileReader(); 
    reader.onload = () => { // when reader loads image set the team image as the loaded image
        gameArea[`team${team.toUpperCase()}`].teamImg = reader.result;
        gameArea[`team${team.toUpperCase()}`].troops.forEach(s => s.troopImg = reader.result);
    };

    if (!event.target.files[0].type.match('image/*')) {
        alert("Please select an image file.");
        return;
    }

    reader.readAsDataURL(event.target.files[0]); // read the data url to add to the team image
};

/**
 * Resets the game and the teams entirely
 */
const resetGame = () => {
    gameArea.teamA.troops = [];
    gameArea.teamB.troops = [];
    gameArea.verticalPosA = gameArea.verticalPosB = 50;
    gameArea.teamA.teamName = 'A'
    gameArea.teamB.teamName = 'B'
    gameArea.teamA.teamImg = ''
    gameArea.teamB.teamImg = ''
    document.getElementById('img-input-team-a').value = ''
    document.getElementById('img-input-team-b').value = ''
}

/**
 * Clears the team image for a defined team
 * @param {string} team The team to clear the image
 */
const clearImage = (team) => {
    document.getElementById(`img-input-team-${team}`).value = ''
    gameArea[`team${team.toUpperCase()}`].teamImg = ''
    gameArea[`team${team.toUpperCase()}`].troops.forEach((soldier) => soldier.troopImg = '')
}

/**
 * Toggle the menu buttons
 * @param {boolean} bool Disable/enable menu buttons 
 */
const toggleMenuButtons = (bool) => {
    $(".menu-button-group button").prop('disabled', bool);
    $(".team-sections button").prop('disabled', bool);
    $(".team-sections input").prop('disabled', bool)
}