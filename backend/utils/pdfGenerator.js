const fs = require('fs');
const path = require('path');

// PDF Generation Service for Quiz Platform
class QuizPDFGenerator {
  constructor() {
    this.defaultStyles = {
      title: {
        fontSize: 20,
        font: 'helvetica-bold',
        color: '#2563eb'
      },
      heading: {
        fontSize: 14,
        font: 'helvetica-bold',
        color: '#374151'
      },
      question: {
        fontSize: 12,
        font: 'helvetica-bold',
        color: '#111827'
      },
      option: {
        fontSize: 11,
        font: 'helvetica',
        color: '#374151'
      },
      answer: {
        fontSize: 10,
        font: 'helvetica-italic',
        color: '#059669'
      },
      explanation: {
        fontSize: 10,
        font: 'helvetica',
        color: '#6b7280'
      }
    };
  }

  generateQuizPDF(quizData, options = {}) {
    const { 
      includeAnswers = true, 
      includeExplanations = true, 
      format = 'A4',
      headerText = '',
      footerText = '',
      teacherCopy = false
    } = options;

    try {
      // Create PDF content structure
      const pdfContent = this.createPDFContent(quizData, {
        includeAnswers,
        includeExplanations,
        teacherCopy,
        headerText,
        footerText
      });

      // For now, return HTML that can be converted to PDF on frontend
      // In a production environment, you'd use a server-side PDF library
      return this.generateHTML(pdfContent, quizData);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  createPDFContent(quizData, options) {
    const { questions = [], title = '', description = '' } = quizData;
    const { includeAnswers, includeExplanations, teacherCopy, headerText, footerText } = options;

    const content = {
      header: headerText || `${title} - ${teacherCopy ? 'Teacher Copy' : 'Student Copy'}`,
      title: title,
      description: description,
      metadata: {
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0),
        estimatedTime: Math.ceil(questions.reduce((sum, q) => sum + (q.timeLimit || 30), 0) / 60),
        difficulty: quizData.difficulty || 'Medium',
        category: quizData.category || 'General'
      },
      questions: questions.map((question, index) => ({
        number: index + 1,
        text: question.question,
        type: question.type || 'multiple-choice',
        options: question.options || [],
        points: question.points || 1,
        timeLimit: question.timeLimit || 30,
        difficulty: question.difficulty || 'Medium',
        correctAnswer: includeAnswers ? question.correct_answer : null,
        explanation: includeExplanations && question.explanation ? question.explanation : null
      })),
      footer: footerText || `Generated on ${new Date().toLocaleDateString()} | QuizWise-AI Platform`,
      isTeacherCopy: teacherCopy
    };

    return content;
  }

  generateHTML(content, quizData) {
    const { header, title, description, metadata, questions, footer, isTeacherCopy } = content;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - PDF Export</title>
        <style>
            @page {
                margin: 1in;
                size: A4;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 100%;
                margin: 0;
                padding: 0;
            }
            
            .header {
                text-align: center;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 10px;
                margin-bottom: 30px;
            }
            
            .quiz-title {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin: 0;
            }
            
            .quiz-description {
                font-size: 14px;
                color: #6b7280;
                margin: 10px 0;
                font-style: italic;
            }
            
            .metadata {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #e5e7eb;
            }
            
            .metadata-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .metadata-label {
                font-weight: 600;
                color: #374151;
            }
            
            .metadata-value {
                font-weight: bold;
                color: #2563eb;
            }
            
            .question-container {
                margin: 25px 0;
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                page-break-inside: avoid;
            }
            
            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .question-number {
                font-weight: bold;
                color: #2563eb;
                font-size: 16px;
            }
            
            .question-meta {
                display: flex;
                gap: 10px;
                font-size: 12px;
            }
            
            .question-badge {
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 500;
                text-transform: uppercase;
                font-size: 10px;
            }
            
            .badge-type {
                background: #dbeafe;
                color: #1e40af;
            }
            
            .badge-difficulty {
                background: #fef3c7;
                color: #92400e;
            }
            
            .badge-points {
                background: #d1fae5;
                color: #065f46;
            }
            
            .question-text {
                font-size: 14px;
                font-weight: 600;
                color: #111827;
                margin: 15px 0;
                line-height: 1.5;
            }
            
            .options-container {
                margin: 15px 0;
            }
            
            .option {
                display: flex;
                align-items: center;
                margin: 8px 0;
                padding: 8px;
                border-radius: 4px;
                background: #f9fafb;
            }
            
            .option-letter {
                font-weight: bold;
                color: #374151;
                margin-right: 10px;
                width: 20px;
            }
            
            .option-text {
                flex: 1;
                color: #374151;
            }
            
            .correct-answer {
                background: #d1fae5 !important;
                border-left: 4px solid #10b981;
            }
            
            .correct-indicator {
                color: #059669;
                font-weight: bold;
                margin-left: 10px;
            }
            
            .answer-section {
                margin-top: 15px;
                padding: 10px;
                background: #f0f9ff;
                border-left: 4px solid #0ea5e9;
                border-radius: 0 4px 4px 0;
            }
            
            .answer-label {
                font-weight: bold;
                color: #0c4a6e;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .answer-text {
                color: #0c4a6e;
                font-weight: 600;
                margin-top: 5px;
            }
            
            .explanation-section {
                margin-top: 10px;
                padding: 10px;
                background: #fefce8;
                border-left: 4px solid #eab308;
                border-radius: 0 4px 4px 0;
            }
            
            .explanation-label {
                font-weight: bold;
                color: #713f12;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .explanation-text {
                color: #713f12;
                margin-top: 5px;
                font-style: italic;
            }
            
            .true-false-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 15px 0;
            }
            
            .tf-option {
                padding: 15px;
                text-align: center;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
            }
            
            .tf-correct {
                border-color: #10b981;
                background: #d1fae5;
                color: #065f46;
            }
            
            .descriptive-answer {
                border: 1px solid #d1d5db;
                border-radius: 4px;
                padding: 15px;
                margin: 15px 0;
                min-height: 80px;
                background: #f9fafb;
            }
            
            .answer-space-label {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 10px;
                font-style: italic;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
            }
            
            .teacher-note {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            
            .teacher-note-title {
                font-weight: bold;
                color: #dc2626;
                margin-bottom: 5px;
            }
            
            .teacher-note-text {
                color: #991b1b;
                font-size: 12px;
            }
            
            @media print {
                .question-container {
                    page-break-inside: avoid;
                }
                
                .header {
                    page-break-after: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1 class="quiz-title">${title}</h1>
            ${description ? `<p class="quiz-description">${description}</p>` : ''}
        </div>
        
        <div class="metadata">
            <div class="metadata-item">
                <span class="metadata-label">Total Questions:</span>
                <span class="metadata-value">${metadata.totalQuestions}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Total Points:</span>
                <span class="metadata-value">${metadata.totalPoints}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Estimated Time:</span>
                <span class="metadata-value">${metadata.estimatedTime} minutes</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Difficulty:</span>
                <span class="metadata-value">${metadata.difficulty}</span>
            </div>
        </div>
        
        ${isTeacherCopy ? `
        <div class="teacher-note">
            <div class="teacher-note-title">📋 Teacher Copy</div>
            <div class="teacher-note-text">
                This copy includes correct answers and explanations. 
                For student copies, export without answers and explanations.
            </div>
        </div>
        ` : ''}
        
        ${questions.map((question, index) => `
        <div class="question-container">
            <div class="question-header">
                <span class="question-number">Question ${question.number}</span>
                <div class="question-meta">
                    <span class="question-badge badge-type">${question.type}</span>
                    <span class="question-badge badge-difficulty">${question.difficulty}</span>
                    <span class="question-badge badge-points">${question.points} pts</span>
                </div>
            </div>
            
            <div class="question-text">${question.text}</div>
            
            ${question.type === 'multiple-choice' ? `
                <div class="options-container">
                    ${question.options.map((option, optIndex) => `
                        <div class="option ${isTeacherCopy && option === question.correctAnswer ? 'correct-answer' : ''}">
                            <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
                            <span class="option-text">${option}</span>
                            ${isTeacherCopy && option === question.correctAnswer ? '<span class="correct-indicator">✓ Correct</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${question.type === 'true-false' ? `
                <div class="true-false-options">
                    <div class="tf-option ${isTeacherCopy && question.correctAnswer === 'True' ? 'tf-correct' : ''}">
                        True ${isTeacherCopy && question.correctAnswer === 'True' ? '✓' : ''}
                    </div>
                    <div class="tf-option ${isTeacherCopy && question.correctAnswer === 'False' ? 'tf-correct' : ''}">
                        False ${isTeacherCopy && question.correctAnswer === 'False' ? '✓' : ''}
                    </div>
                </div>
            ` : ''}
            
            ${question.type === 'descriptive' || question.type === 'fill-in-blank' ? `
                <div class="descriptive-answer">
                    <div class="answer-space-label">Answer Space:</div>
                    <div style="min-height: 60px;"></div>
                </div>
            ` : ''}
            
            ${question.correctAnswer && isTeacherCopy && (question.type === 'descriptive' || question.type === 'fill-in-blank') ? `
                <div class="answer-section">
                    <div class="answer-label">Expected Answer:</div>
                    <div class="answer-text">${question.correctAnswer}</div>
                </div>
            ` : ''}
            
            ${question.explanation && isTeacherCopy ? `
                <div class="explanation-section">
                    <div class="explanation-label">Explanation:</div>
                    <div class="explanation-text">${question.explanation}</div>
                </div>
            ` : ''}
        </div>
        `).join('')}
        
        <div class="footer">
            ${footer}
        </div>
    </body>
    </html>
    `;

    return html;
  }

  // Generate different PDF formats
  generateStudentCopy(quizData) {
    return this.generateQuizPDF(quizData, {
      includeAnswers: false,
      includeExplanations: false,
      teacherCopy: false,
      headerText: `${quizData.title} - Student Copy`
    });
  }

  generateTeacherCopy(quizData) {
    return this.generateQuizPDF(quizData, {
      includeAnswers: true,
      includeExplanations: true,
      teacherCopy: true,
      headerText: `${quizData.title} - Teacher Copy (Answer Key)`
    });
  }

  generateAnswerKey(quizData) {
    return this.generateQuizPDF(quizData, {
      includeAnswers: true,
      includeExplanations: true,
      teacherCopy: true,
      headerText: `${quizData.title} - Answer Key`
    });
  }
}

module.exports = QuizPDFGenerator;
