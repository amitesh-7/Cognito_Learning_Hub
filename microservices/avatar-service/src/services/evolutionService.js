const Avatar = require("../models/Avatar");

/**
 * Avatar Evolution Service
 * Handles level progression, item unlocks, and evolution stages
 */
class AvatarEvolutionService {
  constructor() {
    // Define item unlock requirements
    this.unlockRequirements = {
      // Hats
      hat_graduation: { level: 15, quizzesTaken: 50 },
      hat_crown: { level: 75, stage: "legend" },
      hat_wizard: { level: 25, perfectScores: 10 },
      hat_headphones: { level: 10, audioQuizzes: 5 },
      hat_halo: { level: 40, studentsHelped: 50 },
      
      // Glasses
      glasses_nerd: { level: 20, questionsAnswered: 500 },
      glasses_futuristic: { level: 30, stage: "expert" },
      
      // Outfits
      outfit_academic: { level: 15, stage: "scholar" },
      outfit_superhero: { level: 35, streak: 30 },
      outfit_scientist: { level: 25, categoryMaster: "Science" },
      outfit_astronaut: { level: 50, stage: "master" },
      outfit_royal: { level: 75, stage: "legend" },
      
      // Auras
      aura_glow: { level: 10 },
      aura_sparkle: { level: 20 },
      aura_fire: { level: 15, streak: 7 },
      aura_electric: { level: 30, questionsAnswered: 1000 },
      aura_rainbow: { level: 40, categoriesMastered: 5 },
      aura_cosmic: { level: 75, stage: "legend" },
      
      // Frames
      frame_bronze: { level: 5 },
      frame_silver: { level: 15 },
      frame_gold: { level: 30 },
      frame_platinum: { level: 50 },
      frame_diamond: { level: 70 },
      frame_legendary: { level: 90 },
    };
    
    // Evolution stage thresholds
    this.stageThresholds = {
      learner: 5,
      scholar: 15,
      expert: 30,
      master: 50,
      legend: 75,
    };
  }
  
  /**
   * Calculate experience needed for a level
   */
  calculateExpForLevel(level) {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }
  
  /**
   * Get evolution stage for a level
   */
  getStageForLevel(level) {
    if (level >= 75) return "legend";
    if (level >= 50) return "master";
    if (level >= 30) return "expert";
    if (level >= 15) return "scholar";
    if (level >= 5) return "learner";
    return "novice";
  }
  
  /**
   * Get information about next stage
   */
  getNextStageInfo(currentStage, currentLevel) {
    const stageOrder = ["novice", "learner", "scholar", "expert", "master", "legend"];
    const currentIndex = stageOrder.indexOf(currentStage);
    
    if (currentIndex === stageOrder.length - 1) {
      return {
        nextStage: null,
        levelsRemaining: 0,
        message: "You've reached the highest evolution stage! 🏆",
      };
    }
    
    const nextStage = stageOrder[currentIndex + 1];
    const requiredLevel = this.stageThresholds[nextStage];
    const levelsRemaining = requiredLevel - currentLevel;
    
    return {
      nextStage,
      requiredLevel,
      levelsRemaining,
      message: `${levelsRemaining} more level(s) to evolve to ${nextStage}!`,
    };
  }
  
