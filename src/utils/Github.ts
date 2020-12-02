import { getOctokit } from '@actions/github';

if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN.length === 0) {
  throw new Error(
    `You have to provide the GITHUB_TOKEN inside your secrets configuration and provide it as an env variable`
  );
}

export const github = getOctokit(process.env.GITHUB_TOKEN as string);