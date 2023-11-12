const { rating, rate } = require('openskill');

function updateSkill (winnerSkill, loserSkill) {
    const winnerRating = rating({ mu: winnerSkill.mu, sigma: winnerSkill.sigma });
    const loserRating = rating({ mu: loserSkill.mu, sigma: loserSkill.sigma });

    // Update skill.
    const [[w], [l]] = rate([[winnerRating], [loserRating]]);

    return { winner: w, loser: l };
}

module.exports = { updateSkill };