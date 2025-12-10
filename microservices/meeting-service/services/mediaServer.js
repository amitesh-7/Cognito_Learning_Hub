/**
 * mediasoup Media Server
 * Creates and manages mediasoup workers (one per CPU core)
 */

const mediasoup = require("mediasoup");
const os = require("os");
const createLogger = require("../../shared/utils/logger");

const logger = createLogger("media-server");

class MediaServer {
  constructor() {
    this.workers = [];
    this.nextWorkerIdx = 0;
    this.config = {
      // Worker settings
      worker: {
        rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT) || 10000,
        rtcMaxPort: parseInt(process.env.MEDIASOUP_MAX_PORT) || 10100,
        logLevel: process.env.MEDIASOUP_LOG_LEVEL || "warn",
        logTags: [
          "info",
          "ice",
          "dtls",
          "rtp",
          "srtp",
          "rtcp",
          "rtx",
          "bwe",
          "score",
          "simulcast",
          "svc",
          "sctp",
        ],
      },

      // Router settings
      router: {
        mediaCodecs: [
          {
            kind: "audio",
            mimeType: "audio/opus",
            clockRate: 48000,
            channels: 2,
          },
          {
            kind: "video",
            mimeType: "video/VP8",
            clockRate: 90000,
            parameters: {
              "x-google-start-bitrate": 1000,
            },
          },
          {
            kind: "video",
            mimeType: "video/VP9",
            clockRate: 90000,
            parameters: {
              "profile-id": 2,
              "x-google-start-bitrate": 1000,
            },
          },
          {
            kind: "video",
            mimeType: "video/h264",
            clockRate: 90000,
            parameters: {
              "packetization-mode": 1,
              "profile-level-id": "4d0032",
              "level-asymmetry-allowed": 1,
              "x-google-start-bitrate": 1000,
            },
          },
          {
            kind: "video",
            mimeType: "video/h264",
            clockRate: 90000,
            parameters: {
              "packetization-mode": 1,
              "profile-level-id": "42e01f",
              "level-asymmetry-allowed": 1,
              "x-google-start-bitrate": 1000,
            },
          },
        ],
      },

      // WebRTC transport settings
      webRtcTransport: {
        listenIps: [
          {
            ip: "0.0.0.0",
            // For local dev use 127.0.0.1; for production set MEDIASOUP_ANNOUNCED_IP
            announcedIp:
              process.env.MEDIASOUP_ANNOUNCED_IP ||
              process.env.SERVER_IP ||
              "127.0.0.1",
          },
        ],
        initialAvailableOutgoingBitrate: 1000000,
        minimumAvailableOutgoingBitrate: 600000,
        maxSctpMessageSize: 262144,
        maxIncomingBitrate: 1500000,
      },
    };
  }

  /**
   * Initialize mediasoup workers
   */
  async init() {
    try {
      const numWorkers =
        parseInt(process.env.MEDIASOUP_WORKERS) || os.cpus().length;

      logger.info(`Creating ${numWorkers} mediasoup workers...`);

      for (let i = 0; i < numWorkers; i++) {
        const worker = await mediasoup.createWorker({
          logLevel: this.config.worker.logLevel,
          logTags: this.config.worker.logTags,
          rtcMinPort: this.config.worker.rtcMinPort,
          rtcMaxPort: this.config.worker.rtcMaxPort,
        });

        worker.on("died", (error) => {
          logger.error(
            `mediasoup worker[${worker.pid}] died, exiting in 2 seconds...`,
            error
          );
          setTimeout(() => process.exit(1), 2000);
        });

        this.workers.push(worker);

        logger.info(
          `mediasoup worker[${i}] created [pid:${worker.pid}] [ports:${this.config.worker.rtcMinPort}-${this.config.worker.rtcMaxPort}]`
        );
      }

      logger.info(
        `✅ mediasoup initialized with ${this.workers.length} workers`
      );
      logger.info(
        `Announced IP: ${
          this.config.webRtcTransport.listenIps[0].announcedIp || "localhost"
        }`
      );
    } catch (error) {
      logger.error("Failed to initialize mediasoup:", error);
      throw error;
    }
  }

  /**
   * Get next available worker (round-robin)
   */
  getWorker() {
    const worker = this.workers[this.nextWorkerIdx];

    if (++this.nextWorkerIdx === this.workers.length) {
      this.nextWorkerIdx = 0;
    }

    return worker;
  }

  /**
   * Get worker by index
   */
  getWorkerByIndex(index) {
    return this.workers[index % this.workers.length];
  }

  /**
   * Get all workers
   */
  getWorkers() {
    return this.workers;
  }

  /**
   * Get configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get resource usage stats
   */
  async getStats() {
    const cpus = os.cpus().length;

    const stats = {
      workers: this.workers.length,
      cpus: cpus,
      workerStats: [],
    };

    for (let i = 0; i < this.workers.length; i++) {
      const worker = this.workers[i];
      const usage = await worker.getResourceUsage();

      stats.workerStats.push({
        pid: worker.pid,
        index: i,
        ...usage,
      });
    }

    return stats;
  }

  /**
   * Shutdown all workers
   */
  async close() {
    logger.info("Closing mediasoup workers...");

    for (const worker of this.workers) {
      worker.close();
    }

    this.workers = [];
    logger.info("All mediasoup workers closed");
  }
}

// Export singleton instance
module.exports = new MediaServer();
