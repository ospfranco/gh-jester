import { FormattedTestResults } from '@jest/test-result/build/types';
import { Result } from '../utils';

export interface TestResult {
  testSuites: {
    failed: number;
    passed: number;
    skipped: number;
    total: number;
  };
  tests: {
    failed: number;
    passed: number;
    skipped: number;
    total: number;
  };
  snapshots: {
    failed: number;
    passed: number;
    total: number;
  };
  all: FormattedTestResults;
}

export const parseTests = (
  testResult: FormattedTestResults
): Result<TestResult> => {
  const testSuites = {
    failed: testResult.numFailedTestSuites,
    passed: testResult.numPassedTestSuites,
    skipped: testResult.numPendingTestSuites,
    total: testResult.numTotalTestSuites
  };

  const tests = {
    failed: testResult.numFailedTests,
    passed: testResult.numPassedTests,
    skipped: testResult.numPendingTests,
    total: testResult.numTotalTests
  };

  const snapshots = {
    passed: testResult.snapshot.matched,
    failed: testResult.snapshot.total - testResult.snapshot.matched,
    total: testResult.snapshot.total
  };

  const failures: string[] = []
  testResult.testResults.forEach((suiteResult) => {
    suiteResult.assertionResults.forEach((assertionResult) => {
      if(assertionResult.status === 'failed') {
        const runnerWorkspace = process.env.RUNNER_WORKSPACE as string;
        const suiteName = suiteResult.name.replace(runnerWorkspace, '')

        failures.push(`❌ ${suiteName} -> **${assertionResult.title}**`)
      }
    })
  })



  return {
    metadata: {
      testSuites,
      tests,
      snapshots,
      all: testResult
    },
    isOkay: testResult.success,
    shortText: '',
    text: `## Failing tests!!!
    
    ${failures.slice(0, 50).join('\n')}
    
    ${failures.length > 50 ? '*Showing only first 20 errors, go check the logs the complete output*' : ''}
    `
  };
};
