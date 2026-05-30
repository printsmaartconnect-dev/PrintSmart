/**
 * Session Service for Shopkeeper Account
 * Tracks active JWT sessions in-memory.
 * Limits concurrent logins to exactly 2 devices/PCs.
 * Automatically invalidates the oldest session (rolling logout) when a 3rd is added.
 */

// Key: shopkeeperId (string), Value: Array of token strings [token1, token2]
const activeSessions = new Map();

/**
 * Register a new JWT token session for a shopkeeper.
 * Caps sessions at a maximum of 2, removing the oldest if necessary.
 * @param {string} shopkeeperId 
 * @param {string} token 
 */
function registerSession(shopkeeperId, token) {
  if (!shopkeeperId || !token) return;

  if (!activeSessions.has(shopkeeperId)) {
    activeSessions.set(shopkeeperId, []);
  }

  const sessions = activeSessions.get(shopkeeperId);

  // If token is already registered, do nothing
  if (sessions.includes(token)) {
    return;
  }

  // Push new session token
  sessions.push(token);
  console.log(`[SessionManager] Registered new session for shopkeeper ${shopkeeperId}. Total active sessions: ${sessions.length}`);

  // Enforce concurrent session limit of 2
  if (sessions.length > 2) {
    const invalidatedToken = sessions.shift();
    console.log(`[SessionManager] Concurrent session limit of 2 exceeded for shopkeeper ${shopkeeperId}. Invalidating oldest session.`);
  }

  activeSessions.set(shopkeeperId, sessions);
}

/**
 * Verify if a JWT session token is still active/valid for the shopkeeper.
 * On-the-fly registers a token if the session list for this shopkeeper is empty
 * to prevent forcing mass logouts of active sessions during backend restarts.
 * @param {string} shopkeeperId 
 * @param {string} token 
 * @returns {boolean}
 */
function isSessionActive(shopkeeperId, token) {
  if (!shopkeeperId || !token) return false;

  // If no sessions are registered in-memory for this shopkeeper (e.g. server restart),
  // register this token on-the-fly to prevent a mass logout.
  if (!activeSessions.has(shopkeeperId) || activeSessions.get(shopkeeperId).length === 0) {
    console.log(`[SessionManager] Server restart/empty session list detected for shopkeeper ${shopkeeperId}. Registering token on-the-fly.`);
    registerSession(shopkeeperId, token);
    return true;
  }

  const sessions = activeSessions.get(shopkeeperId);
  const isActive = sessions.includes(token);
  
  if (!isActive) {
    console.log(`[SessionManager] Access denied for shopkeeper ${shopkeeperId}: Token has been invalidated by rolling logout.`);
  }

  return isActive;
}

/**
 * Manually terminate a specific session token (e.g. on manual logout).
 * @param {string} shopkeeperId 
 * @param {string} token 
 */
function terminateSession(shopkeeperId, token) {
  if (!shopkeeperId || !token) return;

  if (activeSessions.has(shopkeeperId)) {
    let sessions = activeSessions.get(shopkeeperId);
    const initialLength = sessions.length;
    sessions = sessions.filter(t => t !== token);
    activeSessions.set(shopkeeperId, sessions);
    console.log(`[SessionManager] Terminated session for shopkeeper ${shopkeeperId}. Remaining: ${sessions.length}`);
  }
}

module.exports = {
  registerSession,
  isSessionActive,
  terminateSession,
  activeSessions // Export raw map if needed for debug/tests
};
