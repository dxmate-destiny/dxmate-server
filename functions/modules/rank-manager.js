const { k } = require('../config/rank-config.json');

function calcRankPoints (mu, sigma) {
    const rankPoints = k * (mu - 3 * sigma);

    if (rankPoints < 0) {
        return 0;
    }

    return parseInt(rankPoints);
}

module.exports = { calcRankPoints };