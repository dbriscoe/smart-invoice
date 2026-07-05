# Smart Invoice Builder - Truffle & Scent v11

Static GitHub Pages invoice app for Truffle & Scent By Lee.

Version 11 fixes the PDF export issue where multiline FROM, TO, NOTES, and PAYMENT METHOD content collapsed onto one line. The app uses normal multiline text fields on screen, then converts them to print-safe blocks during PDF export so line breaks are preserved.

Included updates:

- Supplied Truffle & Scent logo as the default logo.
- DTI BN No. 8301368 and TIN: 807-789-743-000 in the FROM block.
- Larger auto-expanding address boxes so the TIN line is not cut off.
- Desktop and PDF layout keeps FROM and TO side by side.
- Signature image upload works from the signature box and the uploaded signature is included in the PDF export.
- Local `vendor/` copies of html2canvas and jsPDF, so PDF export does not depend on CDN access.
