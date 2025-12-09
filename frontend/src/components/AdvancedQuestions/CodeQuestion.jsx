import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Check, X, Loader2, Code2, Terminal, Info } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import Editor from "@monaco-editor/react";

const CodeQuestion = ({ question, onSubmit, isSubmitting }) => {
  const [code, setCode] = useState(question.codeConfig?.starterCode || "");
  const [selectedLanguage, setSelectedLanguage] = useState(
    question.codeConfig?.allowedLanguages?.[0] || "javascript"
  );
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const languageMap = {
    javascript: { label: "JavaScript", ext: "js", monacoId: "javascript" },
    python: { label: "Python", ext: "py", monacoId: "python" },
    java: { label: "Java", ext: "java", monacoId: "java" },
    cpp: { label: "C++", ext: "cpp", monacoId: "cpp" },
    c: { label: "C", ext: "c", monacoId: "c" },
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults([]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/api/advanced-questions/execute-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            code,
            language: selectedLanguage,
            testCases: question.codeConfig?.testCases || [],
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setTestResults(data.data.results || []);
        setOutput({
          success: true,
          passed: data.data.results.filter((r) => r.passed).length,
          total: data.data.results.length,
        });
      } else {
        setOutput({
          success: false,
          error: data.error || "Execution failed",
        });
      }
    } catch (error) {
      console.error("Error running code:", error);
      setOutput({
        success: false,
        error: "Failed to execute code. Please try again.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      code,
      language: selectedLanguage,
      testResults,
    });
  };

  return (
    <div className="space-y-4">
      {/* Question Description */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Code2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {question.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {question.question}
            </p>
          </div>
        </div>

        {/* Requirements */}
        {question.codeConfig?.requirements && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Requirements:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              {question.codeConfig.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Test Cases Preview */}
        {question.codeConfig?.testCases?.filter((tc) => !tc.hidden).length >
          0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Sample Test Cases:
            </h4>
            <div className="space-y-2">
              {question.codeConfig.testCases
                .filter((tc) => !tc.hidden)
                .map((testCase, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm font-mono"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Input:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {JSON.stringify(testCase.input)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Expected:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {JSON.stringify(testCase.expectedOutput)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Card>

      {/* Language Selector */}
      <div className="flex items-center gap-3">
        <label className="font-semibold text-gray-900 dark:text-white">
          Language:
        </label>
        <div className="flex gap-2">
          {question.codeConfig?.allowedLanguages?.map((lang) => (
            <Button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              variant={selectedLanguage === lang ? "default" : "outline"}
              size="sm"
            >
              {languageMap[lang]?.label || lang}
            </Button>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <Card className="overflow-hidden">
        <div className="bg-gray-800 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">
              {languageMap[selectedLanguage]?.label} Editor
            </span>
          </div>
          <Button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>
        <Editor
          height="400px"
          language={languageMap[selectedLanguage]?.monacoId}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </Card>

      {/* Output Section */}
      {output && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Test Results
            </h4>

            {output.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      output.passed === output.total
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {output.passed} / {output.total} tests passed
                  </Badge>
                </div>

                <div className="space-y-2">
                  {testResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        result.passed
                          ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                          : "bg-red-50 dark:bg-red-900/20 border-red-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.passed ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-semibold">
                          Test Case {idx + 1}
                        </span>
                      </div>
                      {!result.passed && (
                        <div className="ml-6 space-y-1 text-sm font-mono">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Expected:
                            </span>{" "}
                            {result.expected}
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Got:
                            </span>{" "}
                            {result.actual}
                          </div>
                          {result.error && (
                            <div className="text-red-600">
                              Error: {result.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-900 dark:text-red-100">
                  <X className="w-5 h-5" />
                  <span className="font-semibold">Execution Failed</span>
                </div>
                <p className="mt-2 text-red-800 dark:text-red-200 font-mono text-sm">
                  {output.error}
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !code.trim()}
          size="lg"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Solution"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CodeQuestion;
