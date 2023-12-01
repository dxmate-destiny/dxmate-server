const functions = require('firebase-functions');
const logger = require("firebase-functions/logger");

const { app } = require('./modules/dxmate-api-manager');
const { checkDxmatePlayerRegistered, registerDxmatePlayer, getDxmatePlayerData, saveUpdatedSkill, saveSinglesUpdatedSkill, saveDoublesUpdatedSkill, addRankedSinglesMatchCount, addRankedDoublesMatchCount, getSinglesTop16Players, getDoublesTop16Players } = require('./modules/realtime-database-manager');
const { calcRankPoints, getRankName, getRankLevel } = require('./modules/rank-manager');
const { searchRoom, createRoom, getRoomData, createTeam, saveReportData, getReportData, deleteRoomData, deleteReportData, checkDxmatePlayerInMatch } = require('./modules/cloud-firestore-manager');
const { updateSinglesSkill, updateDoublesSkill } = require('./modules/openskill-manager');
const { createDoublesConnectCode } = require('./modules/utils');

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

app.post('/players/skill/singles/update', async (req, res) => {
    logger.info('Received /players/skill/singles/update endpoint request.');

    // Get Discord ID and Doubles Skill from reqest.
    const { discordId, skill } = req.body;

    if (!discordId || !skill) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    try {
        // Save Singles updated skill.
        await saveSinglesUpdatedSkill(discordId, skill);
        logger.info('Saved Singles updated skill.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).send('Saved updated singles skill data.');
});

app.post('/players/skill/doubles/update', async (req, res) => {
    logger.info('Received /players/skill/doubles/update endpoint request.');

    // Get Discord ID and Doubles Skill from reqest.
    const { discordId, skill } = req.body;

    if (!discordId || !skill) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    try {
        // Save Doubles updated skill.
        await saveDoublesUpdatedSkill(discordId, skill);
        logger.info('Saved Doubles updated skill');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).send('Saved updated doubles skill data.');
});

app.post('/players/ranked-match-count/singles/add', async (req, res) => {
    logger.info('Received /players/ranked-match-count/singles/add endpoint request.');

    // Get Discord ID from request.
    const { discordId } = req.body;

    if (!discordId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    try {
        // Add Ranked Singles match count.
        await addRankedSinglesMatchCount(discordId);
        logger.info('Added Ranked Singles match count.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).send('Added Ranked Singles match count.');
});

app.post('/players/ranked-match-count/doubles/add', async (req, res) => {
    logger.info('Received /players/ranked-match-count/doubles/add endpoint request.');

    // Get Discord ID from request.
    const { discordId } = req.body;

    if (!discordId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    try {
        // Add Ranked Doubles match count.
        await addRankedDoublesMatchCount(discordId);
        logger.info('Added Ranked Doubles match count.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).send('Added Ranked Doubles match count.');
});

app.get('/players/:discordId/in-match/check', async (req, res) => {
    logger.info('Received /players/:discordId/in-match/check endpoint request.');

    // Get Discord ID.
    const { discordId } = req.params;

    if (!discordId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    let isDxmatePlayerInMatch = false;

    try {
        // Check if a player with specified Discord ID is already in a match.
        isDxmatePlayerInMatch = await checkDxmatePlayerInMatch(discordId);
        logger.info('DXmate player in match:', isDxmatePlayerInMatch);
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }
    
    res.status(200).json(isDxmatePlayerInMatch);
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

app.post('/rooms/search', async (req, res) => {
    logger.info('Received /rooms/search endpoint request.');

    // Get Match Mode, Discord ID, DXmate player data, and Rank Data from request.
    const {
        matchMode,
        discordUserData,
        dxmatePlayerData,
        rankData
    } = req.body;

    if (!matchMode || !discordUserData || !dxmatePlayerData || !rankData) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    let joinedRoomId;

    try {
        // Search room.
        joinedRoomId = await searchRoom(discordUserData, matchMode, dxmatePlayerData, rankData);
        logger.info('Room ID:', joinedRoomId);
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    return res.status(200).json(joinedRoomId);
});

app.post('/rooms', async (req, res) => {
    logger.info('Received /rooms/create endpoint request.');

    // Get Match Mode, Discord ID, DXmate player data, and Rank Data from request.
    const {
        matchMode,
        discordUserData,
        dxmatePlayerData,
        rankData
    } = req.body;

    if (!matchMode || !discordUserData || !dxmatePlayerData || !rankData) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    let joinedRoomId;

    try {
        // Search room.
        joinedRoomId = await createRoom(discordUserData, matchMode, dxmatePlayerData, rankData);
        logger.info('Room ID:', joinedRoomId);
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    return res.status(200).json(joinedRoomId);
});

app.get('/rooms/:roomId', async (req, res) => {
    logger.info('Received /rooms/:roomId endpoint request.');

    // Get Room ID from request.
    const { roomId } = req.params;

    if (!roomId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    let roomData = {};

    try {
        // Get room data.
        roomData = await getRoomData(roomId);
        logger.info('Room Data:', roomData);
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    return res.status(200).json(roomData);
});

app.post('/rooms/team/create', async (req, res) => {
    logger.info('Received /rooms/team/create endpoint request.');

    // Get Players from request.
    const { players } = req.body;

    if (!players) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    // Create team.
    const teamCreatedPlayers = createTeam(players);
    logger.info('Created Team:', teamCreatedPlayers);

    return res.status(200).json(teamCreatedPlayers);
});

app.get('/rooms/team/connect-code/create', (req, res) => {
    logger.info('Received /rooms/team/connect-code/create endpoint request.');

    // Create a new 6 digit connect code.
    const doublesConnectCode = createDoublesConnectCode();
    logger.info('Created Doubles connect code:', doublesConnectCode);

    res.status(200).json(doublesConnectCode);
});

app.post('/rooms/delete', async (req, res) => {
    logger.info('Received /rooms/delete endpoint request.');

    // Get Room ID from request.
    const { roomId } = req.body;

    if (!roomId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    try {
        await deleteRoomData(roomId);
        logger.info('Deleted room data.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).send('Deleted room data.');
});

app.post('/reports', async (req, res) => {
    logger.info('Received /reports endpoint request.');

    // Get Report ID and Report Data from request.
    const { reportId, reportData } = req.body;

    if (!reportId || !reportData) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    try {
        // Save Report Data.
        await saveReportData(reportId, reportData);
        logger.info('Saved Report Data.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).send('Saved Report Data.');
});

app.get('/reports/:reportId', async (req, res) => {
    logger.info('Received /reports/:reportId endpoint request.');

    // Get Report ID from request.
    const { reportId } = req.params;

    if (!reportId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    let reportData = {};

    try {
        // Get Report Data.
        reportData = await getReportData(reportId);
        logger.info('Retrieved Report Data:', reportData);
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).json(reportData);
});

app.post('/reports/delete', async (req, res) => {
    logger.info('Received /reports/delete endpoint request.');

    // Get Room ID from request.
    const { reportId } = req.body;

    if (!reportId) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    try {
        await deleteReportData(reportId)
        logger.info('Deleted report data.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).send('Deleted report data.');
});

app.post('/skill/singles/update', (req, res) => {
    logger.info('Received /skill/singles/update endpoint request.');

    // Get Winner Skill and Loser Skill from request.
    const { winnerSkill, loserSkill } = req.body;

    if (!winnerSkill || !loserSkill) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    const updatedSinglesSkill = updateSinglesSkill(winnerSkill, loserSkill);
    logger.info('Updated Singles Skill:', updatedSinglesSkill);

    res.status(200).json(updatedSinglesSkill);
});

app.post('/skill/doubles/update', (req, res) => {
    logger.info('Received /skill/doubles/update endpoint request.');

    // Get Winner Skills and Loser Skills from request.
    const { winner1Skill, winner2Skill, loser1Skill, loser2Skill } = req.body;

    if (!winner1Skill || !winner2Skill || !loser1Skill || !loser2Skill) {
        logger.error('Required parameters are missing.');
        return res.status(400).send('Required parameters are missing.');
    }

    const updatedDoublesSkill = updateDoublesSkill(winner1Skill, winner2Skill, loser1Skill, loser2Skill);
    logger.info('Updated Doubles Skill:', updatedDoublesSkill);

    res.status(200).json(updatedDoublesSkill);
});

app.get('/leaderboard/singles', async (req, res) => {
    logger.info('Received /leaderboard/singles endpoint request.');

    let singlesTop16Players = [];

    try {
        // Get Singles Top 50 players.
        singlesTop16Players = await getSinglesTop16Players();
        logger.info('Retrieved Singles Top 16 players.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).json(singlesTop16Players);
});

app.get('/leaderboard/doubles', async (req, res) => {
    logger.info('Received /leaderboard/doubles endpoint request.');

    let doublesTop16Players = [];

    try {
        // Get Doubles Top 16 players.
        doublesTop16Players = await getDoublesTop16Players();
        logger.info('Retrieved Doubles Top 16 players.');
    } catch (error) {
        logger.error(error);
        return res.status(500).send(error.message);
    }

    res.status(200).json(doublesTop16Players);
});

// Publish DXmate API.
exports.api = functions.https.onRequest(app);