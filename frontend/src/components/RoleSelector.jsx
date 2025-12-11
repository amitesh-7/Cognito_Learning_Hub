import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';

const RoleSelector = ({ selectedRole, onRoleChange, className = '' }) => {
  const roles = [
    {
      value: 'Student',
      label: 'Student',
      icon: GraduationCap,
      description: 'Take quizzes and learn',
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'hover:border-blue-400',
    },
    {
      value: 'Teacher',
      label: 'Teacher',
      icon: BookOpen,
      description: 'Create and manage quizzes',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:border-purple-400',
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        I am a
      </label>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.value;
          
          return (
            <motion.button
              key={role.value}
              type="button"
              onClick={() => onRoleChange(role.value)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-12 h-12 mb-3 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-semibold text-sm mb-1 ${
                  isSelected 
                    ? 'text-indigo-700 dark:text-indigo-300' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {role.label}
                </h3>
                <p className={`text-xs ${
                  isSelected 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {role.description}
                </p>
              </div>
              
              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
