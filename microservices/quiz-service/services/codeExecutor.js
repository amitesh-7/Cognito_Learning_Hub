const { VM } = require("vm2");
const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

class CodeExecutor {
  constructor() {
    this.tempDir = path.join(__dirname, "../temp");
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error("Error creating temp directory:", error);
    }
  }

  /**
   * Execute code and run test cases
   */
  async executeCode(
    code,
    language,
    testCases,
    timeLimit = 5000,
    memoryLimit = 128
  ) {
    try {
      let results = [];

      switch (language.toLowerCase()) {
        case "javascript":
        case "js":
          results = await this.executeJavaScript(code, testCases, timeLimit);
          break;
        case "python":
          results = await this.executePython(code, testCases, timeLimit);
          break;
        case "java":
          results = await this.executeJava(code, testCases, timeLimit);
          break;
        case "cpp":
        case "c++":
          results = await this.executeCpp(code, testCases, timeLimit);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      // Calculate overall score
      const totalTests = testCases.length;
      const passedTests = results.filter((r) => r.passed).length;
      const score = Math.round((passedTests / totalTests) * 100);

      return {
        success: true,
        score,
        totalTests,
        passedTests,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        score: 0,
      };
    }
  }

  /**
   * Execute JavaScript code in sandboxed environment
   */
  async executeJavaScript(code, testCases, timeLimit) {
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      try {
        const vm = new VM({
          timeout: timeLimit,
          sandbox: {},
        });

        // Wrap code to make it testable
        const wrappedCode = `
          ${code}
          
          // Test execution
          const result = (function() {
            try {
              ${this.buildTestInvocation(testCase.input)}
            } catch (e) {
              return { error: e.message };
            }
          })();
          result;
        `;

        const output = vm.run(wrappedCode);
        const passed = this.compareOutputs(output, testCase.expectedOutput);

        results.push({
          testCase: i + 1,
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: output,
          error: output?.error || null,
          hidden: testCase.isHidden,
        });
      } catch (error) {
        results.push({
          testCase: i + 1,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          error: error.message,
          hidden: testCase.isHidden,
        });
      }
    }

    return results;
  }

  /**
   * Execute Python code
   */
  async executePython(code, testCases, timeLimit) {
    const results = [];
    const sessionId = crypto.randomBytes(8).toString("hex");
    const codeFile = path.join(this.tempDir, `${sessionId}.py`);

    try {
      // Write code to file
      await fs.writeFile(codeFile, code);

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        try {
          // Build test script
          const testScript = `
import sys
import json
${code}

# Test execution
try:
    input_data = ${JSON.stringify(testCase.input)}
    result = main(${this.formatPythonArgs(testCase.input)})
    print(json.dumps({"result": result}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

          const testFile = path.join(this.tempDir, `${sessionId}_test${i}.py`);
          await fs.writeFile(testFile, testScript);

          const output = await this.runCommand(`python ${testFile}`, timeLimit);
          const parsed = JSON.parse(output.stdout);

          const passed = parsed.error
            ? false
            : this.compareOutputs(parsed.result, testCase.expectedOutput);

          results.push({
            testCase: i + 1,
            passed,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: parsed.result,
            error: parsed.error || null,
            hidden: testCase.isHidden,
          });

          // Cleanup test file
          await fs.unlink(testFile).catch(() => {});
        } catch (error) {
          results.push({
            testCase: i + 1,
            passed: false,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            error: error.message,
            hidden: testCase.isHidden,
          });
        }
      }
    } finally {
      // Cleanup
      await fs.unlink(codeFile).catch(() => {});
    }

    return results;
  }

  /**
   * Execute Java code
   */
  async executeJava(code, testCases, timeLimit) {
    const results = [];
    const sessionId = crypto.randomBytes(8).toString("hex");
    const className = this.extractJavaClassName(code) || "Solution";
    const javaFile = path.join(this.tempDir, `${className}.java`);

    try {
      await fs.writeFile(javaFile, code);

      // Compile
      const compileOutput = await this.runCommand(
        `javac ${javaFile}`,
        timeLimit
      );
      if (compileOutput.stderr) {
        throw new Error(`Compilation error: ${compileOutput.stderr}`);
      }

      // Run test cases
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        try {
          const runOutput = await this.runCommand(
            `java -cp ${this.tempDir} ${className} '${JSON.stringify(
              testCase.input
            )}'`,
            timeLimit
          );

          const output = JSON.parse(runOutput.stdout);
          const passed = this.compareOutputs(output, testCase.expectedOutput);

          results.push({
            testCase: i + 1,
            passed,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: output,
            hidden: testCase.isHidden,
          });
        } catch (error) {
          results.push({
            testCase: i + 1,
            passed: false,
            input: testCase.input,
            error: error.message,
            hidden: testCase.isHidden,
          });
        }
      }

      // Cleanup
      await fs.unlink(javaFile).catch(() => {});
      await fs
        .unlink(path.join(this.tempDir, `${className}.class`))
        .catch(() => {});
    } catch (error) {
      results.push({
        testCase: 1,
        passed: false,
        error: error.message,
      });
    }

    return results;
  }

  /**
   * Execute C++ code
   */
  async executeCpp(code, testCases, timeLimit) {
    const results = [];
    const sessionId = crypto.randomBytes(8).toString("hex");
    const cppFile = path.join(this.tempDir, `${sessionId}.cpp`);
    const exeFile = path.join(this.tempDir, `${sessionId}.exe`);

    try {
      await fs.writeFile(cppFile, code);

      // Compile
      const compileOutput = await this.runCommand(
        `g++ -o ${exeFile} ${cppFile}`,
        timeLimit
      );
      if (compileOutput.stderr) {
        throw new Error(`Compilation error: ${compileOutput.stderr}`);
      }

      // Run test cases
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        try {
          const runOutput = await this.runCommand(
            `${exeFile} ${JSON.stringify(testCase.input)}`,
            timeLimit
          );

          const output = this.parseOutput(runOutput.stdout);
          const passed = this.compareOutputs(output, testCase.expectedOutput);

          results.push({
            testCase: i + 1,
            passed,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: output,
            hidden: testCase.isHidden,
          });
        } catch (error) {
          results.push({
            testCase: i + 1,
            passed: false,
            input: testCase.input,
            error: error.message,
            hidden: testCase.isHidden,
          });
        }
      }

      // Cleanup
      await fs.unlink(cppFile).catch(() => {});
      await fs.unlink(exeFile).catch(() => {});
    } catch (error) {
      results.push({
        testCase: 1,
        passed: false,
        error: error.message,
      });
    }

    return results;
  }

  /**
   * Run command with timeout
   */
  runCommand(command, timeout) {
    return new Promise((resolve, reject) => {
      exec(
        command,
        { timeout, maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error && error.killed) {
            reject(new Error("Execution timeout"));
          } else if (error) {
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        }
      );
    });
  }

  /**
   * Compare outputs (handles different data types)
   */
  compareOutputs(actual, expected) {
    if (typeof actual === "object" && typeof expected === "object") {
      return JSON.stringify(actual) === JSON.stringify(expected);
    }
    return String(actual).trim() === String(expected).trim();
  }

  buildTestInvocation(input) {
    if (typeof input === "object" && !Array.isArray(input)) {
      const args = Object.values(input)
        .map((v) => JSON.stringify(v))
        .join(", ");
      return `return main(${args});`;
    } else if (Array.isArray(input)) {
      const args = input.map((v) => JSON.stringify(v)).join(", ");
      return `return main(${args});`;
    } else {
      return `return main(${JSON.stringify(input)});`;
    }
  }

  formatPythonArgs(input) {
    if (Array.isArray(input)) {
      return input.map((v) => JSON.stringify(v)).join(", ");
    }
    return JSON.stringify(input);
  }

  extractJavaClassName(code) {
    const match = code.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : null;
  }

  parseOutput(output) {
    try {
      return JSON.parse(output);
    } catch {
      return output.trim();
    }
  }

  /**
   * Analyze code quality
   */
  analyzeCodeQuality(code, language) {
    const analysis = {
      linesOfCode: code.split("\n").length,
      complexity: "Medium",
      hasComments: /\/\/|\/\*|\#/.test(code),
      suggestions: [],
    };

    // Simple complexity estimation
    const cyclomaticComplexity = (code.match(/if|for|while|case|catch/g) || [])
      .length;
    if (cyclomaticComplexity > 10) {
      analysis.complexity = "High";
      analysis.suggestions.push(
        "Consider breaking down complex logic into smaller functions"
      );
    } else if (cyclomaticComplexity < 3) {
      analysis.complexity = "Low";
    }

    if (!analysis.hasComments && analysis.linesOfCode > 20) {
      analysis.suggestions.push("Add comments to explain complex logic");
    }

    return analysis;
  }
}

module.exports = new CodeExecutor();
