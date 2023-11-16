const { logger } = require('firebase-functions/v1');
const { rating, rate } = require('openskill');

function updateSinglesSkill (winnerSkill, loserSkill) {
    const winnerRating = rating({ mu: winnerSkill.mu, sigma: winnerSkill.sigma });
    const loserRating = rating({ mu: loserSkill.mu, sigma: loserSkill.sigma });

    // Update skill.
    const [[w], [l]] = rate([[winnerRating], [loserRating]]);

    return { winner: w, loser: l };
}

function updateDoublesSkill (winner1Skill, winner2Skill, loser1Skill, loser2Skill) {
    const winner1Rating = rating({ mu: winner1Skill.mu, sigma: winner1Skill.sigma });
    const winner2Rating = rating({ mu: winner2Skill.mu, sigma: winner2Skill.sigma });
    const loser1Rating = rating({ mu: loser1Skill.mu, sigma: loser1Skill.sigma });
    const loser2Rating = rating({ mu: loser2Skill.mu, sigma: loser2Skill.sigma });

    // Update skill.
    const [[w1, w2], [l1, l2]] = rate([[winner1Rating, winner2Rating], [loser1Rating, loser2Rating]]);

    return { winners: [w1, w2], losers: [l1, l2] };
}

module.exports = { updateSinglesSkill, updateDoublesSkill };