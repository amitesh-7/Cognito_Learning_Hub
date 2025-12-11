/**
 * MediaSoup Video Transfer Diagnostic Script
 * Tests if MediaSoup workers are running and WebRTC transports are configured correctly
 */

require("dotenv").config();
const mediaServer = require("./services/mediaServer");

async function testMediaSoup() {
  console.log("\n🔍 MediaSoup Diagnostic Test\n");
  console.log("=".repeat(50));

  // Check environment variables
  console.log("\n📋 Environment Configuration:");
  console.log(
    `  MEDIASOUP_MIN_PORT: ${
      process.env.MEDIASOUP_MIN_PORT || "NOT SET (using default 10000)"
    }`
  );
  console.log(
    `  MEDIASOUP_MAX_PORT: ${
      process.env.MEDIASOUP_MAX_PORT || "NOT SET (using default 10100)"
    }`
  );
  console.log(
    `  MEDIASOUP_ANNOUNCED_IP: ${
      process.env.MEDIASOUP_ANNOUNCED_IP || "NOT SET (using 127.0.0.1)"
    }`
  );
  console.log(
    `  MEDIASOUP_WORKERS: ${
      process.env.MEDIASOUP_WORKERS || "NOT SET (auto-detect)"
    }`
  );
  console.log(
    `  SFU_MODE_ENABLED: ${process.env.SFU_MODE_ENABLED || "NOT SET"}`
  );

  try {
    // Initialize MediaSoup
    console.log("\n🚀 Initializing MediaSoup workers...");
    await mediaServer.init();

    const stats = mediaServer.getStats();
    console.log("\n✅ MediaSoup initialized successfully!");
    console.log(`  Workers: ${stats.workers}`);
    console.log(`  CPUs: ${stats.cpus}`);
    console.log(`  Router count: ${stats.routers}`);

    // Test router creation
    console.log("\n🧪 Testing router creation...");
    const router = await mediaServer.getRouter("test-room");
    console.log(`✅ Router created for room 'test-room'`);
    console.log(`  Router ID: ${router.id}`);
    console.log(
      `  Codecs: ${router.rtpCapabilities.codecs.length} codecs available`
    );

    // Test transport creation
    console.log("\n🧪 Testing WebRTC transport creation...");
    const transportOptions = await mediaServer.createWebRtcTransport(router);
    console.log("✅ WebRTC transport configuration created");
    console.log(`  Transport ID: ${transportOptions.id}`);
    console.log(`  ICE Candidates: ${transportOptions.iceCandidates.length}`);
    console.log(
      `  DTLS Parameters: ${JSON.stringify(
        transportOptions.dtlsParameters.fingerprints[0]
      )}`
    );

    // Show ICE candidates details
    console.log("\n📡 ICE Candidates:");
    transportOptions.iceCandidates.forEach((candidate, idx) => {
      console.log(
        `  [${idx}] ${candidate.protocol}://${candidate.ip}:${candidate.port} (priority: ${candidate.priority})`
      );
    });

    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests passed! MediaSoup is working correctly.");
    console.log("\n💡 If video is still not working, check:");
    console.log("   1. Browser console for MediaSoup client errors");
    console.log("   2. Network connectivity between clients and server");
    console.log("   3. Firewall rules for ports 10000-10100 (UDP/TCP)");
    console.log("   4. MEDIASOUP_ANNOUNCED_IP matches your server IP");
    console.log("   5. Frontend is using mediasoupClient.js correctly");
  } catch (error) {
    console.error("\n❌ MediaSoup test failed:", error.message);
    console.error("\n📝 Error details:", error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log("\n🧹 Cleaning up...");
    await mediaServer.close();
    console.log("✅ Cleanup complete\n");
    process.exit(0);
  }
}

// Run the test
testMediaSoup();
