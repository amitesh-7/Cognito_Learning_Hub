/**
 * Sync Users to Gamification Service
 * Ensures all users from main DB exist in gamification service's User collection
 */

const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

// Define User schema (same as in gamification service)
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    picture: String,
    role: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

async function syncUsers() {
  try {
    console.log("🔄 Starting user sync to gamification service...");
    console.log(`📡 MongoDB: ${MONGO_URI.split("@")[1]}`); // Hide credentials

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get users collection from main database
    const usersCollection = mongoose.connection.db.collection("users");
    const allUsers = await usersCollection.find({}).toArray();

    console.log(`📊 Found ${allUsers.length} users in main database`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const user of allUsers) {
      try {
        // Check if user exists in gamification User collection
        const existingUser = await User.findById(user._id);

        if (!existingUser) {
          // Create user in gamification service
          await User.create({
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture || null,
            role: user.role || "Student",
          });
          console.log(`✅ Synced user: ${user.name} (${user.email})`);
          syncedCount++;
        } else {
          // Update existing user
          existingUser.name = user.name;
          existingUser.email = user.email;
          existingUser.picture = user.picture || existingUser.picture;
          existingUser.role = user.role || existingUser.role;
          await existingUser.save();
          console.log(`🔄 Updated user: ${user.name}`);
          syncedCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to sync user ${user.email}:`, error.message);
        skippedCount++;
      }
    }

    console.log("\n═══════════════════════════════════════");
    console.log("🎉 User Sync Complete!");
    console.log(`✅ Synced: ${syncedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log("═══════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ User sync failed:", error);
    process.exit(1);
  }
}

// Run the sync
syncUsers();
