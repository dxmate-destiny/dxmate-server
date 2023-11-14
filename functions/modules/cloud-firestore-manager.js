const { logger } = require('firebase-functions/v1');
const { cf } = require('./firebase-productions-manager');
const { shuffleArray } = require('./utils');

async function searchRoom (discordUserData, matchMode, dxmatePlayerData, rankData) {
    const joinedRoomId = await cf.runTransaction(async (transaction) => {
        // Get rooms reference.
        const roomsRef = cf.collection('rooms');

        // Create rooms query.
        const roomsQuery = roomsRef
        .where('matchMode', '==', matchMode)
        .where('region', '==', dxmatePlayerData.region);

        // Get rooms snapshot.
        const roomsSnapshot = await transaction.get(roomsQuery);

        if (roomsSnapshot.empty) {
            return null;
        }

        // Get max player count.
        const maxPlayerCount = matchMode.includes('singles') ? 2 : 4;
        logger.info('[Cloud Firestore Manager] Max player count:', maxPlayerCount);

        // Filter room by players length.
        const filteredRooms = roomsSnapshot.docs.filter(doc => {
            // Get players field.
            const players = doc.data().players;

            return players.length < maxPlayerCount;
        });

        logger.info('[CLOUD FIRESTORE MANAGER] Filtered Rooms Length:', filteredRooms.length);

        if (filteredRooms.length === 0) {
            return null;
        }

        const rankLevelDiffs = [0, 1, 2];

        // Get player's Rank Level.
        const playerRankLevel = rankData.level;
        logger.info('[CLOUD FIRESTORE MANAGER] Player Rank Level:', playerRankLevel);

        for (const rankLevelDiff of rankLevelDiffs) {
            logger.info('[CLOUD FIRESTORE MANAGER] Rank Level Diff:', rankLevelDiff);

            const qualifiedRooms = filteredRooms.filter((doc) => {
                // Get room's Rank Level.
                const roomRankLevel = doc.data().rankLevel;
                logger.info('[CLOUD FIRESTORE MANAGER] Room Rank Level:', roomRankLevel);

                return roomRankLevel <= playerRankLevel + rankLevelDiff && playerRankLevel - rankLevelDiff <= roomRankLevel;
            });

            logger.info('[CLOUD FIRESTORE MANAGER] Qualified Rooms Length:', qualifiedRooms.length);

            if (qualifiedRooms.length > 0) {
                logger.info('[CLOUD FIRESTORE MANAGER] Qualified rooms found.');

                // Get random index.
                const randomIndex = Math.floor(Math.random() * qualifiedRooms.length);

                // Select a room.
                const qualifiedRoom = qualifiedRooms[randomIndex];
                logger.info('[CLOUD FIRESTORE MANAGER] Selected Room ID:', qualifiedRoom.id);

                // Get room's players field.
                const roomPlayers = qualifiedRoom.data().players;

                // Add player data.
                roomPlayers.push({
                    discordUserData,
                    dxmatePlayerData,
                    rankData
                });

                // Join room.
                await transaction.update(qualifiedRoom.ref, { players: roomPlayers });
                logger.info('[CLOUD FIRESTORE MANAGER] Joined room.');

                return qualifiedRoom.id;
            }
        }

        return null;
    });

    return joinedRoomId;
}

async function createRoom (discordUserData, matchMode, dxmatePlayerData, rankData) {
    const joinedRoomId = await cf.runTransaction(async (transaction) => {
        // Get room reference.
        const roomRef = cf.collection('rooms').doc();

        // Create room.
        transaction.set(roomRef, {
            matchMode,
            region: dxmatePlayerData.region,
            rankLevel: rankData.level,
            players: [{
                discordUserData,
                dxmatePlayerData,
                rankData
            }]
        });
        
        logger.info('[CLOUD FIRESTORE MANAGER] Created room.');

        return roomRef.id;
    });

    return joinedRoomId;
}

async function getRoomData (roomId) {
    const roomData = await cf.runTransaction(async (transaction) => {
        // Get room reference.
        const roomRef = cf.collection('rooms').doc(roomId);

        // Get room snapshot.
        const roomSnapshot = await transaction.get(roomRef);

        return roomSnapshot.data();
    });

    return roomData;
}

function createTeam (players) {
    logger.info('Before shuffle players:', players);

    // Shuffle players array.
    shuffleArray(players);
    logger.info('After shuffle players:', players);

    // Divide into teams.
    const redTeam = players.slice(0, 2);
    const blueTeam = players.slice(2, 4);

    redTeam.forEach(player => {
        player.team = 'red';
    });

    blueTeam.forEach(player => {
        player.team = 'blue';
    });

    return players;
}

async function saveReportData (reportId, reportData) {
    await cf.runTransaction(async (transaction) => {
        // Get report reference.
        const reportRef = cf.collection('reports').doc(reportId);

        // Save Report Data.
        transaction.set(reportRef, reportData);
    });
}

async function getReportData (reportId) {
    const reportData = await cf.runTransaction(async (transaction) => {
        // Get report reference.
        const reportRef = cf.collection('reports').doc(reportId);

        // Get report data snapshot.
        const reportSnapshot = await transaction.get(reportRef);

        return reportSnapshot.data();
    });

    return reportData;
}

module.exports = { searchRoom, createRoom, getRoomData, createTeam, saveReportData, getReportData };