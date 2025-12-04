/**
 * Gemini API Key Checker & Model Lister
 *
 * This script verifies your Google Gemini API key and lists all available models.
 *
 * Usage:
 *   node scripts/check-gemini-api.js
 *
 * Or with a specific API key:
 *   node scripts/check-gemini-api.js YOUR_API_KEY
 */

const https = require("https");
const path = require("path");

// Try to load environment variables from various locations
function loadEnvFile() {
  const possiblePaths = [
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", "backend", ".env"),
    path.join(__dirname, "..", "microservices", "quiz-service", ".env"),
  ];

  for (const envPath of possiblePaths) {
    try {
      require("dotenv").config({ path: envPath });
      if (process.env.GOOGLE_API_KEY) {
        console.log(`✅ Loaded API key from: ${envPath}`);
        return true;
      }
    } catch (e) {
      // Continue to next path
    }
  }
  return false;
}

// Get API key from command line or environment
function getApiKey() {
  // Check command line argument first
  if (process.argv[2]) {
    console.log("📝 Using API key from command line argument");
    return process.argv[2];
  }

  // Try to load from .env files
  loadEnvFile();

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("\n❌ ERROR: No API key found!");
    console.error("\nPlease provide an API key in one of these ways:");
    console.error(
      "  1. Pass as command line argument: node check-gemini-api.js YOUR_API_KEY"
    );
    console.error("  2. Set GOOGLE_API_KEY in your .env file");
    console.error("  3. Set GOOGLE_API_KEY environment variable");
    process.exit(1);
  }

  return apiKey;
}

// Make HTTPS request to Gemini API
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: json });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Check API key validity
async function checkApiKey(apiKey) {
  console.log("\n🔑 Checking API Key...");
  console.log(
    `   Key prefix: ${apiKey.substring(0, 8)}...${apiKey.substring(
      apiKey.length - 4
    )}`
  );
  console.log(`   Key length: ${apiKey.length} characters`);

  // Basic validation
  if (apiKey.length < 30) {
    console.error("   ⚠️  Warning: API key seems too short");
  }

  if (!apiKey.startsWith("AIza")) {
    console.error(
      "   ⚠️  Warning: API key does not start with expected prefix (AIza)"
    );
  }
}

