import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { getGlobalClaudeDir } from './file-operations.js';

/**
 * Detect if Claude Code CLI is installed and get version info
 * @returns {Object} Detection result with cliInstalled, cliVersion, and configExists
 */
export function detectClaudeCode() {
  const result = {
    cliInstalled: false,
    cliVersion: null,
    configExists: false
  };

  // Check if 'claude' CLI is in PATH
  // SECURITY: This command is hardcoded and safe.
  // NEVER use execSync with user-controlled input without proper escaping.
  try {
    const version = execSync('claude --version', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    }).trim();
    result.cliInstalled = true;
    result.cliVersion = version;
  } catch {
    // CLI not found or command failed
    result.cliInstalled = false;
  }

  // Check if ~/.claude/ directory exists (indicates Claude Code has been used)
  try {
    result.configExists = existsSync(getGlobalClaudeDir());
  } catch {
    result.configExists = false;
  }

  return result;
}

/**
 * Get Claude Code installation instructions based on platform
 * @returns {Object} Installation instructions
 */
export function getInstallInstructions() {
  const platform = process.platform;

  return {
    npm: 'npm install -g @anthropic-ai/claude-code',
    docs: 'https://docs.anthropic.com/en/docs/claude-code',
    platform: platform === 'win32' ? 'Windows' : platform === 'darwin' ? 'macOS' : 'Linux'
  };
}
