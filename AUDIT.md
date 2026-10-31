# Beer pong audit — 31 October 2026

Scope: current React/Zustand application, tournament state transitions, dependencies, registration UI and Supabase policies. This is a code and functional audit, not a penetration-test certification.

| Finding | Impact | Outcome |
| --- | --- | --- |
| Production build references an uninstalled `lucide-react` package | Cannot build from a clean checkout | Removed unused chunk reference; build passes |
| Old, unreachable Supabase/Firebase implementation uses incompatible types | Type checking fails; conflicting backend assumptions | Removed superseded code and unused Firebase dependency; build now runs TypeScript checks |
| Wildcard result cleared before building the next pool | Confirmed wildcard disappears | Fixed and covered by regression test |
| Odd next-round pool uses `floor(length / 2)` | Last team silently disappears | Added a completed bye match; tested with 3, 5, 7 and 9 teams |
| Match-result actions trust missing IDs, foreign winners and repeats | Exceptions or corrupted elimination list | Added guards and regression tests |
| Round advancement can occur before results are complete | Incomplete rounds can discard teams | Added completion guard and regression test |
| Duplicate team validation differs across forms and imports | Duplicate teams or silent failures | Central validation in store and entry forms |
| Inputs have visually separate labels | Inconsistent accessible field naming | Connected labels, fields and error messages |
| No shared registration data in active app | Phones cannot contribute to organiser's local roster | Added authenticated shared registration, review desk and database policies |
| 25 dependency advisories at baseline (2 critical, 15 high) | Known dependency risks | Compatible updates and removal of unused Firebase reduce to 13: 1 high, 12 moderate |

## New registration flow

- Public tournament metadata is readable by link. Submissions require email authentication.
- Register a solo display name or a named team containing two different display names.
- One submission per authenticated account per tournament. Team names are case-insensitively unique per event.
- Submitters can read their own entries; the organiser can read and review their event's entries. Other players cannot read them.
- Only the event owner can open/close registration or approve/reject entries. Column-level grants prevent submitters from forging approval or editing event ownership.
- Approved solo entries join the waiting-player list; approved teams join the roster.
- Acceptance is idempotent by registration ID. Accepted entries can be restored to another organiser device during setup.
- Starting through the setup page closes online registration first and fails visibly if closure cannot be confirmed.

## Verified

`npm run build`, `npm run lint`, and `npm test` pass. Nine tests cover registration, roster identity, duplicate/closed registration, idempotent acceptance, wildcard retention, odd pools, invalid match results database access rules, custom round prices, restored defaults and price locking. Database tests execute real PostgreSQL using PGlite with application roles and RLS enabled.

Live Supabase transaction verified submission, cross-user privacy, owner approval and rejection of submissions to closed events; test fixtures were rolled back. Supabase security advisors returned no findings. Browser verified solo registration, two-player pairing and roster rendering.

## Remaining work and limitations

1. **Before public launch:** deploy the branch with the two public `VITE_SUPABASE_*` variables. Configure Supabase Auth site URL and allowed redirect URLs for the deployed origin. Configure an email provider for public sign-in; Supabase's built-in sender has delivery restrictions and is not a production email service. Include `{{ .Token }}` in the email template to support the code-entry UI. Email delivery and a real signed-in phone-to-organiser browser session have not been verified.
2. **High dependency advisory:** `xlsx@0.18.5` remains vulnerable to prototype-pollution and ReDoS advisories. npm has no patched release for this package. Replace or migrate the spreadsheet parser before accepting untrusted spreadsheet uploads. The remaining 12 moderate findings are lint tooling dependencies; no forced breaking downgrade was applied.
3. **Organiser tournament state remains browser-local.** Registrations are shared; match scores and brackets are not synchronised across devices. Use one organiser device and download tournament backups. Restoring accepted entries restores registrations, not match progress.
4. **Backup JSON validation is still shallow.** Only restore trusted backups; malformed nested data can crash rendering. Full schema validation is a separate hardening task.
5. **Entry abuse:** email sign-in, one entry per account and organiser approval limit casual duplicates. Production abuse testing, CAPTCHA/rate limits and identity verification are not implemented. Display names are not proof of real-world identity.
6. **Existing advanced match overrides/restarts and buyback controls** need a broader tournament-rules audit, especially after later-round matches exist. The tests here cover the concrete regression fixes, not every moderator action sequence.
7. Public event metadata includes event name, ID and organiser UUID; private registration contents and email addresses are not publicly exposed.
