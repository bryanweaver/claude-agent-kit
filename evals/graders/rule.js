/**
 * Rule-based grader. Cheap, deterministic, no API calls.
 *
 * Checks supported in case.expected:
 *   must_classify_as:   one of CRITICAL | WARNING | NOTE (case-insensitive match in output)
 *   must_mention:       array of substrings that must all appear in the output
 *   must_not_mention:   array of substrings that must NOT appear
 *   max_words:          integer; output word count must be <= this
 *   min_words:          integer; output word count must be >= this
 *   regex_match:        array of regex source strings; each must match the output
 *
 * Returns { pass: boolean, score: 0..1, failures: string[] }
 */

function countWords(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function grade(output, expected) {
  const failures = [];
  const checks = [];

  if (expected.must_classify_as) {
    checks.push('must_classify_as');
    const wanted = expected.must_classify_as.toUpperCase();
    // Match the classification label as a section header or inline mention.
    // Allow optional plural so "WARNING" matches both "Warning" and "Warnings".
    const found = new RegExp(`\\b${wanted}S?\\b`, 'i').test(output);
    if (!found) {
      failures.push(`Output must classify as ${wanted}; not found in output`);
    }
  }

  if (Array.isArray(expected.must_mention)) {
    for (const phrase of expected.must_mention) {
      checks.push(`must_mention:${phrase}`);
      if (!output.toLowerCase().includes(phrase.toLowerCase())) {
        failures.push(`Output must mention "${phrase}"`);
      }
    }
  }

  if (Array.isArray(expected.must_not_mention)) {
    for (const phrase of expected.must_not_mention) {
      checks.push(`must_not_mention:${phrase}`);
      if (output.toLowerCase().includes(phrase.toLowerCase())) {
        failures.push(`Output must NOT mention "${phrase}"`);
      }
    }
  }

  if (typeof expected.max_words === 'number') {
    checks.push('max_words');
    const n = countWords(output);
    if (n > expected.max_words) {
      failures.push(`Output is ${n} words; max ${expected.max_words}`);
    }
  }

  if (typeof expected.min_words === 'number') {
    checks.push('min_words');
    const n = countWords(output);
    if (n < expected.min_words) {
      failures.push(`Output is ${n} words; min ${expected.min_words}`);
    }
  }

  if (Array.isArray(expected.regex_match)) {
    for (const src of expected.regex_match) {
      checks.push(`regex_match:${src}`);
      if (!new RegExp(src).test(output)) {
        failures.push(`Output must match /${src}/`);
      }
    }
  }

  const total = checks.length || 1;
  const passed = total - failures.length;
  return {
    pass: failures.length === 0,
    score: passed / total,
    checks_total: total,
    checks_passed: passed,
    failures,
  };
}
