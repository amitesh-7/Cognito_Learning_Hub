/**
 * mediasoup Manager
 * Manages routers, transports, producers, and consumers
 */

const mediaServer = require("./mediaServer");
const createLogger = require("../../shared/utils/logger");

const logger = createLogger("mediasoup-manager");

class MediasoupManager {
  constructor() {
    // roomId -> { router, transports, producers, consumers }
    this.rooms = new Map();

    // Global mappings for quick lookup
    this.transports = new Map(); // transportId -> { transport, roomId, peerId }
    this.producers = new Map(); // producerId -> { producer, roomId, peerId, kind }
    this.consumers = new Map(); // consumerId -> { consumer, roomId, peerId }
    this.peers = new Map(); // peerId -> { roomId, transports[], producers[], consumers[] }
  }

  /**
   * Create router for a room
   */
  async createRouter(roomId) {
    try {
      if (this.rooms.has(roomId)) {
        logger.debug(`Router already exists for room ${roomId}`);
        return this.rooms.get(roomId).router;
      }

      const worker = mediaServer.getWorker();
      const config = mediaServer.getConfig();

      const router = await worker.createRouter({
        mediaCodecs: config.router.mediaCodecs,
      });

      // Store room data
      this.rooms.set(roomId, {
        router,
        transports: new Map(),
        producers: new Map(),
        consumers: new Map(),
        peers: new Set(),
      });

      logger.info(`Router created for room ${roomId} [worker:${worker.pid}]`);

      return router;
    } catch (error) {
      logger.error(`Failed to create router for room ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Get router for a room
   */
  getRouter(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.router : null;
  }

  /**
   * Get or create router
   */
  async getOrCreateRouter(roomId) {
    let router = this.getRouter(roomId);
    if (!router) {
      router = await this.createRouter(roomId);
    }
    return router;
  }

  /**
   * Create WebRTC transport
   */
  async createWebRtcTransport(roomId, peerId, direction = "send") {
    try {
      const router = await this.getOrCreateRouter(roomId);
      const config = mediaServer.getConfig();

      const transport = await router.createWebRtcTransport(
        config.webRtcTransport
      );

      // Store transport
      this.transports.set(transport.id, {
        transport,
        roomId,
        peerId,
        direction,
      });

      // Add to room
      const room = this.rooms.get(roomId);
      if (room) {
        room.transports.set(transport.id, transport);
      }

      // Add to peer
      if (!this.peers.has(peerId)) {
        this.peers.set(peerId, {
          roomId,
          transports: [],
          producers: [],
          consumers: [],
        });
      }
      this.peers.get(peerId).transports.push(transport.id);

      logger.info(
        `WebRTC ${direction} transport created [room:${roomId}] [peer:${peerId}] [transport:${transport.id}]`
      );

      // Log ICE candidates for debugging
      logger.info(
        `ICE candidates for transport ${transport.id}:`,
        JSON.stringify(transport.iceCandidates, null, 2)
      );

      return {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      };
    } catch (error) {
      logger.error(
        `Failed to create WebRTC transport [room:${roomId}]:`,
        error
      );
      throw error;
    }
  }

  /**
   * Connect transport with DTLS parameters
   */
  async connectTransport(transportId, dtlsParameters) {
    try {
      const transportData = this.transports.get(transportId);
      if (!transportData) {
        throw new Error(`Transport ${transportId} not found`);
      }

      await transportData.transport.connect({ dtlsParameters });

      logger.debug(
        `Transport connected [transport:${transportId}] [room:${transportData.roomId}]`
      );
    } catch (error) {
      logger.error(`Failed to connect transport ${transportId}:`, error);
      throw error;
    }
  }

  /**
   * Produce media (send to server)
   */
  async produce(transportId, peerId, kind, rtpParameters, appData = {}) {
    try {
      const transportData = this.transports.get(transportId);
      if (!transportData) {
        throw new Error(`Transport ${transportId} not found`);
      }

      const { transport, roomId } = transportData;

      const producer = await transport.produce({
        kind,
        rtpParameters,
        appData: { ...appData, peerId, roomId },
      });

      // Store producer
      this.producers.set(producer.id, {
        producer,
        roomId,
        peerId,
        kind,
      });

      // Add to room
      const room = this.rooms.get(roomId);
      if (room) {
        room.producers.set(producer.id, producer);
      }

      // Add to peer
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.producers.push(producer.id);
      }

      logger.info(
        `Producer created [${kind}] [room:${roomId}] [peer:${peerId}] [producer:${producer.id}]`
      );

      // Handle producer events
      producer.on("transportclose", () => {
        logger.debug(`Producer transport closed [producer:${producer.id}]`);
        this.closeProducer(producer.id);
      });

      producer.on("score", (score) => {
        logger.debug(`Producer score [producer:${producer.id}]:`, score);
      });

      return producer.id;
    } catch (error) {
      logger.error(`Failed to produce [transport:${transportId}]:`, error);
      throw error;
    }
  }

  /**
   * Consume media (receive from server)
   */
  async consume(
    transportId,
    producerId,
    peerId,
    rtpCapabilities,
    appData = {}
  ) {
    try {
      const transportData = this.transports.get(transportId);
      const producerData = this.producers.get(producerId);

      if (!transportData) {
        throw new Error(`Transport ${transportId} not found`);
      }
      if (!producerData) {
        throw new Error(`Producer ${producerId} not found`);
      }

      const { transport, roomId } = transportData;
      const router = this.getRouter(roomId);

      if (!router.canConsume({ producerId, rtpCapabilities })) {
        throw new Error("Cannot consume this producer");
      }

      // Check if producer is paused
      const isProducerPaused = producerData.producer.paused;
      if (isProducerPaused) {
        logger.warn(
          `Producer is PAUSED [producer:${producerId}] - consumer will not receive data until producer resumes`
        );
      }

      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: false,
        appData: { ...appData, peerId, roomId },
      });

      // Store consumer
      this.consumers.set(consumer.id, {
        consumer,
        roomId,
        peerId,
        producerId,
      });

      // Add to room
      const room = this.rooms.get(roomId);
      if (room) {
        room.consumers.set(consumer.id, consumer);
      }

      // Add to peer
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.consumers.push(consumer.id);
      }

      logger.info(
        `Consumer created [${consumer.kind}] [room:${roomId}] [peer:${peerId}] [consumer:${consumer.id}] [producer:${producerId}] [producerPaused:${isProducerPaused}]`
      );

      // Handle consumer events
      consumer.on("transportclose", () => {
        logger.debug(`Consumer transport closed [consumer:${consumer.id}]`);
        this.closeConsumer(consumer.id);
      });

      consumer.on("producerclose", () => {
        logger.debug(
          `Consumer's producer closed [consumer:${consumer.id}] [producer:${producerId}]`
        );
        this.closeConsumer(consumer.id);
      });

