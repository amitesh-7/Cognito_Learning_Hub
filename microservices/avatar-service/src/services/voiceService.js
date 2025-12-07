const axios = require("axios");

/**
 * Voice Clone Service
 * Handles voice cloning, speech synthesis, and personalized explanations
 * 
 * In production, this would integrate with services like:
 * - ElevenLabs for voice cloning
 * - Google Cloud Text-to-Speech
 * - Amazon Polly
 */
class VoiceCloneService {
  constructor() {
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    this.elevenLabsBaseUrl = "https://api.elevenlabs.io/v1";
    
    // Default voice IDs from ElevenLabs
    this.defaultVoices = {
      "en-US": "21m00Tcm4TlvDq8ikWAM", // Rachel
      "en-GB": "EXAVITQu4vr4xnSDxMaL", // Bella
      "es": "GBv7mTt0atIp3Br8iCZE",
      "fr": "TX3LPaxmHKxFdv7VOQHJ",
      "de": "jBpfuIE2acCO8z3wKNLl",
    };
  }
  
  /**
   * Create a voice profile from a sample
   * In production, this would call ElevenLabs Voice Clone API
   */
  async createVoiceProfile(samplePath, userId) {
    try {
      // Simulate voice profile creation
      // In production:
      // const formData = new FormData();
      // formData.append("files", fs.createReadStream(samplePath));
      // formData.append("name", `User_${userId}_Voice`);
      // 
      // const response = await axios.post(
      //   `${this.elevenLabsBaseUrl}/voices/add`,
      //   formData,
      //   { headers: { "xi-api-key": this.elevenLabsApiKey } }
      // );
      // return response.data.voice_id;
      
      // For now, return a simulated voice ID
      const voiceId = `voice_${userId}_${Date.now()}`;
      console.log(`Created voice profile: ${voiceId} from sample: ${samplePath}`);
      
      return voiceId;
    } catch (error) {
      console.error("Error creating voice profile:", error);
      throw new Error("Failed to create voice profile");
    }
  }
  
  /**
   * Delete a voice profile
   */
  async deleteVoiceProfile(voiceProfileId) {
    try {
      // In production:
      // await axios.delete(
      //   `${this.elevenLabsBaseUrl}/voices/${voiceProfileId}`,
      //   { headers: { "xi-api-key": this.elevenLabsApiKey } }
      // );
      
      console.log(`Deleted voice profile: ${voiceProfileId}`);
      return true;
    } catch (error) {
      console.error("Error deleting voice profile:", error);
      throw new Error("Failed to delete voice profile");
    }
  }
  
  /**
   * Generate speech using cloned voice
   */
  async generateSpeech(text, voiceProfileId, settings = {}) {
    try {
      // In production, this would call ElevenLabs API:
      // const response = await axios.post(
      //   `${this.elevenLabsBaseUrl}/text-to-speech/${voiceProfileId}`,
      //   {
      //     text,
      //     model_id: "eleven_monolingual_v1",
      //     voice_settings: {
      //       stability: settings.stability || 0.5,
      //       similarity_boost: settings.similarityBoost || 0.75,
      //       style: settings.style || 0.5,
      //     },
      //   },
      //   {
      //     headers: { "xi-api-key": this.elevenLabsApiKey },
      //     responseType: "arraybuffer",
      //   }
      // );
      // 
      // Save audio and return URL
      
      // For now, return a placeholder
      const audioUrl = `/api/voice/audio/${voiceProfileId}/${Date.now()}.mp3`;
      console.log(`Generated speech for: "${text.substring(0, 50)}..." with voice: ${voiceProfileId}`);
      
      return audioUrl;
    } catch (error) {
      console.error("Error generating speech:", error);
      throw new Error("Failed to generate speech");
    }
  }
  
