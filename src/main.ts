import * as core from '@actions/core';
import { wrapWithSetStatus, createComment, GitHubContext } from './utils'
import path from 'path';
import { createChecksFromTestResults } from './test/checkRun';
import { executeTests } from './test/runTest';
import { parseTests } from './test/parseTests';
import { FormattedTestResults } from '@jest/test-result/build/types';

async function run() {
  const githubContextString = process.env.GITHUB_CONTEXT ?? '';
  const githubToken = process.env.GITHUB_TOKEN as string;
  const runnerWorkspace = process.env.RUNNER_WORKSPACE as string;

  try {
    if (!githubContextString) {
      throw new Error('Missing GITHUB_CONTEXT in step config');
    }

    if (!githubToken) {
      throw new Error('Missing GITHUB_TOKEN in step config');
    }

    const context = JSON.parse(githubContextString) as GitHubContext<{}>;
    const [_, repo] = context.repository.split('/');
    const pathToTestOutput = path.join(
      runnerWorkspace,
      repo,
      'test_results.json'
    );

    await executeTests();

    const testSummary = await wrapWithSetStatus(context, 'test', async () => {
      const testResults = await createChecksFromTestResults({
        pathToTestOutput,
        context
      });
      
      const formattedTestResults = require(pathToTestOutput) as FormattedTestResults;
      const testSummary = parseTests(formattedTestResults);

      if (testResults.numFailedTestSuites > 0) {
        core.setFailed('Tests failed. See details.');
      }
      
      return testSummary;
    });

    if (core.getInput('post-comment') === 'true' && testSummary) {
      await createComment({
        context,
        comment: testSummary.text
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
