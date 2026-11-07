# Example assignment: adapt this environment to a project

This is an assignment example, not authorization to change tooling policy.

## Objective

Replace the neutral verification fixture with the project's first useful behavior while retaining the extracted development environment.

## Requirements and boundaries

- Inspect the existing configuration and commands first.
- Choose the simplest implementation within the requested project scope.
- Replace fixture-specific assertions with focused behavior tests.
- Adapt scan paths when maintained code moves; preserve rules, thresholds, and report semantics unless a change is explicitly requested.
- Do not add dependencies or change the environment without approval.

## Acceptance criteria

- The requested project behavior has focused tests.
- Maintained code is covered by the documented checks.
- `npm run format` and `npm run check:report` have been executed; failures and limitations are reported rather than bypassed.
- Relevant behavior decisions and verification results are summarized for review.
