const prisma = require("../config/db");

/**
 * Session Service for Shopkeeper Account
 * Tracks active JWT sessions in the PostgreSQL database.
 * Limits concurrent logins to exactly 2 devices/PCs.
 * Automatically invalidates the oldest session (rolling logout) when a 3rd is added.
 */

/**
 * Register a new JWT token session for a shopkeeper.
 * Caps sessions at a maximum of 2, removing the oldest if necessary.
 * @param {string} shopkeeperId 
 * @param {string} token 
 */
async function registerSession(shopkeeperId, token) {
  if (!shopkeeperId || !token) return;

  try {
    // Check if session already exists
    const existing = await prisma.userSession.findUnique({
      where: { token }
    });
    if (existing) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Create new session
    await prisma.userSession.create({
      data: {
        shopkeeperId,
        token,
        expiresAt
      }
    });

    // Enforce concurrent session limit of 2
    const activeSessions = await prisma.userSession.findMany({
      where: { shopkeeperId },
      orderBy: { createdAt: 'asc' }
    });

    if (activeSessions.length > 2) {
      const excessCount = activeSessions.length - 2;
      const toDeleteIds = activeSessions.slice(0, excessCount).map(s => s.id);
      await prisma.userSession.deleteMany({
        where: { id: { in: toDeleteIds } }
      });
      console.log(`[SessionManager] Concurrent session limit of 2 exceeded for shopkeeper ${shopkeeperId}. Invalidated oldest ${excessCount} session(s).`);
    }
  } catch (err) {
    console.error("[SessionManager] Failed to register session:", err);
  }
}

/**
 * Verify if a JWT session token is still active/valid for the shopkeeper.
 * On-the-fly registers a token if the session list for this shopkeeper is empty
 * to prevent forcing mass logouts of active sessions during restarts/migrations.
 * @param {string} shopkeeperId 
 * @param {string} token 
 * @returns {Promise<boolean>}
 */
async function isSessionActive(shopkeeperId, token) {
  if (!shopkeeperId || !token) return false;

  try {
    // Clean up expired sessions first to maintain clean database
    const now = new Date();
    await prisma.userSession.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    // Find token session
    const session = await prisma.userSession.findUnique({
      where: { token }
    });

    if (session) {
      return true;
    }

    // On-the-fly recovery logic:
    // If the database has no sessions recorded at all for this shopkeeper,
    // we register the token on-the-fly to prevent a mass logout.
    const activeCount = await prisma.userSession.count({
      where: { shopkeeperId }
    });

    if (activeCount === 0) {
      console.log(`[SessionManager] Database has empty session list for shopkeeper ${shopkeeperId}. Registering token on-the-fly.`);
      await registerSession(shopkeeperId, token);
      return true;
    }

    console.log(`[SessionManager] Access denied for shopkeeper ${shopkeeperId}: Token has been invalidated by rolling logout.`);
    return false;
  } catch (err) {
    console.error("[SessionManager] Failed to verify session:", err);
    return false;
  }
}

/**
 * Manually terminate a specific session token (e.g. on manual logout).
 * @param {string} shopkeeperId 
 * @param {string} token 
 */
async function terminateSession(shopkeeperId, token) {
  if (!shopkeeperId || !token) return;

  try {
    await prisma.userSession.delete({
      where: { token }
    });
    console.log(`[SessionManager] Terminated session for shopkeeper ${shopkeeperId}.`);
  } catch (err) {
    // If session is already deleted, delete call throws P2025 record not found. Ignore it.
    if (err.code !== 'P2025') {
      console.error("[SessionManager] Failed to terminate session:", err);
    }
  }
}

module.exports = {
  registerSession,
  isSessionActive,
  terminateSession
};
