/**
 * mediasoup Client Wrapper
 * Handles SFU WebRTC connection using mediasoup-client
 */

import * as mediasoupClient from "mediasoup-client";

export class MediasoupHandler {
  constructor(socket) {
    this.socket = socket;
    this.device = null;
    this.sendTransport = null;
    this.recvTransport = null;
    this.producers = new Map(); // kind -> producer
    this.consumers = new Map(); // peerId -> Map(kind -> consumer)
    this.roomId = null;

    // Event handlers
    this.onNewConsumer = null;
    this.onConsumerClosed = null;
    this.onError = null;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async init(roomId) {
    this.roomId = roomId;

    // Create device
    this.device = new mediasoupClient.Device();

    // Get router RTP capabilities
    const { rtpCapabilities } = await this.socketRequest(
      "getRouterRtpCapabilities",
      {
        roomId,
      }
    );

    // Load device with router capabilities
    await this.device.load({ routerRtpCapabilities: rtpCapabilities });

    console.log(
      "[mediasoup] Device loaded, RTP capabilities:",
      this.device.rtpCapabilities
    );
  }

  // ============================================
  // TRANSPORT CREATION
  // ============================================

  async createSendTransport() {
    const transportInfo = await this.socketRequest("createWebRtcTransport", {
      roomId: this.roomId,
      direction: "send",
    });

    console.log(
      "[mediasoup] 📡 Send transport ICE candidates from server:",
      transportInfo.iceCandidates
    );

    this.sendTransport = this.device.createSendTransport(transportInfo);

    // Handle transport events
    this.sendTransport.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          await this.socketRequest("connectTransport", {
            transportId: this.sendTransport.id,
            dtlsParameters,
          });
          callback();
        } catch (error) {
          console.error("[mediasoup] Error connecting send transport:", error);
          errback(error);
        }
      }
    );

    this.sendTransport.on(
      "produce",
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          const { id } = await this.socketRequest("produce", {
            transportId: this.sendTransport.id,
            kind,
            rtpParameters,
            appData,
          });
          callback({ id });
        } catch (error) {
          console.error("[mediasoup] Error producing:", error);
          errback(error);
        }
      }
    );

    this.sendTransport.on("connectionstatechange", (state) => {
      console.log(`[mediasoup] 🔌 Send transport CONNECTION STATE: ${state}`);
      if (state === "connected") {
        console.log(
          `[mediasoup] ✅ Send transport CONNECTED - ready to send media`
        );
      } else if (state === "failed" || state === "closed") {
        console.error(`[mediasoup] ❌ Send transport ${state}`);
        this.handleError("Send transport connection failed");
      }
    });

    // Monitor ICE connection state
    this.sendTransport.on("icestatechange", (iceState) => {
      console.log(`[mediasoup] 🧊 Send transport ICE STATE: ${iceState}`);
    });

    // Monitor DTLS state
    this.sendTransport.on("dtlsstatechange", (dtlsState) => {
      console.log(`[mediasoup] 🔐 Send transport DTLS STATE: ${dtlsState}`);
    });

    console.log("[mediasoup] Send transport created:", this.sendTransport.id);
  }

  async createRecvTransport() {
    const transportInfo = await this.socketRequest("createWebRtcTransport", {
      roomId: this.roomId,
      direction: "recv",
    });

    console.log(
      "[mediasoup] 📡 Recv transport ICE candidates from server:",
      transportInfo.iceCandidates
    );

    this.recvTransport = this.device.createRecvTransport(transportInfo);

    // Handle transport events
    this.recvTransport.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          console.log(
            `[mediasoup] 🔗 Recv transport "connect" event fired - initiating DTLS handshake`
          );
          await this.socketRequest("connectTransport", {
            transportId: this.recvTransport.id,
            dtlsParameters,
          });
          console.log(
            `[mediasoup] ✅ Recv transport DTLS handshake completed on server`
          );

          // Call callback to complete the connection
          // ICE/DTLS negotiation continues, connectionstatechange will fire when ready
          callback();
        } catch (error) {
          console.error("[mediasoup] Error connecting recv transport:", error);
          errback(error);
        }
      }
    );

    this.recvTransport.on("connectionstatechange", (state) => {
      console.log(`[mediasoup] 🔌 Recv transport CONNECTION STATE: ${state}`);
      if (state === "connected") {
        console.log(
          `[mediasoup] ✅ Recv transport CONNECTED - ready to receive media`
        );
        // Resolve the ready promise - this is when consumers can truly receive data
        if (this.recvTransportReadyResolver) {
          console.log(
            `[mediasoup] 🎯 Resolving transport ready promise now that connection is established`
          );
          this.recvTransportReadyResolver();
          this.recvTransportReadyResolver = null;
        }
      } else if (state === "failed" || state === "closed") {
        console.error(`[mediasoup] ❌ Recv transport ${state}`);
        this.handleError("Recv transport connection failed");
      }
    });

    // Monitor ICE connection state
    this.recvTransport.on("icestatechange", (iceState) => {
      console.log(`[mediasoup] 🧊 Recv transport ICE STATE: ${iceState}`);
    });

    // Monitor DTLS state
    this.recvTransport.on("dtlsstatechange", (dtlsState) => {
      console.log(`[mediasoup] 🔐 Recv transport DTLS STATE: ${dtlsState}`);
    });

    console.log("[mediasoup] Recv transport created:", this.recvTransport.id);
  }

  // ============================================
  // PRODUCE (Send media)
  // ============================================

  async produceVideo(track) {
    if (!this.sendTransport) {
      await this.createSendTransport();
    }

    const producer = await this.sendTransport.produce({
      track,
      encodings: [
        { maxBitrate: 100000 },
        { maxBitrate: 300000 },
        { maxBitrate: 900000 },
      ],
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
      appData: { source: "webcam" },
    });

    this.producers.set("video", producer);

    producer.on("trackended", () => {
      console.log("[mediasoup] Video track ended");
      this.closeProducer("video");
    });

    producer.on("transportclose", () => {
      console.log("[mediasoup] Video transport closed");
      this.producers.delete("video");
    });

    console.log("[mediasoup] Video producer created:", producer.id);
    return producer;
  }

  async produceAudio(track) {
    if (!this.sendTransport) {
      await this.createSendTransport();
    }

    const producer = await this.sendTransport.produce({
      track,
      appData: { source: "microphone" },
    });

    this.producers.set("audio", producer);

    producer.on("trackended", () => {
      console.log("[mediasoup] Audio track ended");
      this.closeProducer("audio");
    });

    producer.on("transportclose", () => {
      console.log("[mediasoup] Audio transport closed");
      this.producers.delete("audio");
    });

    console.log("[mediasoup] Audio producer created:", producer.id);
    return producer;
  }

  async produceScreen(track) {
    if (!this.sendTransport) {
      await this.createSendTransport();
    }

    const producer = await this.sendTransport.produce({
      track,
      encodings: [{ maxBitrate: 1500000 }],
      appData: { source: "screen" },
    });

    this.producers.set("screen", producer);

    producer.on("trackended", () => {
      console.log("[mediasoup] Screen track ended");
      this.closeProducer("screen");
    });

    producer.on("transportclose", () => {
      console.log("[mediasoup] Screen transport closed");
      this.producers.delete("screen");
    });

    console.log("[mediasoup] Screen producer created:", producer.id);
    return producer;
  }

  // ============================================
  // CONSUME (Receive media)
  // ============================================

  async consume(producerId, peerId, kind) {
    if (!this.recvTransport) {
      await this.createRecvTransport();
    }

    const consumerInfo = await this.socketRequest("consume", {
      transportId: this.recvTransport.id,
      producerId,
      rtpCapabilities: this.device.rtpCapabilities,
    });

    const consumer = await this.recvTransport.consume({
      id: consumerInfo.id,
      producerId: consumerInfo.producerId,
      kind: consumerInfo.kind,
      rtpParameters: consumerInfo.rtpParameters,
      appData: { peerId, kind },
    });

    // Store consumer by peer and kind with producer mapping for re-consume
    if (!this.consumers.has(peerId)) {
      this.consumers.set(peerId, new Map());
    }
    this.consumers.get(peerId).set(kind, {
      consumer,
      producerId: consumerInfo.producerId,
      recovering: false,
      recoveryAttempts: 0,
    });

    consumer.on("transportclose", () => {
      console.log(
        `[mediasoup] Consumer transport closed [${kind}] [peer:${peerId}]`
      );
      this.removeConsumer(peerId, kind);
    });

    // CRITICAL: Resume the consumer to start receiving media
    // mediasoup-client creates consumers in paused state by default
    // The transport connection (ICE/DTLS) happens automatically in the background
    // RTP packets will start flowing once the connection completes

    console.log(
      `[mediasoup] 📊 Resuming consumer [${kind}], transport connectionState: ${this.recvTransport.connectionState}`
    );

    await consumer.resume();
    console.log(`[mediasoup] ✅ Consumer resumed [${kind}] [peer:${peerId}]`);

    // Log track state after resume
    console.log(
      `[mediasoup] Consumer track after resume [${kind}] [peer:${peerId}]:`,
      {
        readyState: consumer.track.readyState,
        muted: consumer.track.muted,
        enabled: consumer.track.enabled,
        id: consumer.track.id,
      }
    );

    // Listen for when track becomes unmuted (starts receiving data)
    consumer.track.onunmute = () => {
      console.log(
        `[mediasoup] ✅ Track UNMUTED [${kind}] [peer:${peerId}] - data is flowing!`
      );
      // Log video settings when data starts flowing
      if (kind === "video") {
        const settings = consumer.track.getSettings();
        console.log(
          `[mediasoup] Video track settings [peer:${peerId}]:`,
          settings
        );
        // Request a keyframe to speed up first render
        try {
          if (typeof consumer.requestKeyFrame === "function") {
            consumer.requestKeyFrame();
          }
        } catch (_) {}
      }
    };

    consumer.track.onmute = () => {
      console.log(
        `[mediasoup] ⚠️ Track MUTED [${kind}] [peer:${peerId}] - no data`
      );
      // Try to recover by requesting a keyframe and resuming the consumer
      if (kind === "video") {
        try {
          if (typeof consumer.requestKeyFrame === "function") {
            consumer.requestKeyFrame();
          }
          if (typeof consumer.resume === "function") {
            const maybePromise = consumer.resume();
            if (maybePromise && typeof maybePromise.catch === "function") {
              maybePromise.catch(() => {});
            }
          }
          console.log(
            `[mediasoup] 🔄 Attempted recovery for muted video track [peer:${peerId}]`
          );
        } catch (err) {
          console.warn(
            `[mediasoup] ⚠️ Failed to recover muted video track [peer:${peerId}]:`,
            err?.message || err
          );
        }

        // If still muted after a short delay, force re-consume the producer (max 2 attempts)
        setTimeout(() => {
          const peerConsumers = this.consumers.get(peerId);
          const entry = peerConsumers?.get(kind);
          if (!entry || entry.consumer !== consumer) return;
          if (entry.recovering) return;
          if (entry.recoveryAttempts >= 2) {
            console.warn(
              `[mediasoup] ⚠️ Max recovery attempts reached for [${kind}] [peer:${peerId}] - ICE/network issue likely`
            );
            return;
          }
          entry.recovering = true;
          entry.recoveryAttempts++;
          // Attempt re-consume with cached producerId
          this.reconsumePeerTrack(peerId, kind)
            .catch((err) =>
              console.warn(
                `[mediasoup] ⚠️ Re-consume failed for muted track [${kind}] [peer:${peerId}]:`,
                err?.message || err
              )
            )
            .finally(() => {
              const current = this.consumers.get(peerId)?.get(kind);
              if (current) current.recovering = false;
            });
        }, 500);
      }
    };

    consumer.track.onended = () => {
      console.log(`[mediasoup] ⚠️ Track ENDED [${kind}] [peer:${peerId}]`);
    };

    // Ensure track is enabled
    if (!consumer.track.enabled) {
      console.log(
        `[mediasoup] ⚠️ Track was disabled, enabling it [${kind}] [peer:${peerId}]`
      );
      consumer.track.enabled = true;
    }

    console.log(
      `[mediasoup] Consumer created [${kind}] [peer:${peerId}] [consumer:${consumer.id}]`
    );

    // Notify UI
    if (this.onNewConsumer) {
      this.onNewConsumer(peerId, kind, consumer.track);
    }

    return consumer;
  }

  // ============================================
  // PAUSE/RESUME
  // ============================================

  async pauseProducer(kind) {
    const producer = this.producers.get(kind);
    if (producer && !producer.paused) {
      producer.pause();
      console.log(`[mediasoup] Producer paused [${kind}]`);
    }
  }

  async resumeProducer(kind) {
    const producer = this.producers.get(kind);
    if (producer && producer.paused) {
      producer.resume();
      console.log(`[mediasoup] Producer resumed [${kind}]`);
    }
  }

  async pauseConsumer(peerId, kind) {
    const peerConsumers = this.consumers.get(peerId);
    if (!peerConsumers) return;

    const consumer = peerConsumers.get(kind);
    if (consumer) {
      await this.socketRequest("pauseConsumer", { consumerId: consumer.id });
      consumer.pause();
      console.log(`[mediasoup] Consumer paused [${kind}] [peer:${peerId}]`);
    }
  }

  async resumeConsumer(peerId, kind) {
    const peerConsumers = this.consumers.get(peerId);
    if (!peerConsumers) return;

    const consumer = peerConsumers.get(kind);
    if (consumer) {
      await this.socketRequest("resumeConsumer", { consumerId: consumer.id });
      consumer.resume();
      console.log(`[mediasoup] Consumer resumed [${kind}] [peer:${peerId}]`);
    }
  }

  // ============================================
  // CLOSE
  // ============================================

  async reconsumePeerTrack(peerId, kind) {
    const peerConsumers = this.consumers.get(peerId);
    const entry = peerConsumers?.get(kind);
    const producerId = entry?.producerId;
    if (!producerId) return;

    // Close existing consumer and notify UI so track is cleared
    if (entry.consumer) {
      entry.consumer.close();
      if (this.onConsumerClosed) {
        this.onConsumerClosed(peerId, kind);
      }
      peerConsumers.delete(kind);
    }

    // Re-consume the producer
    await this.consume(producerId, peerId, kind);
  }

  closeProducer(kind) {
    const producer = this.producers.get(kind);
    if (producer) {
      producer.close();
      this.producers.delete(kind);
      console.log(`[mediasoup] Producer closed [${kind}]`);
    }
  }

  removeConsumer(peerId, kind) {
    const peerConsumers = this.consumers.get(peerId);
    if (!peerConsumers) return;

    const entry = peerConsumers.get(kind);
    if (entry?.consumer) {
      entry.consumer.close();
      peerConsumers.delete(kind);
      console.log(`[mediasoup] Consumer closed [${kind}] [peer:${peerId}]`);

      // Notify UI
      if (this.onConsumerClosed) {
        this.onConsumerClosed(peerId, kind);
      }

      // Clean up empty peer map
      if (peerConsumers.size === 0) {
        this.consumers.delete(peerId);
      }
    }
  }

  removePeer(peerId) {
    const peerConsumers = this.consumers.get(peerId);
    if (peerConsumers) {
      peerConsumers.forEach((entry, kind) => {
        entry.consumer?.close();
        console.log(`[mediasoup] Consumer closed [${kind}] [peer:${peerId}]`);
      });
      this.consumers.delete(peerId);
    }
  }

  close() {
    // Close all producers
    this.producers.forEach((producer, kind) => {
      producer.close();
      console.log(`[mediasoup] Producer closed [${kind}]`);
    });
    this.producers.clear();

    // Close all consumers
    this.consumers.forEach((peerConsumers, peerId) => {
      peerConsumers.forEach((entry, kind) => {
        entry.consumer?.close();
        console.log(`[mediasoup] Consumer closed [${kind}] [peer:${peerId}]`);
      });
    });
    this.consumers.clear();

    // Close transports
    if (this.sendTransport) {
      this.sendTransport.close();
      this.sendTransport = null;
      console.log("[mediasoup] Send transport closed");
    }

    if (this.recvTransport) {
      this.recvTransport.close();
      this.recvTransport = null;
      console.log("[mediasoup] Recv transport closed");
    }

    console.log("[mediasoup] Handler closed");
  }

  // ============================================
  // HELPERS
  // ============================================

  socketRequest(event, data) {
    return new Promise((resolve, reject) => {
      this.socket.emit(event, data, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || "Socket request failed"));
        }
      });
    });
  }

  handleError(error) {
    console.error("[mediasoup] Error:", error);
    if (this.onError) {
      this.onError(error);
    }
  }

  // ============================================
  // GETTERS
  // ============================================

  getProducer(kind) {
    return this.producers.get(kind);
  }

  getConsumers(peerId) {
    return this.consumers.get(peerId);
  }

  getAllConsumers() {
    return this.consumers;
  }

  isProducing(kind) {
    return this.producers.has(kind) && !this.producers.get(kind).closed;
  }

  canProduce(kind) {
    return this.device && this.device.canProduce(kind);
  }
}

export default MediasoupHandler;
