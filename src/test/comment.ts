import { TestResult } from './parseTests';
import { Result } from '../utils';

export function createCommentText(results: Result<TestResult>) {
  return `\n## test summary
${results.text}`;
}
