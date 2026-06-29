const imapService = require('./imapService');

let monitorIntervalId = null;
let isRunning = false;
let isCurrentlyChecking = false;

const state = {
  lastChecked: null,
  totalAutomaticRepliesSent: 0,
  failedReplies: 0
};

const startMonitor = () => {
  if (isRunning) {
    console.log('[AUTO MONITOR] Monitor is already running. Ignoring start request.');
    return;
  }

  const intervalSeconds = parseInt(process.env.EMAIL_CHECK_INTERVAL_SECONDS) || 60;
  
  isRunning = true;
  console.log(`[AUTO MONITOR] Started... Checking inbox every ${intervalSeconds} seconds.`);

  monitorIntervalId = setInterval(async () => {
    if (isCurrentlyChecking) {
      console.log('[AUTO MONITOR] Previous inbox check is still in progress. Skipping this cycle.');
      return;
    }

    isCurrentlyChecking = true;
    state.lastChecked = new Date().toISOString();
    console.log(`[AUTO MONITOR] Checking inbox at ${state.lastChecked}...`);

    try {
      const results = await imapService.fetchAndProcessUnreadEmails();
      if (results) {
        state.totalAutomaticRepliesSent += results.repliesSent;
        state.failedReplies += results.failed;
        console.log(`[AUTO MONITOR] Cycle complete. Found: ${results.totalFound}. Sent: ${results.repliesSent}. Failed: ${results.failed}.`);
      }
    } catch (error) {
      console.error('[AUTO MONITOR] Error during inbox check:', error);
      // Wait for the next cycle
    } finally {
      isCurrentlyChecking = false;
    }

  }, intervalSeconds * 1000);
};

const stopMonitor = () => {
  if (!isRunning) {
    console.log('[AUTO MONITOR] Monitor is already stopped.');
    return;
  }

  clearInterval(monitorIntervalId);
  monitorIntervalId = null;
  isRunning = false;
  console.log('[AUTO MONITOR] Stopped.');
};

const getStatus = () => {
  return {
    isRunning,
    lastChecked: state.lastChecked,
    totalAutomaticRepliesSent: state.totalAutomaticRepliesSent,
    failedReplies: state.failedReplies
  };
};

module.exports = {
  startMonitor,
  stopMonitor,
  getStatus
};
