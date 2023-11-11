const { logger } = require('firebase-functions/v1');
const { cf } = require('./firebase-productions-manager');

async function searchRoom (discordId, matchMode, dxmatePlayerData, rankData) {
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
                    discordId,
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

    logger.info('Joined room ID:', joinedRoomId);

    return joinedRoomId;
}

module.exports = { searchRoom };