import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Calendar,
  Flag,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

const StudyGoals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "custom",
    targetDate: "",
    priority: "medium",
    relatedTopics: [],
  });
  const [topicInput, setTopicInput] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3001"
        }/api/study-buddy/goals`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const data = await response.json();
      if (data.success) {
        setGoals(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");

      // Convert priority string to number for backend
      const priorityMap = { low: 2, medium: 3, high: 5 };
      const goalData = {
        ...newGoal,
        priority: priorityMap[newGoal.priority] || 3,
        category: newGoal.category || "custom", // Ensure category is never empty
      };

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3001"
        }/api/study-buddy/goals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(goalData),
        }
      );
      const data = await response.json();
      if (data.success) {
        setGoals([...goals, data.data]);
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const updateGoal = async (goalId, updates) => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3001"
        }/api/study-buddy/goals/${goalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(updates),
        }
      );
      const data = await response.json();
      if (data.success) {
        setGoals(goals.map((g) => (g._id === goalId ? data.data : g)));
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const token = localStorage.getItem("quizwise-token");
      await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3001"
        }/api/study-buddy/goals/${goalId}`,
        {
          method: "DELETE",
          headers: { "x-auth-token": token },
        }
      );
      setGoals(goals.filter((g) => g._id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const resetForm = () => {
    setNewGoal({
      title: "",
      description: "",
      category: "custom",
      targetDate: "",
      priority: "medium",
      relatedTopics: [],
    });
    setTopicInput("");
    setEditingGoal(null);
  };

  const addTopic = () => {
    if (
      topicInput.trim() &&
      !newGoal.relatedTopics.includes(topicInput.trim())
    ) {
      setNewGoal({
        ...newGoal,
        relatedTopics: [...newGoal.relatedTopics, topicInput.trim()],
      });
      setTopicInput("");
    }
  };

  const removeTopic = (topic) => {
    setNewGoal({
      ...newGoal,
      relatedTopics: newGoal.relatedTopics.filter((t) => t !== topic),
    });
  };

  const getCategoryLabel = (category) => {
    const labels = {
      exam_preparation: "Exam Preparation",
      skill_mastery: "Skill Mastery",
      career_goal: "Career Goal",
      certification: "Certification",
      custom: "Custom",
    };
    return labels[category] || category;
  };

  const getPriorityLabel = (priority) => {
    // Convert number to string label
    if (typeof priority === "number") {
      if (priority >= 5) return "high";
      if (priority >= 3) return "medium";
      return "low";
    }
    return priority;
  };

  const getPriorityColor = (priority) => {
    const label = getPriorityLabel(priority);
    switch (label) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const stats = {
    total: goals.length,
    completed: goals.filter((g) => g.status === "completed").length,
    inProgress: goals.filter((g) => g.status === "in_progress").length,
    notStarted: goals.filter((g) => g.status === "not_started").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Total Goals
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <Target className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-200">
                Completed
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-white">
                {stats.completed}
              </p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                In Progress
              </p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-white">
                {stats.inProgress}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Not Started
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.notStarted}
              </p>
            </div>
            <Clock className="w-10 h-10 text-gray-500" />
          </div>
        </Card>
      </div>

      {/* Create Goal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Learning Goals
        </h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No goals yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first learning goal to get started!
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {goals.map((goal) => (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    {getStatusIcon(goal.status)}
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(goal.priority)}>
                        <Flag className="w-3 h-3 mr-1" />
                        {getPriorityLabel(goal.priority)}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {goal.description}
                  </p>

                  {goal.category && (
                    <Badge variant="outline" className="mb-3">
                      {getCategoryLabel(goal.category)}
                    </Badge>
                  )}

                  {goal.relatedTopics && goal.relatedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {goal.relatedTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-2 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {goal.targetDate && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="font-semibold">
                        {goal.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress || 0}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const newProgress = Math.min(
                          (goal.progress || 0) + 10,
                          100
                        );
                        const newStatus =
                          newProgress === 100
                            ? "completed"
                            : newProgress > 0
                            ? "in_progress"
                            : "not_started";
                        updateGoal(goal._id, {
                          progress: newProgress,
                          status: newStatus,
                        });
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +10%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingGoal(goal);
                        setNewGoal(goal);
                        setShowCreateModal(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => deleteGoal(goal._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Master React Hooks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="What do you want to achieve?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newGoal.category}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, category: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="custom">Custom</option>
                      <option value="exam_preparation">Exam Preparation</option>
                      <option value="skill_mastery">Skill Mastery</option>
                      <option value="career_goal">Career Goal</option>
                      <option value="certification">Certification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newGoal.priority}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, priority: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Related Topics
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTopic()}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add a topic and press Enter"
                    />
                    <Button onClick={addTopic} type="button">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newGoal.relatedTopics.map((topic, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTopic(topic)}
                      >
                        {topic}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingGoal) {
                      updateGoal(editingGoal._id, newGoal);
                      setShowCreateModal(false);
                      resetForm();
                    } else {
                      createGoal();
                    }
                  }}
                  disabled={!newGoal.title}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyGoals;
