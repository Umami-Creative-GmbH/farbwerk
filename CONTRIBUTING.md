# Contributing to Farbwerk

Thanks for helping improve Farbwerk. Contributions to code, documentation,
translations, accessibility, and bug reports are welcome.

## Getting Started

1. Fork the repository and create a branch for your change.
2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun run dev
   ```

## Before Opening a Pull Request

Keep changes focused and explain their purpose in the pull request. Before
submitting, run the relevant checks:

```bash
bun run test
bun run typecheck
bun run check
bun run build
```

Use `bun run fix` to apply the project's automatic formatting and lint fixes.

## Quality Tools

Farbwerk uses [Ultracite](https://www.ultracite.dev/) for formatting and
linting. Run `bun run check` before submitting a pull request, or `bun run fix`
to apply automatic fixes.

Use `bun run doctor` to run React Doctor diagnostics when working on React code.

## Issues

For bugs, describe the expected and actual behavior, include clear reproduction
steps, and provide screenshots when the issue affects the interface. For larger
changes, open an issue first so the approach can be discussed.

Do not report security vulnerabilities in public issues. Follow the process in
[SECURITY.md](SECURITY.md) instead.

## Licensing

Only submit work that you have the right to contribute. Contributions must be
compatible with Farbwerk's [AGPLv3 license](LICENSE.md).
