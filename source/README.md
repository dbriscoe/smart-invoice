# Smart Invoice Builder — Truffle & Scent by Lee

GitHub-ready invoice app built from v5.

## v8 fixes

- New Truffle & Scent logo included as the default invoice logo.
- Sender block now includes:
  - DTI BN No. 8301368
  - TIN: 807-789-743-000
- The app now forcibly normalises older Truffle & Scent invoices saved in browser storage, including invoices where the old DTI/address line was merged together.
- Built GitHub Pages output is supplied at the zip root, so GitHub Pages serves the corrected app directly.
- Asset paths are relative so the app works from a GitHub Pages repository path or from the site root.

## Deploy

Upload the files from this zip to the GitHub repository used for the invoice app. The corrected deployment files are at the root of the zip.

Source files are retained in the `source/` folder for future editing.
