import * as core from '@actions/core';
import { GitHubContext } from './GithubContext';
import { github } from './Github';
import { Result } from './Result';

const statusContext = 'GH Jester';

export async function setStatus<E>({
  context,
  description,
  step,
  target_url,
  state
}: {
  context: GitHubContext<E>;
  description?: string;
  step: string;
  target_url?: string;
  state: 'pending' | 'success' | 'failure';
}) {
  const [owner, repo] = context.repository.split('/');
  const sha = context.sha;

  await github.repos.createCommitStatus({
    context: `${statusContext}/${step}`,
    owner,
    repo,
    description,
    sha,
    state,
    target_url
  });
}

export async function getStatus<E>({
  context,
  step
}: {
  context: GitHubContext<E>;
  step: string;
}) {
  const [owner, repo] = context.repository.split('/');

  const listOfStatuses = await github.repos.listCommitStatusesForRef({
    owner,
    repo,
    ref: context.sha
  });

  return listOfStatuses.data.find(
    status => status.context === `${statusContext}/${step}`
  );
}

export async function wrapWithSetStatus<T>(
  context: GitHubContext<any>,
  step: string,
  code: () => Promise<Result<T>>
) {
  await setStatus({
    context,
    step,
    description: `Running ${step}`,
    state: 'pending'
  });
  core.info(`Setting status to pending`);

  try {
    const result = await code();
    await setStatus({
      context,
      step,
      description: result.shortText,
      state: result.isOkay ? 'success' : 'failure'
    });
    core.info(`Setting status to ${result.isOkay ? 'success' : 'failure'}`);
    return result;
  } catch (error) {
    await setStatus({
      context,
      step,
      description: `Failed: ${step}`,
      state: 'failure'
    });
    core.info(`SOMETHING WENT WRONG ${error}`)
    core.info(`Setting status to failure`);
    core.setFailed(`CI failed at step: ${step}`);
  }
}