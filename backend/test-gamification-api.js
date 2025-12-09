/**
 * Test gamification stats API
 */

require("dotenv").config();
const axios = require("axios");

async function testAPI() {
  try {
    const API_URL = process.env.VITE_API_URL || "http://localhost:3000";
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODk0NzI0YjQxYWIxM2Q5ZmRiMWUxNjgiLCJlbWFpbCI6ImFtaXRlc2hAZ21haWwuY29tIiwicm9sZSI6IlN0dWRlbnQiLCJpYXQiOjE3MzMwNDU5Njh9.1wdJf8ghS7LW0jcKnA_c3_EKb9yWRsNW4E-fDWBdSHE"; // Get this from localStorage

    console.log(`📡 Testing API: ${API_URL}/api/gamification/stats\n`);

    const response = await axios.get(`${API_URL}/api/gamification/stats`, {
      headers: { "x-auth-token": token },
    });

    console.log("✅ Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testAPI();