      consumer.on("producerpause", () => {
        logger.debug(
          `Consumer's producer paused [consumer:${consumer.id}] [producer:${producerId}]`
        );
      });

      consumer.on("producerresume", () => {
        logger.debug(
          `Consumer's producer resumed [consumer:${consumer.id}] [producer:${producerId}]`
        );
      });

      consumer.on("score", (score) => {
        logger.debug(`Consumer score [consumer:${consumer.id}]:`, score);
      });

      // Ensure consumer starts sending media promptly
      try {
        await consumer.resume();
        consumer.requestKeyFrame();
      } catch (err) {
        logger.warn(
          `Failed to resume/request keyframe for consumer [${consumer.id}]:`,
          err
        );
      }

      return {
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      };
    } catch (error) {
      logger.error(
        `Failed to consume [transport:${transportId}] [producer:${producerId}]:`,
        error
      );
      throw error;
    }
  }

  /**
   * Pause consumer
   */
  async pauseConsumer(consumerId) {
    const consumerData = this.consumers.get(consumerId);
    if (consumerData) {
      await consumerData.consumer.pause();
      logger.debug(`Consumer paused [consumer:${consumerId}]`);
    }
  }

  /**
   * Resume consumer
   */
  async resumeConsumer(consumerId) {
    const consumerData = this.consumers.get(consumerId);
    if (consumerData) {
      await consumerData.consumer.resume();
      logger.debug(`Consumer resumed [consumer:${consumerId}]`);
    }
  }

  /**
   * Close producer
   */
  closeProducer(producerId) {
    const producerData = this.producers.get(producerId);
    if (producerData) {
      producerData.producer.close();
      this.producers.delete(producerId);

      // Remove from room
      const room = this.rooms.get(producerData.roomId);
      if (room) {
        room.producers.delete(producerId);
      }

      // Remove from peer
      const peer = this.peers.get(producerData.peerId);
      if (peer) {
        peer.producers = peer.producers.filter((id) => id !== producerId);
      }

      logger.debug(`Producer closed [producer:${producerId}]`);
    }
  }

  /**
   * Close consumer
   */
  closeConsumer(consumerId) {
    const consumerData = this.consumers.get(consumerId);
    if (consumerData) {
      consumerData.consumer.close();
      this.consumers.delete(consumerId);

      // Remove from room
      const room = this.rooms.get(consumerData.roomId);
      if (room) {
        room.consumers.delete(consumerId);
      }

      // Remove from peer
      const peer = this.peers.get(consumerData.peerId);
      if (peer) {
        peer.consumers = peer.consumers.filter((id) => id !== consumerId);
      }

      logger.debug(`Consumer closed [consumer:${consumerId}]`);
    }
  }

  /**
   * Close all resources for a peer
   */
  closePeer(peerId) {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    logger.info(`Closing peer resources [peer:${peerId}]`);

    // Close all consumers
    for (const consumerId of [...peer.consumers]) {
      this.closeConsumer(consumerId);
    }

    // Close all producers
    for (const producerId of [...peer.producers]) {
      this.closeProducer(producerId);
    }

    // Close all transports
    for (const transportId of [...peer.transports]) {
      const transportData = this.transports.get(transportId);
      if (transportData) {
        transportData.transport.close();
        this.transports.delete(transportId);
      }
    }

    // Remove from room peers
    const room = this.rooms.get(peer.roomId);
    if (room) {
      room.peers.delete(peerId);
    }

    this.peers.delete(peerId);
    logger.info(`Peer closed [peer:${peerId}]`);
  }

  /**
   * Close room and all its resources
   */
  async closeRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    logger.info(`Closing room [room:${roomId}]`);

    // Close all peers in room
    for (const peerId of [...room.peers]) {
      this.closePeer(peerId);
    }

    // Close router
    room.router.close();

    this.rooms.delete(roomId);
    logger.info(`Room closed [room:${roomId}]`);
  }

  /**
   * Get producers in a room (excluding a specific peer)
   */
  getProducersInRoom(roomId, excludePeerId = null) {
    const producers = [];

    for (const [producerId, producerData] of this.producers) {
      if (
        producerData.roomId === roomId &&
        producerData.peerId !== excludePeerId
      ) {
        producers.push({
          producerId,
          peerId: producerData.peerId,
          kind: producerData.kind,
        });
      }
    }

    return producers;
  }

  /**
   * Get room statistics
   */
  getRoomStats(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      roomId,
      peers: room.peers.size,
      transports: room.transports.size,
      producers: room.producers.size,
      consumers: room.consumers.size,
    };
  }

  /**
   * Get all rooms statistics
   */
  getAllStats() {
    const stats = {
      rooms: this.rooms.size,
      transports: this.transports.size,
      producers: this.producers.size,
      consumers: this.consumers.size,
      peers: this.peers.size,
      roomStats: [],
    };

    for (const [roomId] of this.rooms) {
      stats.roomStats.push(this.getRoomStats(roomId));
    }

    return stats;
  }
}

// Export singleton instance
module.exports = new MediasoupManager();
