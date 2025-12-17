const { GoogleGenerativeAI } = require("@google/generative-ai");
const Conversation = require("../../models/study-buddy/Conversation");
const LearningMemory = require("../../models/study-buddy/LearningMemory");
const StudyGoal = require("../../models/study-buddy/StudyGoal");

class AIStudyBuddyService {
  constructor() {
    // Validate API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "❌ GEMINI_API_KEY is not configured in environment variables"
      );
      console.error(
        "📝 Please add a valid Gemini API key to your .env.local file"
      );
      console.error(
        "🔗 Get a free key at: https://aistudio.google.com/app/apikey"
      );
      throw new Error("GEMINI_API_KEY is required for AI Study Buddy");
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Fallback model chain for reliability - using only currently available models
    // Based on Gemini API v1beta (Dec 2024)
    this.modelChain = [
      process.env.AI_MODEL || "gemini-2.5-flash",
      "gemini-2.5-pro", // More stable, higher capacity
      "gemini-2.5-flash-lite", // Lighter, faster alternative
      "gemini-1.5-flash-latest", // Latest 1.5 flash variant
    ];

    this.currentModelIndex = 0;
    const modelName = this.modelChain[0];
    console.log(`🤖 Initializing AI Study Buddy with model: ${modelName}`);
    console.log(`📋 Fallback models: ${this.modelChain.slice(1).join(", ")}`);

    this.model = this.genAI.getGenerativeModel({
      model: modelName,
    });
    this.conversationCache = new Map();
  }

  /**
   * Get model with automatic fallback on failure
   */
  getModel(modelIndex = this.currentModelIndex) {
    const modelName = this.modelChain[modelIndex];
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Retry with exponential backoff and model fallback
   */
  async retryWithFallback(operation, maxRetries = 3) {
    let lastError;

    for (
      let modelIndex = 0;
      modelIndex < this.modelChain.length;
      modelIndex++
    ) {
      const modelName = this.modelChain[modelIndex];
      console.log(`🔄 Trying model: ${modelName}`);

      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const model = this.getModel(modelIndex);
          return await operation(model, modelName);
        } catch (error) {
          lastError = error;

          // If it's a 503 (overloaded) or 429 (rate limit), retry with backoff
          if (error.status === 503 || error.status === 429) {
            if (retry < maxRetries - 1) {
              const delay = Math.pow(2, retry) * 1000; // Exponential backoff: 1s, 2s, 4s
              console.log(
                `⏳ Model ${modelName} overloaded, retrying in ${delay}ms... (attempt ${
                  retry + 1
                }/${maxRetries})`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            } else {
              console.log(
                `❌ Model ${modelName} failed after ${maxRetries} retries, trying next model...`
              );
              break; // Try next model
            }
          }

          // For other errors (404, 400), try next model immediately
          if (error.status === 404 || error.status === 400) {
            console.log(
              `❌ Model ${modelName} error (${error.status}), trying next model...`
            );
            break; // Try next model
          }

          // For unexpected errors, throw immediately
          throw error;
        }
      }
    }

    // All models and retries failed
    throw lastError;
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

      // Use retry with fallback for reliability
      const result = await this.retryWithFallback(async (model, modelName) => {
        console.log(`💬 Generating response with ${modelName}...`);

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        });

        const result = await chat.sendMessage(
          systemPrompt + "\n\nUser: " + message
        );

        return result.response.text();
      });

      const response = result;

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

      // More helpful error messages
      if (error.status === 400 && error.message?.includes("API key")) {
        throw new Error(
          "Invalid API key. Please configure a valid GEMINI_API_KEY in your environment variables. Get one at: https://aistudio.google.com/app/apikey"
        );
      }

      if (error.status === 503 || error.status === 429) {
        throw new Error(
          "AI service is currently overloaded. Please try again in a few moments."
        );
      }

      if (error.status === 404 && error.message?.includes("not found")) {
        throw new Error(
          "AI model not available. Please contact support or try again later."
        );
      }

      throw new Error("Failed to generate response. Please try again.");
    }
  }

  /**
   * Build system prompt with context and memories
   */
  buildSystemPrompt(memories, goals, context) {
    let prompt = `You are an AI Study Buddy for Cognito Learning Hub. You are supportive, helpful, and adaptive to student needs.

Your personality:
- Patient and understanding
- Encouraging and clear
- Balance between guiding and explaining
- Use analogies and real-world examples
- Celebrate progress and learn from mistakes

Teaching approach:
- When a student asks for definitions or explanations directly (e.g., "tell me about", "define", "explain"), provide clear, concise answers FIRST, then optionally follow up with guiding questions
- When a student is exploring or seems stuck, use the Socratic method with guiding questions
- If a student shows frustration or explicitly asks for direct answers, provide them immediately
- Adapt your approach based on the student's tone and questions

RESPONSE FORMATTING RULES:
- Use clear headings with "#" for main topics
- Use "##" for subtopics
- Use bullet points with "-" for lists
- Use numbered lists "1." "2." etc. for ordered steps
- Use **bold** for emphasis on key terms
- Use *italic* for subtle emphasis
- Use code blocks with triple backticks for formulas or code
- Keep paragraphs short and readable
- Add blank lines between sections for clarity

Example good format:
# Integration in Calculus

Integration is primarily about two big ideas:

## 1. Finding the Area
Imagine you have a wiggly line on a graph (a function). Integration allows us to find the exact area between that line and the x-axis.

**Key concept**: Think of it like taking tiny, infinitely thin slices and adding all their areas together.

## 2. The Reverse of Differentiation
You might remember differentiation (finding the rate of change). Integration is the *inverse* operation.

- If you differentiate a function → you get another function
- If you integrate that second function → you get back the original (plus a constant)

This is why it's called the "antiderivative."

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

    prompt += `\nKey Rules:
1. When students ask direct questions, give them well-formatted, clear answers
2. Always use markdown formatting as shown in the example
3. Break down complex topics into digestible sections with headings
4. Use analogies and examples to illustrate concepts
5. Save the Socratic method for when they're exploring or need deeper understanding\n`;

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