  /**
   * Generate speech using default TTS
   */
  async generateDefaultSpeech(text, language = "en-US") {
    try {
      const voiceId = this.defaultVoices[language] || this.defaultVoices["en-US"];
      
      // In production, use the default voice with ElevenLabs or browser TTS
      const audioUrl = `/api/voice/tts/${voiceId}/${Date.now()}.mp3`;
      console.log(`Generated default speech for: "${text.substring(0, 50)}..."`);
      
      return audioUrl;
    } catch (error) {
      console.error("Error generating default speech:", error);
      throw new Error("Failed to generate speech");
    }
  }
  
  /**
   * Personalize explanation based on learning style and personality
   */
  personalizeExplanation(originalText, learningStyle, personality, context = {}) {
    let personalizedText = originalText;
    
    // Adjust based on learning pace
    if (learningStyle.preferredPace === "slow") {
      // Break into simpler sentences
      personalizedText = this.simplifyExplanation(personalizedText);
    } else if (learningStyle.preferredPace === "fast") {
      // Make more concise
      personalizedText = this.condenseExplanation(personalizedText);
    }
    
    // Add encouragement based on personality
    if (personality.supportiveness > 70) {
      personalizedText = this.addEncouragement(personalizedText, personality);
    }
    
    // Add humor if personality allows
    if (personality.humor > 60) {
      personalizedText = this.addHumorElement(personalizedText);
    }
    
    // Add context-specific additions
    if (context.isWrongAnswer) {
      personalizedText = this.addWrongAnswerEncouragement(personalizedText, personality);
    }
    
    return personalizedText;
  }
  
  /**
   * Simplify explanation for slower pace
   */
  simplifyExplanation(text) {
    // Add pauses and break complex sentences
    const sentences = text.split(". ");
    return sentences.map(s => {
      if (s.length > 100) {
        // Add a pause in the middle of long sentences
        const midpoint = Math.floor(s.length / 2);
        const spaceIndex = s.indexOf(" ", midpoint);
        if (spaceIndex > -1) {
          return s.substring(0, spaceIndex) + ". Also, " + s.substring(spaceIndex + 1);
        }
      }
      return s;
    }).join(". ");
  }
  
  /**
   * Condense explanation for faster pace
   */
  condenseExplanation(text) {
    // Remove filler words and make more direct
    return text
      .replace(/basically,?\s*/gi, "")
      .replace(/essentially,?\s*/gi, "")
      .replace(/in other words,?\s*/gi, "")
      .replace(/that is to say,?\s*/gi, "")
      .trim();
  }
  
  /**
   * Add encouragement to explanation
   */
  addEncouragement(text, personality) {
    const encouragements = [
      "Don't worry, this is a tricky one! ",
      "Great question to learn from! ",
      "This is actually a common mistake. ",
      "Let me help you understand this better. ",
    ];
    
    const prefix = encouragements[Math.floor(Math.random() * encouragements.length)];
    return prefix + text;
  }
  
  /**
   * Add humor element
   */
  addHumorElement(text) {
    const humors = [
      " (I know, I know, it seems confusing at first!)",
      " Trust me, even I had to think about this one! 🤔",
      " No worries, Rome wasn't built in a day either!",
    ];
    
    if (Math.random() > 0.5) {
      return text + humors[Math.floor(Math.random() * humors.length)];
    }
    return text;
  }
  
  /**
   * Add wrong answer encouragement
   */
  addWrongAnswerEncouragement(text, personality) {
    if (personality.supportiveness > 80) {
      return "That's okay, mistakes are how we learn! " + text + " Keep going, you're doing great! 💪";
    }
    return text;
  }
  
  /**
   * Get available voices
   */
  getAvailableVoices() {
    return [
      { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", language: "en-US", accent: "American" },
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", language: "en-GB", accent: "British" },
      { id: "MF3mGyEYCl7XYWbV9V6O", name: "Emily", language: "en-US", accent: "American" },
      { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", language: "en-US", accent: "American" },
      { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", language: "en-US", accent: "American" },
      { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", language: "en-US", accent: "American" },
    ];
  }
}

module.exports = { VoiceCloneService };