  /**
   * Check for new item unlocks based on current stats
   */
  async checkForUnlocks(avatar) {
    const unlocked = [];
    const stats = avatar.evolution;
    const currentUnlocks = new Set(stats.unlockedItems.map(i => i.itemId));
    
    for (const [itemId, requirements] of Object.entries(this.unlockRequirements)) {
      // Skip if already unlocked
      if (currentUnlocks.has(itemId)) continue;
      
      let meetsRequirements = true;
      
      // Check level requirement
      if (requirements.level && stats.currentLevel < requirements.level) {
        meetsRequirements = false;
      }
      
      // Check stage requirement
      if (requirements.stage && stats.evolutionStage !== requirements.stage) {
        const stageOrder = ["novice", "learner", "scholar", "expert", "master", "legend"];
        const currentStageIndex = stageOrder.indexOf(stats.evolutionStage);
        const requiredStageIndex = stageOrder.indexOf(requirements.stage);
        if (currentStageIndex < requiredStageIndex) {
          meetsRequirements = false;
        }
      }
      
      // Check quizzes taken
      if (requirements.quizzesTaken && stats.totalQuizzesTaken < requirements.quizzesTaken) {
        meetsRequirements = false;
      }
      
      // Check perfect scores
      if (requirements.perfectScores && stats.totalPerfectScores < requirements.perfectScores) {
        meetsRequirements = false;
      }
      
      // Check questions answered
      if (requirements.questionsAnswered && stats.totalQuestionsAnswered < requirements.questionsAnswered) {
        meetsRequirements = false;
      }
      
      // Check streak
      if (requirements.streak && stats.longestStreak < requirements.streak) {
        meetsRequirements = false;
      }
      
      // If all requirements met, unlock the item
      if (meetsRequirements) {
        const itemType = itemId.split("_")[0];
        stats.unlockedItems.push({
          itemType,
          itemId,
          unlockedAt: new Date(),
          unlockedBy: `level_${stats.currentLevel}`,
        });
        unlocked.push({
          itemId,
          itemType,
          name: this.getItemDisplayName(itemId),
        });
      }
    }
    
    if (unlocked.length > 0) {
      await avatar.save();
    }
    
    return unlocked;
  }
  
  /**
   * Get display name for an item
   */
  getItemDisplayName(itemId) {
    const names = {
      hat_graduation: "Graduation Cap",
      hat_crown: "Royal Crown",
      hat_wizard: "Wizard Hat",
      hat_headphones: "Headphones",
      hat_halo: "Angel Halo",
      glasses_nerd: "Nerd Glasses",
      glasses_futuristic: "Futuristic Visor",
      outfit_academic: "Academic Robes",
      outfit_superhero: "Superhero Suit",
      outfit_scientist: "Lab Coat",
      outfit_astronaut: "Astronaut Suit",
      outfit_royal: "Royal Attire",
      aura_glow: "Glow Aura",
      aura_sparkle: "Sparkle Aura",
      aura_fire: "Fire Aura",
      aura_electric: "Electric Aura",
      aura_rainbow: "Rainbow Aura",
      aura_cosmic: "Cosmic Aura",
      frame_bronze: "Bronze Frame",
      frame_silver: "Silver Frame",
      frame_gold: "Gold Frame",
      frame_platinum: "Platinum Frame",
      frame_diamond: "Diamond Frame",
      frame_legendary: "Legendary Frame",
    };
    
    return names[itemId] || itemId;
  }
  
  /**
   * Calculate experience earned from quiz performance
   */
  calculateQuizExperience(quizResult) {
    let exp = 0;
    
    // Base experience for completing a quiz
    exp += 10;
    
    // Experience based on score
    const percentage = (quizResult.correctAnswers / quizResult.totalQuestions) * 100;
    exp += Math.floor(percentage / 10) * 5; // 5 exp per 10% score
    
    // Bonus for perfect score
    if (percentage === 100) {
      exp += 25;
    }
    
    // Bonus for difficulty
    switch (quizResult.difficulty) {
      case "Easy":
        exp *= 1;
        break;
      case "Medium":
        exp *= 1.5;
        break;
      case "Hard":
        exp *= 2;
        break;
    }
    
    // Streak bonus
    if (quizResult.currentStreak) {
      exp += Math.min(quizResult.currentStreak * 2, 20); // Max 20 bonus from streak
    }
    
    // Speed bonus (if completed faster than average)
    if (quizResult.timeBonus) {
      exp += Math.floor(quizResult.timeBonus);
    }
    
    return Math.floor(exp);
  }
}

module.exports = { AvatarEvolutionService };
