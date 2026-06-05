# Security Policy

Pinpoint is a **local-first, browser-only** application. It has no backend
server, no database, and no API that receives user data. Assessment answers stay
in the user's browser and are never transmitted (see
[`docs/PRIVACY_ARCHITECTURE.md`](./docs/PRIVACY_ARCHITECTURE.md)).

## Reporting a vulnerability

If you discover a security or privacy vulnerability, please report it
**privately** so it can be addressed before public disclosure:

- Open a **GitHub Security Advisory** ("Report a vulnerability") on this
  repository, **or**
- Email the maintainer listed in the repository profile.

Please include:

- A clear description of the issue and its impact.
- Steps to reproduce (a minimal proof of concept is ideal).
- The affected version, browser, and environment.

We aim to acknowledge reports promptly and will keep you updated on remediation.

## Please do NOT include sensitive data in issues

Because Pinpoint is designed so that **no user data leaves the browser**, please
do not paste real assessment answers, company data, personal data, or any
sensitive information into public issues, discussions, or pull requests. Use
redacted or synthetic examples when demonstrating a problem.

## Local-only design (what this means for security)

- There is **no server-side storage** of user inputs and **no API route** that
  accepts assessment data, so there is no server-side user data to breach.
- All document generation (DOCX, PDF, JSON) happens **client-side**; no content
  is sent to a remote rendering service.
- A strict **Content Security Policy** (`connect-src 'self'`) blocks requests to
  third-party origins, and the app bundles **no third-party scripts or remote
  fonts**.
- The biggest practical risks are on the **client side** — a compromised device,
  malicious browser extension, or shared/unlocked browser profile. Pinpoint
  flags AI browser extensions as a risk and provides a one-click **Delete local
  data** control.

## Supported versions

Pinpoint is in active early development; security fixes are applied to the
latest `main`. Please test against the latest version before reporting.
