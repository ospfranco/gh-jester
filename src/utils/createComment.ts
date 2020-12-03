import { GitHubContext } from './GithubContext';
import { github } from './Github';
import * as core from '@actions/core';

export async function createComment<E>({
  context,
  comment
}: {
  context: GitHubContext<E>;
  comment: string;
}) {
  const [owner, repo] = context.repository.split('/');
  try {
    core.info(`trying to post comment: ${comment}, sha: ${context.sha}`);
    const res = await github.repos.createCommitComment({
      body: comment,
      commit_sha: context.sha,
      owner,
      repo
    });

    core.info(`Tried to post to PR: ${JSON.stringify(res, null, 4)}`)
  } catch(error) {
    core.info(`could not post comment, ${error}`)
  }
}