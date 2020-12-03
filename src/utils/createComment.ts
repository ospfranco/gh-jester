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
    await github.repos.createCommitComment({
      body: comment,
      commit_sha: context.sha,
      owner,
      repo
    });
  } catch(error) {
    core.info(`could not post comment, ${error}`)
  }
}