# 🎮 Gamification System - Complete Hierarchy

## 📊 Points System

### Question Points by Difficulty
| Difficulty | Points per Question | Use Case |
|-----------|-------------------|----------|
| Easy | 5 points | Basic concepts, quick revision |
| Medium | 10 points | Standard questions (default) |
| Hard | 15 points | Complex problems, application |
| Expert | 20 points | Advanced challenges, mastery |

### Points Calculation
```
Total Score = Sum of all correct answer points
```

Example:
- Quiz with 10 Medium questions (10 points each)
- Score 8 correct = 80 points
- Score 5 correct = 50 points

---

## ⭐ Experience (XP) System

### Base XP Calculation
```
Base XP = Total Score × 1
```
**1 point earned = 1 base XP**

### Difficulty Multipliers
| Difficulty | Multiplier | Example (100 points) |
|-----------|-----------|---------------------|
| Easy | 1.0x | 100 × 1.0 = 100 XP |
| Medium | 1.5x | 100 × 1.5 = 150 XP |
| Hard | 2.0x | 100 × 2.0 = 200 XP |
| Expert | 2.5x | 100 × 2.5 = 250 XP |

### Performance Bonuses
| Performance | Bonus | Example (150 base XP) |
|------------|-------|---------------------|
| ≥ 80% correct | +50% | 150 + 75 = **225 XP** |
| ≥ 60% correct | +25% | 150 + 37 = **187 XP** |
| < 60% | No bonus | **150 XP** |

### Time Bonus
| Speed | Bonus | Condition |
|-------|-------|-----------|
| Fast completion | +10% | Avg time < 50% of time limit |

---

## 🎯 Complete XP Examples

### Example 1: Medium Quiz (Perfect Score, Fast)
- 10 Medium questions × 10 points = **100 points**
- Difficulty: Medium (1.5x) = 100 × 1.5 = **150 XP**
- Performance: 100% (>80%) = 150 × 0.5 = **+75 XP**
- Time: Fast (<50% time) = 225 × 0.1 = **+22 XP**
- **Total: 247 XP** ✨

### Example 2: Hard Quiz (Good Score)
- 10 Hard questions × 15 points = **150 points**
- Score: 7 correct = **105 points**
- Difficulty: Hard (2.0x) = 105 × 2.0 = **210 XP**
- Performance: 70% (>60%) = 210 × 0.25 = **+52 XP**
- **Total: 262 XP** ✨

### Example 3: Easy Quiz (Average)
- 10 Easy questions × 5 points = **50 points**
- Score: 6 correct = **30 points**
- Difficulty: Easy (1.0x) = 30 × 1.0 = **30 XP**
- Performance: 60% = 30 × 0.25 = **+7 XP**
- **Total: 37 XP** ✨

### Example 4: Expert Quiz (Mastery)
- 10 Expert questions × 20 points = **200 points**
- Score: 9 correct = **180 points**
- Difficulty: Expert (2.5x) = 180 × 2.5 = **450 XP**
- Performance: 90% (>80%) = 450 × 0.5 = **+225 XP**
- Time: Fast = 675 × 0.1 = **+67 XP**
- **Total: 742 XP** 🎉🎉🎉

---

## 📈 Level System

### Level Calculation
```
Level = Floor(Total XP / 100) + 1
```

| XP Range | Level | Rank |
|----------|-------|------|
| 0 - 99 | 1 | Beginner |
| 100 - 199 | 2 | Learner |
| 200 - 499 | 3-5 | Intermediate |
| 500 - 999 | 6-10 | Advanced |
| 1000+ | 11+ | Expert |

---

## 🏆 Achievement System

### Quiz Completion Achievements
| Achievement | Requirement | Reward |
|------------|-------------|---------|
| First Quiz | Complete 1 quiz | 50 XP |
| Quiz Rookie | Complete 5 quizzes | 100 XP |
| Quiz Master | Complete 25 quizzes | 250 XP |
| Quiz Legend | Complete 100 quizzes | 1000 XP |

### Performance Achievements
| Achievement | Requirement | Reward |
|------------|-------------|---------|
| Perfect Score | 100% on any quiz | 100 XP |
| Ace Streak | 5 perfect scores in a row | 500 XP |
| Speed Demon | Complete 10 quizzes in fast time | 200 XP |

### Difficulty Achievements
| Achievement | Requirement | Reward |
|------------|-------------|---------|
| Easy Master | Complete 10 Easy quizzes | 100 XP |
| Hard Challenger | Complete 10 Hard quizzes | 300 XP |
| Expert Conqueror | Complete 10 Expert quizzes | 500 XP |

---

## 🔥 Streak System

### Daily Streak
- Complete at least 1 quiz per day
- Streak bonus: +10 XP per day maintained
- Max streak bonus: +100 XP per quiz (10-day streak)

### Streak Rewards
| Streak | Bonus per Quiz |
|--------|---------------|
| 1-3 days | +10 XP |
| 4-6 days | +20 XP |
| 7-9 days | +30 XP |
| 10+ days | +100 XP |

---

## 🎁 Bonus Points

### Category Bonuses
- First quiz in new category: **+25 XP**
- Complete all difficulty levels in category: **+100 XP**

### Social Bonuses
- Share quiz result: **+5 XP**
- Help someone in discussion: **+10 XP**
- Create popular quiz (>100 attempts): **+200 XP**

---

## 📋 Stats Tracked

### User Stats
- **Total Points**: Sum of all points earned
- **Total XP**: Sum of all experience gained
- **Level**: Calculated from total XP
- **Quizzes Taken**: Total count
- **Average Score**: Mean percentage across all quizzes
- **Current Streak**: Days in a row
- **Longest Streak**: Personal best
- **Total Time Spent**: Cumulative quiz time

### Leaderboards
- Global (by total XP)
- Weekly (top XP this week)
- Category-specific
- Streak leaders

---

## 🛠️ Migration Guide

### Update Existing Quizzes
Run the migration script to update all existing quiz points:

```bash
cd backend
node scripts/update-quiz-points.js
```

This will:
- Update all questions with default points based on difficulty
- Recalculate total points for each quiz
- Preserve manually set custom points

---

## 💡 Tips for Quiz Creators

1. **Balance Difficulty**: Mix question difficulties for engaging experience
2. **Set Custom Points**: Override defaults for bonus/penalty questions
3. **Time Limits**: Shorter limits increase challenge, enable time bonuses
4. **Categories**: Organize quizzes for better discovery and tracking

## 🎯 Tips for Learners

1. **Start Easy**: Build confidence with Easy quizzes (good XP/time ratio)
2. **Challenge Yourself**: Hard/Expert quizzes give 2-2.5x XP multiplier
3. **Maintain Streaks**: Daily completion adds significant bonus XP
4. **Speed Matters**: Fast completion (accurate) = +10% bonus
5. **Perfect Scores**: >80% accuracy = +50% XP bonus
6. **Consistency Wins**: Regular practice > sporadic cramming
