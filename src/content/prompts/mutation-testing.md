Task: check whether existing tests detect realistic bugs in one critical behaviour, using mutation testing.

A mutation is a small, deliberate fault in production code. A mutant is the resulting faulty version. Use these temporary changes to find and repair gaps in tests, then restore the original implementation.

## Scope and prerequisites

- Read repository instructions first. If tests or temporary code changes are forbidden, stop and explain the conflict. Do not bypass project rules.
- Choose one critical behaviour in one module, touching at most three production files. Prefer calculations, validation, permissions or error handling with clear requirements and existing tests. Explain the risk and the expected behaviour using requirements, public contracts and real callers, rather than copying the implementation into assertions.
- Limit the session to five candidate mutations and three added or changed test cases. Aim for three to five useful mutations, but use fewer when fewer are meaningful. Do not invent faults to meet a quota. Spend at most 45 minutes; stop at any limit, restore the code and report unfinished work.
- Use the existing language, test runner and dependencies. Make manual edits for this small sample, or use a mutation tool already configured for the project. Do not install a mutation framework, change CI or scan the entire repository.
- Keep architecture, public behaviour and unrelated tests unchanged. Test cleanup belongs outside this task unless it directly repairs a demonstrated gap.

## 1. Establish a baseline

Inspect the working tree and record the exact starting contents of every production file you will touch, including uncommitted edits. Keep a recoverable copy outside the committed deliverable, following repository conventions. Never overwrite someone else's changes or use a blanket reset to restore a mutation.

Find the smallest existing test command that exercises the selected behaviour. Run it against the unmodified code; record the command, executed tests and result. A run with zero tests, skipped target tests, unresolved failures or unstable results is not a usable baseline. If you cannot obtain a reliable baseline within scope, stop without mutating and report the blocker. If the behaviour has no relevant existing tests, report that gap and stop rather than building a new test setup.

Choose a timeout for each run based on the baseline duration. Plan how you will restore each edit even if a run fails, times out or is interrupted. Use isolated local test data; do not run faulty code against production or shared services.

## 2. Select plausible faults

List each candidate with its location, exact change, affected requirement and a concrete input or scenario that should distinguish it from the original. For example, change an inclusive boundary to an exclusive one, invert a permission check, omit a required calculation term or return a plausible wrong fallback.

Each mutation must compile or load and represent a credible regression. Exclude formatting, comments, names, cosmetic text, dead or generated code, dependencies, and changes to tests or their configuration. Do not introduce syntax errors, unconditional crashes, arbitrary constants or broad deletions just to force a red run. Avoid multiple candidates that exercise the same fault without adding information.

A mutation with identical observable behaviour for all supported inputs is equivalent and cannot expose a test gap. Give evidence before classifying one as equivalent; uncertainty or passing tests alone is not evidence. Record rejected candidates within the five-candidate limit.

If no useful candidate remains, report the task as blocked rather than claiming the tests are effective.

## 3. Run one mutation at a time

For each eligible candidate:

1. Start from the recorded original production code. Apply only this mutation and record its diff. Ensure the runner executes the changed code: rebuild when necessary and avoid stale build output or cached test results.
2. Run the same focused tests with the same configuration and record what actually executed. Classify the result:
   - **Killed:** a named test fails because it observes the intended behavioural regression. Record the failing assertion or relevant failure evidence. A failure in unrelated setup is not a kill.
   - **Survived:** the relevant tests execute and pass despite the fault. Investigate whether the input, branch, assertion or mock hides the changed behaviour. If the mutated path is not exercised, record that specifically as a coverage gap.
   - **Invalid:** compilation, parsing, discovery or runner setup fails. Record the reason; this says nothing about test sensitivity.
   - **Inconclusive:** timeout, flaky failure, infrastructure issue or uncertain execution. Do not count this as a kill. Diagnose only within the session limits.
3. Restore the exact original production contents immediately, including on failure or interruption. Confirm the mutation is gone and rerun the same command. If the original now fails, stop the experiment and investigate the baseline within scope; the mutant's result is unreliable until resolved.

Never stack mutations or leave one active while editing tests.

## 4. Repair demonstrated gaps

For each meaningful survivor, establish the expected outcome independently of the current implementation. If the contract is ambiguous, report the question rather than inventing a requirement. Strengthen or add the smallest behaviour-focused test case that observes the missing boundary, result, error or side effect. Fix mocks only where they hide the real contract. Do not assert source text or private implementation details, weaken existing checks, delete tests or update snapshots just to get a desired result.

Use a property-based test, which checks a rule across generated inputs, only if the project already supports it and that rule makes the gap clearer. Ordinary examples are sufficient.

For every repair, demonstrate the same sequence with the updated tests: original code passes; the exact surviving mutation causes the intended test failure; restored original code passes again. Reuse the original candidate rather than substituting an easier fault. If all useful mutations were already killed, leave the tests unchanged.

If a real implementation defect appears, restore the mutation, document the defect separately and stop work on that behaviour. Do not mix a production fix into this experiment.

## 5. Restore, verify and report

Compare every touched production file with its recorded starting contents. They must match exactly, preserving pre-existing edits. Remove temporary mutants, copies, configuration and generated artifacts created by the experiment. Keep only justified test improvements and any report required by repository conventions.

If tests changed, confirm that every useful candidate is killed by the final tests, repeating the isolated mutation and restoration cycle where earlier evidence predates the last test edit. Then run the focused tests and the repository's required checks on the restored code, using a broader existing test command when appropriate. Report commands and actual results, including any checks you could not complete.

Provide a compact evidence table: mutation and location; distinguishing scenario; initial result and evidence; test change, if any; result after repair; restoration confirmation. List equivalent or invalid candidates and their reasons separately from useful mutations. Report counts rather than a repository-wide quality score; this deliberately small sample cannot establish overall test effectiveness.

The task is complete only when:

- The chosen behaviour and candidate list stay within the stated limits, at least one useful mutation was executed, and every attempted mutation has an evidenced result.
- Every valid, behaviour-changing mutation in the sample is killed by existing or improved tests for the intended reason. There are no unexplained survivors or inconclusive results.
- Each test improvement passes on the original and demonstrably fails on the corresponding faulty version.
- Production files match their starting contents, temporary artifacts are removed, and final required checks pass.

If a blocker, uncertain contract, unresolved survivor or session limit prevents these conditions, restore everything first and label the result partial or blocked. State the exact remaining gap and next step. A cleanly reported blocker is preferable to a fabricated success.
