const { k } = require('../config/rank-config.json');

function calcRankPoints (mu, sigma) {
    const rankPoints = k * (mu - 3 * sigma);

    if (rankPoints < 0) {
        return 0;
    }

    return parseInt(rankPoints);
}

function getRankName (rankPoints) {
    let rankName = 'Bronze';

    if (rankPoints >= 12400) {
        rankName = 'DXMATE 20XX';
    } else if (rankPoints >= 10800) {
        rankName = 'GRAND MASTER';
    } else if (rankPoints >= 10000) {
        rankName = 'MASTER';
    } else if (rankPoints >= 9000) {
        rankName = 'DIAMOND';
    } else if (rankPoints >= 7800) {
        rankName = 'PLATINUM';
    } else if (rankPoints >= 6400) {
        rankName = 'GOLD';
    } else if (rankPoints >= 4600) {
        rankName = 'SILVER';
    }

    return rankName;
}

function getRankLevel (rankPoints) {
    let rankLevel = 0;

    if (rankPoints >= 12400) {
        rankLevel = 7;
    } else if (rankPoints >= 10800) {
        rankLevel = 6;
    } else if (rankPoints >= 10000) {
        rankLevel = 5;
    } else if (rankPoints >= 9000) {
        rankLevel = 4;
    } else if (rankPoints >= 7800) {
        rankLevel = 3;
    } else if (rankPoints >= 6400) {
        rankLevel = 2;
    } else if (rankPoints >= 4600) {
        rankLevel = 1;
    }

    return rankLevel;
}

module.exports = { calcRankPoints, getRankName, getRankLevel };