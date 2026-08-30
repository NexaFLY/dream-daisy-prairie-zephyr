"""Static Netlify Drop packer.

The live site (TanStack / React) is the source of truth. This module used to
emit the HTML drop folder; the nUSD page now lives in src/routes/nusd.tsx
with the same copy and brand tokens.
"""


def main() -> None:
    raise SystemExit("Use the live nUSD page at /nusd — static drop rebuild is not run from here.")


if __name__ == "__main__":
    main()
