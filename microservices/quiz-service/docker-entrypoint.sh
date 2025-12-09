#!/bin/bash
set -e

# Docker entrypoint for sandboxed code execution
# Usage: docker run sandbox-executor <language> <code_file> <input_file>

LANGUAGE=$1
CODE_FILE=$2
INPUT_FILE=$3

# Timeout (seconds)
TIMEOUT=10

# Memory limit (handled by docker run --memory flag)
# CPU limit (handled by docker run --cpus flag)

execute_code() {
    case $LANGUAGE in
        javascript|js)
            timeout $TIMEOUT node "$CODE_FILE" < "$INPUT_FILE"
            ;;
        python)
            timeout $TIMEOUT python3 "$CODE_FILE" < "$INPUT_FILE"
            ;;
        java)
            # Extract class name from file
            CLASS_NAME=$(basename "$CODE_FILE" .java)
            timeout $TIMEOUT javac "$CODE_FILE" && \
            timeout $TIMEOUT java "$CLASS_NAME" < "$INPUT_FILE"
            ;;
        cpp|c++)
            timeout $TIMEOUT g++ -o /sandbox/program "$CODE_FILE" && \
            timeout $TIMEOUT /sandbox/program < "$INPUT_FILE"
            ;;
        c)
            timeout $TIMEOUT gcc -o /sandbox/program "$CODE_FILE" && \
            timeout $TIMEOUT /sandbox/program < "$INPUT_FILE"
            ;;
        *)
            echo "Unsupported language: $LANGUAGE"
            exit 1
            ;;
    esac
}

# Execute with error handling
if execute_code; then
    exit 0
else
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 124 ]; then
        echo "Error: Execution timeout exceeded (${TIMEOUT}s)"
    fi
    exit $EXIT_CODE
fi
