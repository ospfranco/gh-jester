import { GitHubContext } from './GithubContext';
import { github } from './Github';

export async function createComment<E>({
  context,
  comment
}: {
  context: GitHubContext<E>;
  comment: string;
}) {
  const [owner, repo] = context.repository.split('/');

  await github.repos.createCommitComment({
    body: comment,
    commit_sha: context.sha,
    owner,
    repo
  });
}