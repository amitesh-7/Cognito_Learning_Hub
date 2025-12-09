/**
 * Secure Docker-based Code Executor
 * Replaces unsafe file system execution with containerized sandboxing
 */

const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { promisify } = require("util");
const execAsync = promisify(exec);

class SecureCodeExecutor {
  constructor() {
    this.sandboxImage = "quiz-service-sandbox:latest";
    this.tempDir = path.join(__dirname, "../temp");
    this.timeout = 10000; // 10 seconds
    this.memoryLimit = "128m"; // 128 MB
    this.cpuLimit = "0.5"; // 0.5 CPU cores
  }

  /**
   * Initialize the sandbox (build Docker image if needed)
   */
  async initialize() {
    try {
      // Check if Docker is available
      await execAsync("docker --version");

      // Check if sandbox image exists
      const { stdout } = await execAsync(
        `docker images -q ${this.sandboxImage}`
      );

      if (!stdout.trim()) {
        console.log("Building sandbox Docker image...");
        await this.buildSandboxImage();
      }

      // Ensure temp directory exists
      await fs.mkdir(this.tempDir, { recursive: true });

      console.log("✅ Secure code executor initialized");
    } catch (error) {
      console.error("❌ Failed to initialize secure executor:", error.message);
      throw new Error("Docker is required for code execution");
    }
  }

  /**
   * Build the sandbox Docker image
   */
  async buildSandboxImage() {
    const dockerfilePath = path.join(__dirname, "../Dockerfile.sandbox");
    const entrypointPath = path.join(__dirname, "../docker-entrypoint.sh");

    // Check if Dockerfile exists
    try {
      await fs.access(dockerfilePath);
      await fs.access(entrypointPath);
    } catch {
      throw new Error("Dockerfile.sandbox or docker-entrypoint.sh not found");
    }

    const buildCommand = `docker build -f "${dockerfilePath}" -t ${
      this.sandboxImage
    } "${path.dirname(dockerfilePath)}"`;

    console.log("Building Docker image:", buildCommand);

    try {
      const { stdout, stderr } = await execAsync(buildCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      console.log("Docker build output:", stdout);
      if (stderr) console.warn("Docker build warnings:", stderr);
    } catch (error) {
      console.error("Docker build failed:", error);
      throw error;
    }
  }

  /**
   * Execute code in a secure Docker container
   */
  async executeCode(code, language, testCases = []) {
    const sessionId = `exec_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const sessionDir = path.join(this.tempDir, sessionId);

    try {
      // Create session directory
      await fs.mkdir(sessionDir, { recursive: true });

      // Determine file extension
      const extensions = {
        javascript: "js",
        js: "js",
        python: "py",
        java: "java",
        cpp: "cpp",
        "c++": "cpp",
        c: "c",
      };

      const ext = extensions[language.toLowerCase()] || "txt";
      const codeFile = path.join(sessionDir, `Solution.${ext}`);

      // Write code to file
      await fs.writeFile(codeFile, code, "utf-8");

      // Execute each test case
      const results = [];

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const inputFile = path.join(sessionDir, `input_${i}.txt`);
        await fs.writeFile(inputFile, testCase.input || "", "utf-8");

        const result = await this.runInContainer(
          codeFile,
          inputFile,
          language,
          sessionDir
        );

        const passed = result.output.trim() === testCase.expectedOutput.trim();

        results.push({
          testCase: i + 1,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          passed,
          error: result.error,
          executionTime: result.executionTime,
        });
      }

      return {
        success: true,
        results,
        allPassed: results.every((r) => r.passed),
      };
    } catch (error) {
      console.error("Code execution error:", error);
      return {
        success: false,
        error: error.message,
        results: [],
      };
    } finally {
      // Cleanup session directory
      try {
        await fs.rm(sessionDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn("Failed to cleanup session directory:", cleanupError);
      }
    }
  }

  /**
   * Run code in Docker container
   */
  async runInContainer(codeFile, inputFile, language, sessionDir) {
    const startTime = Date.now();

    // Map host paths to container paths
    const containerCodeFile = "/sandbox/code" + path.extname(codeFile);
    const containerInputFile = "/sandbox/input.txt";

    // Docker run command with security constraints
    const dockerCommand = [
      "docker run",
      "--rm", // Remove container after execution
      "--network none", // Disable network access
      `--memory=${this.memoryLimit}`, // Memory limit
      `--cpus=${this.cpuLimit}`, // CPU limit
      `--memory-swap=${this.memoryLimit}`, // Disable swap
      "--pids-limit=50", // Limit number of processes
      `--volume "${codeFile}:${containerCodeFile}:ro"`, // Mount code file (read-only)
      `--volume "${inputFile}:${containerInputFile}:ro"`, // Mount input file (read-only)
      "--cap-drop=ALL", // Drop all capabilities
      "--security-opt=no-new-privileges", // Prevent privilege escalation
      `${this.sandboxImage}`,
      language,
      containerCodeFile,
      containerInputFile,
    ].join(" ");

    try {
      const { stdout, stderr } = await execAsync(dockerCommand, {
        timeout: this.timeout,
        maxBuffer: 1024 * 1024, // 1MB output limit
      });

      const executionTime = Date.now() - startTime;

      return {
        output: stdout || "",
        error: stderr || null,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Handle different error types
      if (error.killed || error.signal === "SIGTERM") {
        return {
          output: "",
          error: `Execution timeout exceeded (${this.timeout / 1000}s)`,
          executionTime,
        };
      }

      return {
        output: error.stdout || "",
        error: error.stderr || error.message,
        executionTime,
      };
    }
  }

  /**
   * Validate code before execution (basic security checks)
   */
  validateCode(code, language) {
    // Forbidden patterns that might indicate malicious code
    const forbiddenPatterns = {
      all: [
        /require\s*\(\s*['"]child_process['"]\s*\)/i, // Node.js child_process
        /import\s+subprocess/i, // Python subprocess
        /System\.exit/i, // Force exit
        /Runtime\.getRuntime/i, // Java runtime
        /ProcessBuilder/i, // Java process builder
      ],
      javascript: [
        /require\s*\(\s*['"]fs['"]\s*\)/i, // File system access
        /eval\s*\(/i, // Eval (code injection)
        /Function\s*\(/i, // Dynamic function creation
      ],
      python: [
        /import\s+os/i, // OS module
        /import\s+sys/i, // System module
        /__import__/i, // Dynamic imports
        /exec\s*\(/i, // Exec (code injection)
      ],
      java: [
        /import\s+java\.io\.File/i, // File I/O
        /import\s+java\.net/i, // Network access
      ],
    };

    // Check global forbidden patterns
    for (const pattern of forbiddenPatterns.all) {
      if (pattern.test(code)) {
        throw new Error(`Forbidden operation detected: ${pattern.source}`);
      }
    }

    // Check language-specific patterns
    const langPatterns = forbiddenPatterns[language.toLowerCase()] || [];
    for (const pattern of langPatterns) {
      if (pattern.test(code)) {
        throw new Error(
          `Forbidden ${language} operation detected: ${pattern.source}`
        );
      }
    }

    // Code length limit (prevent DoS via massive code)
    if (code.length > 50000) {
      // 50KB
      throw new Error("Code exceeds maximum length (50KB)");
    }

    return true;
  }
}

// Export singleton instance
const secureExecutor = new SecureCodeExecutor();

module.exports = {
  SecureCodeExecutor,
  secureExecutor,
};
