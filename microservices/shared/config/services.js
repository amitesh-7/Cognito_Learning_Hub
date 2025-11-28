/**
 * Service Discovery Configuration
 * Maps service names to their URLs for inter-service communication
 */

const PORTS = require('./constants').PORTS;

const getServiceUrl = (serviceName) => {
  const host = process.env.NODE_ENV === 'production' 
    ? process.env[`${serviceName.toUpperCase()}_SERVICE_URL`]
    : 'localhost';

  const portMap = {
    'auth': PORTS.AUTH_SERVICE,
    'quiz': PORTS.QUIZ_SERVICE,
    'result': PORTS.RESULT_SERVICE,
    'live': PORTS.LIVE_SERVICE,
    'meeting': PORTS.MEETING_SERVICE,
    'social': PORTS.SOCIAL_SERVICE,
    'gamification': PORTS.GAMIFICATION_SERVICE,
    'moderation': PORTS.MODERATION_SERVICE,
  };

  const port = portMap[serviceName] || 3000;
  return `http://${host}:${port}`;
};

const SERVICES = {
  AUTH: getServiceUrl('auth'),
  QUIZ: getServiceUrl('quiz'),
  RESULT: getServiceUrl('result'),
  LIVE: getServiceUrl('live'),
  MEETING: getServiceUrl('meeting'),
  SOCIAL: getServiceUrl('social'),
  GAMIFICATION: getServiceUrl('gamification'),
  MODERATION: getServiceUrl('moderation'),
};

module.exports = { SERVICES, getServiceUrl };
