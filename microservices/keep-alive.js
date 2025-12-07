/**
 * Keep-Alive Service for Render.com Backend Services
 *
 * Pings all microservices every 14 minutes to prevent them from sleeping
 * on Render's free tier (which sleeps after 15 minutes of inactivity).
 *
 * Usage: node keep-alive.js
 */

const https = require("https");
const http = require("http");

// All backend service URLs
const SERVICES = [
  { name: "Social Service", url: "https://social-service-lwjy.onrender.com" },
  { name: "Result Service", url: "https://result-service-vwjh.onrender.com" },
  { name: "Meeting Service", url: "https://meeting-service-ogfj.onrender.com" },
  { name: "Auth Service", url: "https://auth-service-uds0.onrender.com" },
  { name: "API Gateway", url: "https://api-gateway-kzo9.onrender.com" },
  { name: "Live Service", url: "https://live-service-ga6w.onrender.com" },
  {
    name: "Gamification Service",
    url: "https://gamification-service-ax6n.onrender.com",
  },
  { name: "Quiz Service", url: "https://quiz-service-6jzt.onrender.com" },
  {
    name: "Moderation Service",
    url: "https://moderation-service-3e2e.onrender.com",
  },
];

// Ping interval: 14 minutes (840,000 milliseconds)
const PING_INTERVAL = 14 * 60 * 1000;

/**
 * Ping a single service
 */
function pingService(service) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObj = new URL(service.url);
    const protocol = urlObj.protocol === "https:" ? https : http;

    const req = protocol.get(service.url, (res) => {
      const duration = Date.now() - startTime;
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(
          `✅ [${timestamp}] ${service.name} - Status: ${res.statusCode} - Response time: ${duration}ms`
        );
        resolve({
          success: true,
          service: service.name,
          statusCode: res.statusCode,
          duration,
        });
      } else {
        console.log(
          `⚠️  [${timestamp}] ${service.name} - Status: ${res.statusCode} - Response time: ${duration}ms`
        );
        resolve({
          success: false,
          service: service.name,
          statusCode: res.statusCode,
          duration,
        });
      }

      // Consume response data to free up memory
      res.resume();
    });

    req.on("error", (error) => {
      const duration = Date.now() - startTime;
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      });
      console.log(
        `❌ [${timestamp}] ${service.name} - Error: ${error.message} - Duration: ${duration}ms`
      );
      resolve({
        success: false,
        service: service.name,
        error: error.message,
        duration,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      const duration = Date.now() - startTime;
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      });
      console.log(
        `⏱️  [${timestamp}] ${service.name} - Timeout after ${duration}ms`
      );
      resolve({
        success: false,
        service: service.name,
        error: "Timeout",
        duration,
      });
    });

    // Set timeout to 30 seconds
    req.setTimeout(30000);
  });
}

/**
 * Ping all services concurrently
 */
async function pingAllServices() {
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });

  console.log("\n" + "=".repeat(80));
  console.log(`🔄 [${timestamp}] Pinging all services...`);
  console.log("=".repeat(80));

  const results = await Promise.all(SERVICES.map(pingService));

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.length - successful;
  const avgDuration = Math.round(
    results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length
  );

  console.log("=".repeat(80));
  console.log(
    `📊 Summary: ${successful}/${results.length} services responded successfully`
  );
  console.log(
    `   Success: ${successful} | Failed: ${failed} | Avg Response Time: ${avgDuration}ms`
  );
  console.log(`⏰ Next ping in 14 minutes...`);
  console.log("=".repeat(80) + "\n");

  return results;
}

/**
 * Start the keep-alive service
 */
function startKeepAlive() {
  console.log("🚀 Keep-Alive Service Started");
  console.log("📍 Monitoring 9 backend services on Render.com");
  console.log(`⏱️  Ping interval: ${PING_INTERVAL / 60000} minutes`);
  console.log("");

  // Ping immediately on start
  pingAllServices();

  // Then ping every 14 minutes
  setInterval(pingAllServices, PING_INTERVAL);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Keep-Alive Service Stopped");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n🛑 Keep-Alive Service Stopped");
  process.exit(0);
});

// Start the service
startKeepAlive();
