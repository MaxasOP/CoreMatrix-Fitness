// backend/utils/monitoring.js
// Performance monitoring and error tracking
const monitorPerformance = (operation, duration) => {
  const metric = {
    operation,
    duration_ms: duration,
    timestamp: new Date()
  };

  if (duration > 5000) {
    console.warn(`⚠️ Slow operation: ${operation} took ${duration}ms`);
  }
};

const captureException = (error, context) => {
  console.error(`❌ Error: ${error.message}`, context);
};

const captureMessage = (message, level = 'info') => {
  console.log(`📝 ${level.toUpperCase()}: ${message}`);
};

module.exports = {
  monitorPerformance,
  captureException,
  captureMessage
};
