
export type TriggerEvent =
  | 'check_run'
  | 'check_suite'
  | 'commit_comment'
  | 'create'
  | 'delete'
  | 'deployment'
  | 'deployment_status'
  | 'fork'
  | 'gollum'
  | 'issue_comment'
  | 'issues'
  | 'label'
  | 'member'
  | 'milestone'
  | 'page_build'
  | 'project'
  | 'project_card'
  | 'project_culumn'
  | 'public'
  | 'pull_request'
  | 'pull_request_review_comment'
  | 'push'
  | 'repository_dispatch'
  | 'release'
  | 'schedule'
  | 'status'
  | 'watch';

export interface GitHubContext<E> {
  ref: string;
  repository: string;
  repositoryUrl: string;
  sha: string;
  actor: string;
  workflow: string;
  head_ref: string;
  base_ref: string;
  event_name: TriggerEvent;
  workspace: string;
  action: string;
  event_path: string;
  event: E;
}