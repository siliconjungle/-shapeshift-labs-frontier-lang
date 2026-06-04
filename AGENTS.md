# Frontier Lang Agent Notes

This repository is the standalone package for `@shapeshift-labs/frontier-lang`.

- Keep the package dependency-light. The semantic source kernel should run in Node and browser runtimes without forcing compiler targets or host adapters into the root import.
- Treat generated JavaScript and TypeScript as projections, not as the canonical source model.
- Do not commit release credentials, npm tokens, `.env`, temporary npm configs, generated tarballs, or local build output.
- Preserve the core loop in tests: semantic source graph -> patch/replay -> merge classification -> TypeScript emission.
