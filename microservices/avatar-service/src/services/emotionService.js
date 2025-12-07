/**
 * Emotion Analyzer Service
 * Analyzes quiz events and generates appropriate emotional responses
 */
class EmotionAnalyzer {
  constructor() {
    // Emotion mappings for different events
    this.eventEmotions = {
      questionAnswered: {
        moods: ["focused", "neutral"],
        animations: ["thinking"],
        soundEffects: ["click"],
        visualEffects: [],
      },
      correctAnswer: {
        moods: ["happy", "excited", "proud"],
        animations: ["bounce", "dance", "clap"],
        soundEffects: ["success", "ding", "cheer"],
        visualEffects: ["sparkle", "glow"],
      },
      wrongAnswer: {
        moods: ["encouraging", "determined"],
        animations: ["nod", "thinking"],
        soundEffects: ["gentle_buzz"],
        visualEffects: ["pulse"],
      },
      streakAchieved: {
        moods: ["excited", "proud"],
        animations: ["jump", "fireworks", "dance"],
        soundEffects: ["fanfare", "cheer"],
        visualEffects: ["fire", "sparkle"],
      },
      streakBroken: {
        moods: ["encouraging", "determined"],
        animations: ["nod", "thumbs_up"],
        soundEffects: ["gentle_buzz"],
        visualEffects: ["fade"],
      },
      quizStarted: {
        moods: ["focused", "determined", "curious"],
        animations: ["wave", "bounce"],
        soundEffects: ["start"],
        visualEffects: ["glow"],
      },
      quizCompleted: {
        moods: ["happy", "proud"],
        animations: ["clap", "dance", "celebrate"],
        soundEffects: ["complete", "fanfare"],
        visualEffects: ["confetti", "sparkle"],
      },
      perfectScore: {
        moods: ["excited", "proud"],
        animations: ["fireworks", "backflip", "confetti"],
        soundEffects: ["fanfare", "epic"],
        visualEffects: ["rainbow", "confetti", "glow"],
      },
      timeRunningOut: {
        moods: ["focused", "determined"],
        animations: ["worry", "hurry"],
        soundEffects: ["tick"],
        visualEffects: ["pulse", "urgent"],
      },
      hintUsed: {
        moods: ["curious", "focused"],
        animations: ["thinking", "lightbulb"],
        soundEffects: ["hint"],
        visualEffects: ["lightbulb"],
      },
      levelUp: {
        moods: ["excited", "proud"],
        animations: ["fireworks", "dance", "celebrate"],
        soundEffects: ["level_up", "fanfare"],
        visualEffects: ["rainbow", "glow", "confetti"],
      },
      achievementUnlocked: {
        moods: ["excited", "proud"],
        animations: ["celebrate", "dance"],
        soundEffects: ["achievement"],
        visualEffects: ["sparkle", "badge"],
      },
      encouragement: {
        moods: ["encouraging", "happy"],
        animations: ["nod", "thumbs_up", "wave"],
        soundEffects: ["encourage"],
        visualEffects: ["heart"],
      },
    };
    
    // Intensity modifiers based on context
    this.intensityModifiers = {
      streak: (value) => Math.min(value * 5, 30), // More streak = more intensity
      score: (value) => value * 0.5, // Score percentage affects intensity
      difficulty: (value) => {
        switch (value) {
          case "Hard": return 20;
          case "Medium": return 10;
          default: return 0;
        }
      },
      timeRemaining: (value, total) => {
        // Less time remaining = more intensity
        const ratio = value / total;
        if (ratio < 0.25) return 20;
        if (ratio < 0.5) return 10;
        return 0;
      },
    };
    
    // Duration for different events (ms)
    this.eventDurations = {
      questionAnswered: 300,
      correctAnswer: 1500,
      wrongAnswer: 1000,
      streakAchieved: 2500,
      streakBroken: 1000,
      quizStarted: 1500,
      quizCompleted: 3000,
      perfectScore: 4000,
      timeRunningOut: 500,
      hintUsed: 1000,
      levelUp: 4000,
      achievementUnlocked: 3000,
      encouragement: 1500,
    };
  }
  
