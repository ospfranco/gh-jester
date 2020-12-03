import { FormattedTestResults } from '@jest/test-result/build/types';
import { GitHubContext, getCheckRunForAction, updateCheckRun } from '../utils';
import { parseTests } from './parseTests';

function chunkArray<T>(
  inputArray: Array<T>,
  chunkSize: number
): Array<Array<T>> {
  return inputArray.reduce(
    (resultArray: Array<Array<T>>, item: T, index: number) => {
      const chunkIndex = Math.floor(index / chunkSize);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    },
    []
  );
}

function parseTestOutput(testResults: FormattedTestResults) {
  if (testResults.numFailedTestSuites > 0) {
    const testSuitesWithFailingTests = testResults.testResults.filter(
      suite => suite.status === 'failed'
    );

    return testSuitesWithFailingTests
      .map(suite => {
        const failingTests = suite.assertionResults.filter(
          test => test.status === 'failed'
        );
        return failingTests.map(test => {
          return {
            title: test.ancestorTitles.join(' > ') + ' > ' + test.title,
            failureMessages: (test.failureMessages || []).join('\n\n'),
            location: test.location,
            path: suite.name ?? 'NO_NAME'
          };
        });
      })
      .flat();
  } else {
    return [];
  }
}

export async function createChecksFromTestResults({
  pathToTestOutput,
  context
}: {
  pathToTestOutput: string;
  context: GitHubContext<{}>;
}): Promise<FormattedTestResults> {
  const [owner, repo] = context.repository.split('/');

  const formattedTestResults = require(pathToTestOutput) as FormattedTestResults;

  // const checkRun = await getCheckRunForAction({
  //   context
  // });

  const testResults = parseTestOutput(formattedTestResults);

  // GitHub only allows to send 50 checks at a time
  const chunkedTestResults = chunkArray(testResults, 50);
  const testSummary = parseTests(formattedTestResults);

  for (const chunk of chunkedTestResults) {
    const checks = {
      title: 'Test results',
      summary: testSummary.text,
      annotations: chunk.map(testResult => {
        return {
          path: testResult.path.replace(
            `${process.env.RUNNER_WORKSPACE as string}/${repo}/`,
            ''
          ),
          start_line: testResult.location!.line,
          end_line: testResult.location!.line,
          annotation_level: 'failure' as 'failure',
          title: testResult.title,
          message: testResult.failureMessages
        };
      })
    };

    // await updateCheckRun({
    //   context,
    //   checkRunId: checkRun.id,
    //   name: checkRun.name || 'NO_NAME',
    //   checks
    // });
  }

  return formattedTestResults;
}
