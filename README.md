# Party Lions — Beer Pong Championship

React, TypeScript and Vite tournament manager with a shared player/team registration desk and browser-local tournament management.

## Run locally

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The development server runs on port 8080. `.env.example` contains only the new project's public URL and publishable browser key. Never put a service-role or secret key in a `VITE_*` variable.

```sh
npm run build
npm run lint
npm test
```

## Registration

1. Create a tournament, then sign in in **Online registration** as organiser.
2. Click **Open registration**, and share the generated `?register=<tournament-id>` link.
3. Share the generated group code along with the link. One player enters the code, team name and both teammates’ names; no player email/account is needed. Solo entries remain available.
4. Refresh the registration desk and accept/reject pending entries. Solo players wait for pairing; team entries enter the roster.
5. Pair solo players using **Create team from players**. Starting the tournament closes online registration first.

Duplicate team names and overlapping player display names are rejected. Use distinct display names when names collide. Organisers can generate a new code to invalidate the old one; closing registration disables all submissions. Accepted entries can be restored on another organiser device, but match progress requires a downloaded backup.

## Round buy-in / buy-back amounts

In **Settings → Round buy-in / buy-back pricing**, select the current or a future round and save its team re-entry amount. Zero and amounts with cents are supported. **Use default** restores the original base-plus-increment schedule for that round. Past rounds and the current round after its first successful buy-back are locked. Custom amounts persist with tournament data and backups and appear in both the match header and buy-back confirmation.

These amounts are re-entry fees for eliminated teams. The app does not charge an initial registration fee or process payments.

## Backend and deployment

The dedicated Supabase project is **Beer Pong — Party Lions**, ref `fckiszoqqflohpyowhvi`, hosted in Sydney. The checked-in migrations and the `group-register` Edge Function are already deployed to that project. For a different backend, apply all migrations in order, deploy `supabase/functions/group-register` with its checked-in JWT configuration and change the public environment variables.

Set these variables in the hosting environment before building:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Organiser sign-in still uses Supabase Auth. Configure its site URL and allowed redirect URLs for the actual deployment. Configure production email delivery and include `{{ .Token }}` in the magic-link email template for the code form. These email settings are only needed for organiser sign-in; player submissions use the group code. For link-based sign-in, reopen the tournament registration URL after signing in.

Only public event metadata is readable without signing in. The `group-register` Edge Function validates the group code through a service-only SQL function before inserting a pending entry. Code hashes are readable and writable only by the event owner. Anonymous browsers cannot insert directly, list entries or approve teams. Match administration remains local to the organiser's browser.

See [AUDIT.md](AUDIT.md) for verified fixes, dependency findings and remaining launch requirements.

Production: https://beer-pong-party-lions.vercel.app