// List available models
async function listModels(apiKey) {
  console.log("\n📋 Fetching Available Models...\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await makeRequest(url);

    if (response.statusCode === 200 && response.data.models) {
      console.log("✅ API Key is VALID!\n");
      console.log("=".repeat(80));
      console.log("AVAILABLE GEMINI MODELS");
      console.log("=".repeat(80));

      const models = response.data.models;

      // Categorize models
      const categories = {
        "Gemini 2.x": [],
        "Gemini 1.5": [],
        "Gemini 1.0": [],
        Embedding: [],
        Other: [],
      };

      models.forEach((model) => {
        const name = model.name.replace("models/", "");
        const displayName = model.displayName || name;

        if (name.includes("gemini-2")) {
          categories["Gemini 2.x"].push({ name, displayName, model });
        } else if (
          name.includes("gemini-1.5") ||
          (name.includes("gemini-pro") && !name.includes("1.0"))
        ) {
          categories["Gemini 1.5"].push({ name, displayName, model });
        } else if (name.includes("gemini-1.0")) {
          categories["Gemini 1.0"].push({ name, displayName, model });
        } else if (name.includes("embedding")) {
          categories["Embedding"].push({ name, displayName, model });
        } else {
          categories["Other"].push({ name, displayName, model });
        }
      });

      // Display categorized models
      for (const [category, categoryModels] of Object.entries(categories)) {
        if (categoryModels.length > 0) {
          console.log(`\n📦 ${category} (${categoryModels.length} models)`);
          console.log("-".repeat(60));

          categoryModels.forEach(({ name, displayName, model }) => {
            console.log(`\n  🤖 ${name}`);
            console.log(`     Display Name: ${displayName}`);

            if (model.description) {
              const shortDesc = model.description.substring(0, 100);
              console.log(
                `     Description: ${shortDesc}${
                  model.description.length > 100 ? "..." : ""
                }`
              );
            }

            if (model.supportedGenerationMethods) {
              console.log(
                `     Methods: ${model.supportedGenerationMethods.join(", ")}`
              );
            }

            if (model.inputTokenLimit) {
              console.log(
                `     Input Limit: ${model.inputTokenLimit.toLocaleString()} tokens`
              );
            }

            if (model.outputTokenLimit) {
              console.log(
                `     Output Limit: ${model.outputTokenLimit.toLocaleString()} tokens`
              );
            }
          });
        }
      }

      console.log("\n" + "=".repeat(80));
      console.log(`Total Models Available: ${models.length}`);
      console.log("=".repeat(80));

      // Recommendations for quiz generation
      console.log("\n💡 RECOMMENDATIONS FOR QUIZ GENERATION:");
      console.log("-".repeat(60));

      const recommendedModels = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
      ];

      const availableRecommended = models.filter((m) =>
        recommendedModels.some((r) => m.name.includes(r))
      );

      if (availableRecommended.length > 0) {
        console.log("\n✅ Available recommended models for quiz generation:");
        availableRecommended.forEach((m) => {
          const name = m.name.replace("models/", "");
          console.log(`   • ${name}`);
        });

        // Check current setting
        const currentModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        console.log(`\n📌 Current GEMINI_MODEL setting: ${currentModel}`);

        const isCurrentAvailable = models.some((m) =>
          m.name.includes(currentModel)
        );
        if (isCurrentAvailable) {
          console.log("   ✅ This model is available");
        } else {
          console.log(
            "   ⚠️  This model may not be available! Consider updating GEMINI_MODEL"
          );
        }
      }

      return models;
    } else if (response.statusCode === 400) {
      console.error("❌ API Key is INVALID!");
      console.error("   Error:", response.data.error?.message || "Bad Request");
      return null;
    } else if (response.statusCode === 403) {
      console.error("❌ API Key is FORBIDDEN!");
      console.error(
        "   The API key may be restricted or the Gemini API is not enabled."
      );
      console.error("   Error:", response.data.error?.message || "Forbidden");
      return null;
    } else {
      console.error(`❌ Unexpected response (${response.statusCode})`);
      console.error("   Response:", JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
    return null;
  }
}

// Test a specific model
async function testModel(apiKey, modelName = "gemini-1.5-flash") {
  console.log(`\n🧪 Testing model: ${modelName}...`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const testPrompt = {
    contents: [
      {
        parts: [
          {
            text: 'Say "Hello, the API is working!" in exactly those words.',
          },
        ],
      },
    ],
  };

  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);

            if (res.statusCode === 200 && json.candidates) {
              const text =
                json.candidates[0]?.content?.parts[0]?.text || "No response";
              console.log(`   ✅ Model responded: "${text.trim()}"`);
              resolve(true);
            } else {
              console.log(
                `   ❌ Model test failed: ${
                  json.error?.message || "Unknown error"
                }`
              );
              resolve(false);
            }
          } catch (e) {
            console.log(`   ❌ Failed to parse response: ${e.message}`);
            resolve(false);
          }
        });
      }
    );

    req.on("error", (error) => {
      console.log(`   ❌ Request error: ${error.message}`);
      resolve(false);
    });

    req.write(JSON.stringify(testPrompt));
    req.end();
  });
}

// Main execution
async function main() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║           GEMINI API KEY CHECKER & MODEL LISTER                ║"
  );
  console.log(
    "║                   Cognito Learning Hub                         ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );

  const apiKey = getApiKey();

  await checkApiKey(apiKey);

  const models = await listModels(apiKey);

  if (models) {
    // Test a few key models
    console.log("\n🔬 RUNNING MODEL TESTS...");
    console.log("-".repeat(60));

    const modelsToTest = ["gemini-1.5-flash", "gemini-2.0-flash-exp"];

    for (const modelName of modelsToTest) {
      const modelExists = models.some((m) => m.name.includes(modelName));
      if (modelExists) {
        await testModel(apiKey, modelName);
      }
    }
  }

  console.log("\n✨ Check complete!\n");
}

// Run the script
main().catch(console.error);
