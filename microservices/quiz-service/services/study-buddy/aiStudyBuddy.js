const { GoogleGenerativeAI } = require("@google/generative-ai");
const Conversation = require("../../models/study-buddy/Conversation");
const LearningMemory = require("../../models/study-buddy/LearningMemory");
const StudyGoal = require("../../models/study-buddy/StudyGoal");

class AIStudyBuddyService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.AI_MODEL || "gemini-2.5-flash",
    });
    this.conversationCache = new Map();
  }

  /**
   * Generate AI response with context and memory
   */
  async generateResponse(userId, message, sessionId, context = {}) {
    try {
      // Retrieve relevant memories
      const memories = await this.getRelevantMemories(userId, message);

      // Get conversation history
      const conversationHistory = await this.getConversationHistory(
        userId,
        sessionId
      );

      // Get user goals
      const goals = await StudyGoal.find({
        user: userId,
        status: { $in: ["not_started", "in_progress"] },
      })
        .sort({ priority: -1 })
        .limit(3);

      // Build context for AI
      const systemPrompt = this.buildSystemPrompt(memories, goals, context);

      // Prepare conversation history for AI
      const chatHistory = conversationHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      // Start chat with history
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      // Send message with context
      const result = await chat.sendMessage(
        systemPrompt + "\n\nUser: " + message
      );
      const response = result.response.text();

      // Store conversation
      await this.saveConversation(
        userId,
        sessionId,
        message,
        response,
        context
      );

      // Extract and store new memories
      await this.extractAndStoreMemories(userId, message, response, context);

      return {
        response,
        sessionId,
        metadata: {
          memoriesUsed: memories.length,
          relatedGoals: goals.map((g) => g.title),
        },
      };
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw new Error("Failed to generate response");
    }
  }

  /**
   * Build system prompt with context and memories
   */
  buildSystemPrompt(memories, goals, context) {
    let prompt = `You are an AI Study Buddy for Cognito Learning Hub. You are supportive, encouraging, and use the Socratic method to guide students rather than giving direct answers.

Your personality:
- Patient and understanding
- Encouraging without being condescending
- Ask probing questions to help students think
- Use analogies and real-world examples
- Celebrate progress and learn from mistakes

`;

    // Add memory context
    if (memories.length > 0) {
      prompt += `\n📚 What you remember about this student:\n`;
      memories.forEach((mem) => {
        prompt += `- ${mem.content} (${mem.memoryType})\n`;
      });
    }

    // Add goal context
    if (goals.length > 0) {
      prompt += `\n🎯 Student's current goals:\n`;
      goals.forEach((goal) => {
        prompt += `- ${goal.title} (${goal.progress}% complete)\n`;
      });
    }

    // Add current context
    if (context.currentTopic) {
      prompt += `\n📖 Current topic: ${context.currentTopic}\n`;
    }

    if (context.recentQuizPerformance) {
      prompt += `\n📊 Recent quiz performance: ${context.recentQuizPerformance}\n`;
    }

    prompt += `\nRemember: Guide the student to discover answers themselves. Ask questions like "What do you think happens when...?" or "Can you explain why...?" before providing explanations.\n`;

    return prompt;
  }

  /**
   * Get relevant memories for context
   */
  async getRelevantMemories(userId, message) {
    try {
      // Extract potential topics from message
      const topics = this.extractTopics(message);

      // Query relevant memories
      const query = {
        user: userId,
        $or: [
          { topic: { $in: topics } },
          { "metadata.tags": { $in: topics } },
          {
            memoryType: {
              $in: ["struggle_area", "strength_area", "preference"],
            },
          },
        ],
      };

      const memories = await LearningMemory.find(query)
        .sort({ importance: -1, lastAccessed: -1 })
        .limit(10);

      // Update access for retrieved memories
      memories.forEach((mem) => mem.recordAccess());

      return memories;
    } catch (error) {
      console.error("Error retrieving memories:", error);
      return [];
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(userId, sessionId) {
    try {
      const conversation = await Conversation.findOne({
        user: userId,
        sessionId,
      });

      if (!conversation) return [];

      // Return last N messages for context
      const maxHistory = parseInt(process.env.MAX_CONVERSATION_HISTORY) || 20;
      return conversation.messages.slice(-maxHistory);
    } catch (error) {
      console.error("Error retrieving conversation history:", error);
      return [];
    }
  }

  /**
   * Save conversation to database
   */
  async saveConversation(userId, sessionId, userMessage, aiResponse, context) {
    try {
      let conversation = await Conversation.findOne({
        user: userId,
        sessionId,
      });

      if (!conversation) {
        conversation = new Conversation({
          user: userId,
          sessionId,
          messages: [],
          topics: [],
        });
      }

      // Add user message
      conversation.messages.push({
        role: "user",
        content: userMessage,
        metadata: {
          topic: context.currentTopic,
        },
      });

      // Add AI response
      conversation.messages.push({
        role: "assistant",
        content: aiResponse,
        metadata: {
          topic: context.currentTopic,
        },
      });

      // Update metadata
      conversation.metadata.totalMessages = conversation.messages.length;
      conversation.metadata.lastActivity = Date.now();

      // Extract and add topics
      const topics = this.extractTopics(userMessage + " " + aiResponse);
      conversation.topics = [...new Set([...conversation.topics, ...topics])];

      await conversation.save();
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  }

  /**
   * Extract and store memories from conversation
   */
  async extractAndStoreMemories(userId, userMessage, aiResponse, context) {
    try {
      // Analyze conversation for memorable insights
      const memories = [];

      // Check for struggle indicators
      const struggleKeywords = [
        "confused",
        "don't understand",
        "struggling",
        "difficult",
        "hard",
      ];
      if (
        struggleKeywords.some((kw) => userMessage.toLowerCase().includes(kw))
      ) {
        memories.push({
          user: userId,
          memoryType: "struggle_area",
          topic: context.currentTopic || "general",
          content: `Student expressed difficulty with ${
            context.currentTopic || "this topic"
          }`,
          importance: 8,
          metadata: { source: "conversation" },
        });
      }

      // Check for mastery indicators
      const masteryKeywords = ["understand", "got it", "makes sense", "i see"];
      if (
        masteryKeywords.some((kw) => userMessage.toLowerCase().includes(kw))
      ) {
        memories.push({
          user: userId,
          memoryType: "strength_area",
          topic: context.currentTopic || "general",
          content: `Student showed understanding of ${
            context.currentTopic || "this topic"
          }`,
          importance: 6,
          metadata: { source: "conversation" },
        });
      }

      // Save memories
      for (const memData of memories) {
        const memory = new LearningMemory(memData);
        await memory.save();
      }
    } catch (error) {
      console.error("Error storing memories:", error);
    }
  }

  /**
   * Extract topics from text
   */
  extractTopics(text) {
    // Simple keyword extraction (can be enhanced with NLP)
    const commonTopics = [
      "mathematics",
      "algebra",
      "calculus",
      "geometry",
      "trigonometry",
      "physics",
      "chemistry",
      "biology",
      "science",
      "programming",
      "javascript",
      "python",
      "java",
      "history",
      "geography",
      "english",
      "literature",
    ];

    const lowerText = text.toLowerCase();
    return commonTopics.filter((topic) => lowerText.includes(topic));
  }

  /**
   * Get conversation summary
   */
  async getConversationSummary(userId, sessionId) {
    try {
      const conversation = await Conversation.findOne({
        user: userId,
        sessionId,
      });

      if (!conversation) return null;

      // Generate summary using AI if not already exists
      if (!conversation.summary && conversation.messages.length > 5) {
        const messageText = conversation.messages
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n");

        const prompt = `Summarize this learning conversation in 2-3 sentences:\n\n${messageText}`;

        const result = await this.model.generateContent(prompt);
        conversation.summary = result.response.text();
        await conversation.save();
      }

      return {
        sessionId: conversation.sessionId,
        summary: conversation.summary,
        topics: conversation.topics,
        messageCount: conversation.messages.length,
        duration: conversation.metadata.duration,
        lastActivity: conversation.metadata.lastActivity,
      };
    } catch (error) {
      console.error("Error getting conversation summary:", error);
      return null;
    }
  }

  /**
   * Provide proactive suggestions based on learning patterns
   */
  async getProactiveSuggestions(userId) {
    try {
      // Get recent struggle areas
      const struggles = await LearningMemory.find({
        user: userId,
        memoryType: "struggle_area",
        lastAccessed: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      })
        .sort({ createdAt: -1 })
        .limit(3);

      const suggestions = [];

      for (const struggle of struggles) {
        suggestions.push({
          type: "practice_suggestion",
          message: `Hey! I noticed you found ${struggle.topic} challenging last week. Want to practice some questions on this topic?`,
          topic: struggle.topic,
          priority: struggle.importance,
        });
      }

      return suggestions;
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return [];
    }
  }
}

module.exports = new AIStudyBuddyService();