  /**
   * Analyze an event and generate emotion response
   */
  analyzeEvent(event, context = {}, personality = {}) {
    const emotionSet = this.eventEmotions[event];
    
    if (!emotionSet) {
      return {
        mood: "neutral",
        intensity: 50,
        animation: "idle",
        soundEffect: null,
        visualEffect: null,
        duration: 1000,
      };
    }
    
    // Calculate base intensity (50-100)
    let intensity = 50;
    
    // Apply context modifiers
    if (context.streak && this.intensityModifiers.streak) {
      intensity += this.intensityModifiers.streak(context.streak);
    }
    if (context.score && this.intensityModifiers.score) {
      intensity += this.intensityModifiers.score(context.score);
    }
    if (context.difficulty && this.intensityModifiers.difficulty) {
      intensity += this.intensityModifiers.difficulty(context.difficulty);
    }
    
    // Apply personality modifiers
    if (personality.enthusiasm) {
      intensity += (personality.enthusiasm - 50) * 0.3;
    }
    
    // Cap intensity
    intensity = Math.min(100, Math.max(0, intensity));
    
    // Select random mood from options
    const mood = emotionSet.moods[Math.floor(Math.random() * emotionSet.moods.length)];
    
    // Select animation based on intensity
    let animationIndex = 0;
    if (intensity > 80) {
      animationIndex = emotionSet.animations.length - 1; // Most exciting
    } else if (intensity > 60) {
      animationIndex = Math.floor(emotionSet.animations.length / 2);
    }
    const animation = emotionSet.animations[animationIndex] || emotionSet.animations[0];
    
    // Select sound effect
    const soundEffect = emotionSet.soundEffects[
      Math.floor(Math.random() * emotionSet.soundEffects.length)
    ];
    
    // Select visual effect
    const visualEffect = emotionSet.visualEffects.length > 0
      ? emotionSet.visualEffects[Math.floor(Math.random() * emotionSet.visualEffects.length)]
      : null;
    
    return {
      mood,
      intensity: Math.round(intensity),
      animation,
      soundEffect,
      visualEffect,
      duration: this.eventDurations[event] || 1000,
    };
  }
  
  /**
   * Get compound emotion from multiple events
   */
  getCompoundEmotion(events, context = {}) {
    if (events.length === 0) {
      return { mood: "neutral", intensity: 50 };
    }
    
    // Analyze all events
    const analyses = events.map(event => this.analyzeEvent(event, context));
    
    // Average intensity
    const avgIntensity = analyses.reduce((sum, a) => sum + a.intensity, 0) / analyses.length;
    
    // Most common mood
    const moodCounts = {};
    analyses.forEach(a => {
      moodCounts[a.mood] = (moodCounts[a.mood] || 0) + 1;
    });
    const dominantMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return {
      mood: dominantMood,
      intensity: Math.round(avgIntensity),
      animations: [...new Set(analyses.map(a => a.animation))],
      effects: [...new Set(analyses.flatMap(a => [a.soundEffect, a.visualEffect].filter(Boolean)))],
    };
  }
  
  /**
   * Get transition animation between moods
   */
  getMoodTransition(fromMood, toMood) {
    const transitions = {
      "neutral_to_happy": { type: "grow", duration: 400 },
      "neutral_to_excited": { type: "bounce", duration: 500 },
      "neutral_to_focused": { type: "narrow", duration: 300 },
      "happy_to_excited": { type: "accelerate", duration: 300 },
      "happy_to_neutral": { type: "settle", duration: 500 },
      "excited_to_happy": { type: "calm", duration: 400 },
      "excited_to_proud": { type: "elevate", duration: 500 },
      "focused_to_determined": { type: "intensify", duration: 300 },
      "encouraging_to_happy": { type: "bloom", duration: 400 },
    };
    
    const key = `${fromMood}_to_${toMood}`;
    return transitions[key] || { type: "crossfade", duration: 400 };
  }
}

module.exports = { EmotionAnalyzer };
