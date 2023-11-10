const functions = require('firebase-functions');
const logger = require("firebase-functions/logger");

const { app } = require('./modules/dxmate-api-manager');
const { checkDxmatePlayerRegistered, registerDxmatePlayer, getDxmatePlayerData } = require('./modules/realtime-database-manager');
const { calcRankPoints, getRankName, getRankLevel } = require('./modules/rank-manager');

app.get('/players/:discordId/check', async (req, res) => {
    logger.info('Received /players/:discordId/exists endpoint request.');

    // Get Discord ID from request.
    const { discordId } = req.params;

    if (!discordId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    let dxmatePlayerRegistered = false;

    try {
        // Check if the DXmate player is registered.
        dxmatePlayerRegistered = await checkDxmatePlayerRegistered(discordId);
        logger.info('Registered:', dxmatePlayerRegistered);
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).json(dxmatePlayerRegistered);
});

app.post('/players', async (req, res) => {
    logger.info('Received /players endpoint request.');

    // Get Discord ID from request.
    const { discordId, slippiConnectCode, region } = req.body;

    if (!discordId || !slippiConnectCode || !region) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    try {
        // Register a new DXmate player.
        await registerDxmatePlayer(discordId, slippiConnectCode, region);
        logger.info('Registered a new DXmate player.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).send('Registered a new DXmate player.');
});

app.get('/players/:discordId', async (req, res) => {
    logger.info('Received /players/:discordId endpoint request.');

    // Get Discord ID from request.
    const { discordId } = req.params;

    if (!discordId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    let dxmatePlayerData = {};

    try {
        // Get DXmate player data.
        dxmatePlayerData = await getDxmatePlayerData(discordId);
        logger.info('Retrieved DXmate player data:', dxmatePlayerData);
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).json(dxmatePlayerData);
});

app.get('/rank', (req, res) => {
    logger.info('Received /rank endpoint request.');

    // Get mu and sigma from request.
    const { mu, sigma } = req.query;

    if (!mu || !sigma) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    let rankData = {
        points: 0,
        name: 'BRONZE',
        level: 0
    };

    // Calculate Rank Points.
    rankData.points = calcRankPoints(mu, sigma);
    logger.info('Calculated Rank Points:', rankData.points);

    // Get Rank Name.
    rankData.name = getRankName(rankData.points);
    logger.info('Retrieed Rank Name:', rankData.name);

    // Get Rank Level.
    rankData.level = getRankLevel(rankData.points);
    logger.info('Retrieved Rank Level:', rankData.level);

    res.status(200).json(rankData);
});

// Publish DXmate API.
exports.api = functions.https.onRequest(app);