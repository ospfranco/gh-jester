# ospfranco/gh-jester

Run jest tests, add annotations to failing tests. By default it runs `npm run test:ci` but it can be configured: `npm run ${command}`.

# Versions

You can use a specific `version` of this action. The latest published version is `v1.1.6`. You can also use `latest` to always get the latest version.

# Example job

```yml
on: push

test:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout latest code
      uses: actions/checkout@v2
    - name: Use Node.js 12.x
      uses: actions/setup-node@v2.1.2
      with:
        node-version: 12.x
    - name: Run npm install
      run: npm install
    - name: Run tests
      uses: ospfranco/gh-jester@v1.0.12
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
```

> **Attention** Do not forget to pass the `GITHUB_TOKEN` and `GITHUB_CONTEXT` to the `ospfranco/gh-jester` action

Steps the example job will perform:

1. Check out the latest code
2. Use node v12
3. Run `npm install`
4. (this action) Run the tests, add the annotations and add a status to the commit

# Usage

The action will call `npm run ${command}`. The `${command}` can be specified by passing an input variable `command` to the action. It defaults to `test:ci`. 

Your `test:ci` command should look like this:

```
test:ci: jest --testLocationInResults --ci --outputFile=test_results.json --json
```

<!-- The action will set a status to the commit to `pending` under the context `Tangro CI/coverage`. When it finishes it will set the test result as the description of the status. -->

It is also possible that the action posts a comment with the result to the commit. You have to set `post-comment` to `true`.

Additionally the test results get written to `./test_result/index.html`. This file can be deployed to a static file server and be linked inside a status.

It is important that your trigger is `push` and not other triggers, since a specific SHA is used to post a comment into the commit

## Example with a different command

```yml
- name: Run tests
  uses: ospfranco/gh-jester@v1.0.12
  with:
    command: 'tests'
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_CONTEXT: ${{ toJson(github) }}
```

## Example with posting the result as a comment

```yml
- name: Run tests
  uses: ospfranco/gh-jester@v1.0.12
  with:
    post-comment: true
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_CONTEXT: ${{ toJson(github) }}
```
