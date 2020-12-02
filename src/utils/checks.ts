import { GitHubContext } from './GithubContext';
import { github } from './Github';
import * as core from '@actions/core';

export async function getCheckRunForAction<E>({
  context
}: {
  context: GitHubContext<E>;
}) {
  const ref = context.ref;
  const [owner, repo] = context.repository.split('/');

  const checkRunsResponse = await github.checks.listForRef({
    owner,
    repo,
    ref,
    status: 'in_progress'
  });

  const str = JSON.stringify(checkRunsResponse, null, 4);
  core.info(`ROPO, CHECK RUNS RESPONSE, ${str}`);

  if (checkRunsResponse?.data!.check_runs!.length === 0) {
    throw new Error(`Could not find check run for action: ${name}`);
  } else {
    const checkRun = checkRunsResponse?.data?.check_runs?.find(run => {

      core.info(`iterating run: ${run}`)
      

      return run.name?.includes('test')
    }
    );
    if (!checkRun) {
      console.log(JSON.stringify(checkRunsResponse.data, null, 2));
      throw new Error(`Could not find check run in: runs`);
    } else return checkRun;
  }
}

export async function updateCheckRun<E>({
  context,
  checkRunId,
  name,
  checks
}: {
  context: GitHubContext<E>;
  checkRunId: number;
  name: string;
  checks: any; // we cannot get the correct types from the actions package. that's why we opt for any
}) {
  const [owner, repo] = context.repository.split('/');

  return github.checks.update({
    owner,
    repo,
    check_run_id: checkRunId,
    name: name,
    output: checks
  });
}