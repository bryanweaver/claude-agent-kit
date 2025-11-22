import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

    const absoluteSrc = path.resolve(src);
    const absoluteTemplateDir = path.resolve(templateDir);

    // Normalize paths for cross-platform comparison (Windows/Unix)
    const normalizedSrc = absoluteSrc.replace(/\\/g, '/').toLowerCase();
    const normalizedTemplateDir = absoluteTemplateDir.replace(/\\/g, '/').toLowerCase();

    if (!normalizedSrc.startsWith(normalizedTemplateDir)) {
      throw new Error('Security: Source file must be within templates directory');
    }

    // Defense-in-depth: Validate destination is within .claude directory
    const absoluteDest = path.resolve(dest);
    const claudeDirPattern = /[/\\]\.claude[/\\]/;

    if (!claudeDirPattern.test(absoluteDest)) {
      throw new Error('Security: Destination must be within .claude directory');
    }

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
}
