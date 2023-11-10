const functions = require('firebase-functions');
const logger = require("firebase-functions/logger");

const { app } = require('./modules/dxmate-api-manager');
const { checkDxmatePlayerRegistered } = require('./modules/realtime-database-manager');

app.get('/players/:discordId/check', async (req, res) => {
    logger.info('Received /players/:discordId/exists endpoint request.');

    // Get Discord ID from request.
    const { discordId } = req.params;
    logger.info('Discord ID:', discordId);

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

// Publish DXmate API.
exports.api = functions.https.onRequest(app);