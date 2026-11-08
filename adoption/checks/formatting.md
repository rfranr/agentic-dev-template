# Formatting

## Detect

Inspect Prettier dependencies, configuration, ignore files, editor/CI integration,
and format/check commands, including their file globs.

## Reconcile

Compare with `../staging/.prettierrc.json` and staged package commands after bootstrap
(template sources: `.prettierrc.json` and `package.json`). Existing Prettier coverage
and approved style satisfy this capability; template style is not a mandate.
Explain conflicts with lint or other formatters before proposing changes.

## Apply

After approval, merge only missing configuration and commands, add the staged
`prettier` dependency if absent, and adapt globs/exclusions to maintained project files.
Retain existing style and avoid unrelated mass reformatting.

## Verify

Run the approved format command and its check-only counterpart (template:
`npm run format`, `npm run format:check`). Review the diff and report excluded formats
or directories and any formatter/linter disagreement.

## Repeatability

If configuration, coverage, and commands already satisfy policy, leave them untouched;
do not reinstall or reformat merely because adoption was requested again.
