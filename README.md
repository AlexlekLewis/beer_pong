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
3. Players sign in and submit either a solo entry or a two-player team.
4. Refresh the registration desk and accept/reject pending entries. Solo players wait for pairing; team entries enter the roster.
5. Pair solo players using **Create team from players**. Starting the tournament closes online registration first.

Submissions are restricted to one entry per account per tournament. Different teammates can use distinct display names when names collide. Accepted entries can be restored on another organiser device, but match progress requires a downloaded backup.

## Backend and deployment

The dedicated Supabase project is **Beer Pong — Party Lions**, ref `fckiszoqqflohpyowhvi`, hosted in Sydney. The checked-in migrations are already applied to that project. For a different backend, apply both migrations in order and change the public environment variables.

Set these variables in the hosting environment before building:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Configure Supabase Auth's site URL and allowed redirect URLs for the actual deployment. Configure production email delivery and include `{{ .Token }}` in the magic-link email template for the code form. Until then, public email sign-in is not launch-ready. For link-based sign-in, reopen the tournament registration URL after signing in.

Only public event metadata is available without signing in. Database RLS and column grants limit submissions and approval to their intended actors. Match administration remains local to the organiser's browser.

See [AUDIT.md](AUDIT.md) for verified fixes, dependency findings and remaining launch requirements.
