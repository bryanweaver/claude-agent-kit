import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { realpath } from 'fs/promises';

/**
 * Ensure a directory exists, creating it if necessary
 * @param {string} dirPath - Directory path to ensure exists
 */
export async function ensureDir(dirPath) {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Validate that a destination path is within a .claude directory
 * @param {string} absoluteDest - Absolute destination path
 * @throws {Error} If path is not within .claude or contains traversal
 */
function validateClaudeDestination(absoluteDest) {
  const normalizedDest = absoluteDest.split(path.sep).join('/');

  // Check if path contains .claude directory
  const claudeIndex = normalizedDest.lastIndexOf('/.claude/');
  if (claudeIndex === -1) {
    // Also check for Windows paths or paths ending with .claude
    const winClaudeIndex = normalizedDest.lastIndexOf('\\.claude\\');
    const endsWithClaude = normalizedDest.endsWith('/.claude') || normalizedDest.endsWith('\\.claude');
    if (winClaudeIndex === -1 && !endsWithClaude) {
      throw new Error('Security: Destination must be within .claude directory');
    }
  }

  // Ensure no path traversal after .claude
  const afterClaude = claudeIndex !== -1
    ? normalizedDest.substring(claudeIndex + 9)
    : normalizedDest.substring(normalizedDest.lastIndexOf('.claude') + 7);

  if (afterClaude.includes('..')) {
    throw new Error('Security: Path traversal not allowed');
  }
}

/**
 * Copy a file from source to destination
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 */
export async function copyFile(src, dest) {
  try {
    // Defense-in-depth: Validate source is within templates directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templateDir = path.join(__dirname, '../templates');

    // Resolve symlinks BEFORE validation to prevent symlink attacks
    let absoluteSrc;
    let absoluteTemplateDir;
    try {
      absoluteSrc = await realpath(src);
      absoluteTemplateDir = await realpath(templateDir);
    } catch {
      // If realpath fails (file doesn't exist), fall back to resolve
      absoluteSrc = path.resolve(src);
      absoluteTemplateDir = path.resolve(templateDir);
    }

    // Use path.relative to ensure src is actually inside the templates directory
    // This prevents prefix collision attacks (e.g., templates-bak/file.js)
    const relativeSrc = path.relative(absoluteTemplateDir, absoluteSrc);
    if (relativeSrc.startsWith('..') || path.isAbsolute(relativeSrc)) {
      throw new Error('Security: Source file must be within templates directory');
    }

    // Defense-in-depth: Validate destination is within .claude directory
    const absoluteDest = path.resolve(dest);
    validateClaudeDestination(absoluteDest);

    await fs.copy(src, dest, { overwrite: true });
  } catch (error) {
    throw new Error(`Failed to copy ${src} to ${dest}: ${error.message}`);
  }
}

/**
 * List all files in a directory with a specific extension
 * @param {string} dirPath - Directory to search
 * @param {string} extension - File extension to filter (e.g., '.md', '.js')
 * @returns {Promise<string[]>} Array of file names
 */
export async function listFiles(dirPath, extension = '') {
  try {
    const files = await fs.readdir(dirPath);
    return extension
      ? files.filter(file => file.endsWith(extension))
      : files;
  } catch (error) {
    throw new Error(`Failed to list files in ${dirPath}: ${error.message}`);
  }
}

/**
 * List all subdirectories in a directory
 * @param {string} dirPath - Directory to search
 * @returns {Promise<string[]>} Array of directory names
 */
export async function listDirs(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    throw new Error(`Failed to list directories in ${dirPath}: ${error.message}`);
  }
}

/**
 * Copy an entire directory from source to destination
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 */
export async function copyDir(src, dest) {
  try {
    // Defense-in-depth: Validate source is within templates directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templateDir = path.join(__dirname, '../templates');

    // Resolve symlinks BEFORE validation to prevent symlink attacks
    let absoluteSrc;
    let absoluteTemplateDir;
    try {
      absoluteSrc = await realpath(src);
      absoluteTemplateDir = await realpath(templateDir);
    } catch {
      // If realpath fails (directory doesn't exist), fall back to resolve
      absoluteSrc = path.resolve(src);
      absoluteTemplateDir = path.resolve(templateDir);
    }

    // Use path.relative to ensure src is actually inside the templates directory
    // This prevents prefix collision attacks (e.g., templates-bak/dir)
    const relativeSrc = path.relative(absoluteTemplateDir, absoluteSrc);
    if (relativeSrc.startsWith('..') || path.isAbsolute(relativeSrc)) {
      throw new Error('Security: Source directory must be within templates directory');
    }

    // Defense-in-depth: Validate destination is within .claude directory
    const absoluteDest = path.resolve(dest);
    validateClaudeDestination(absoluteDest);

    await fs.copy(src, dest, { overwrite: true });
  } catch (error) {
    throw new Error(`Failed to copy directory ${src} to ${dest}: ${error.message}`);
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the home directory path
 * @returns {string} Home directory path
 */
export function getHomeDir() {
  return os.homedir();
}

/**
 * Get the global Claude directory path
 * @returns {string} Path to ~/.claude/
 */
export function getGlobalClaudeDir() {
  return path.join(getHomeDir(), '.claude');
}

/**
 * Get the project-local Claude directory path
 * @returns {string} Path to ./.claude/
 */
export function getProjectClaudeDir() {
  return path.join(process.cwd(), '.claude');
}

/**
 * Create all standard Claude subdirectories
 * @param {string} claudeDir - Base Claude directory path
 */
export async function createClaudeStructure(claudeDir) {
  await ensureDir(path.join(claudeDir, 'agents'));
  await ensureDir(path.join(claudeDir, 'commands'));
  await ensureDir(path.join(claudeDir, 'hooks'));
  await ensureDir(path.join(claudeDir, 'skills'));
}

/**
 * Write content to a file
 * @param {string} filePath - Path to write to
 * @param {string} content - Content to write
 */
export async function writeFile(filePath, content) {
  try {
    // Defense-in-depth: Validate destination is within .claude directory
    const absoluteDest = path.resolve(filePath);
    validateClaudeDestination(absoluteDest);

    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}
