# IndieVerse

A lyrics site for Tamil indie and I-pop songs. Readers search for a song and switch its lyrics between
**தமிழ்** (Tamil script) and **English** (the same Tamil words in English letters, "Tanglish").
Admins add songs, lyrics and cover images in a small admin panel.

## Stack

| Part | Choice |
| --- | --- |
| App (site, admin and backend in one) | Next.js 16 (App Router, TypeScript), React 19 |
| UI | Tailwind CSS 4, shadcn/ui (Radix primitives), lucide icons |
| Database | PostgreSQL + Prisma 7.10.1 |
| Cover images | Saved on the server's disk, resized to 800×800 WebP with sharp |
| Admin login | Node's built-in `crypto.scrypt` for passwords, sessions stored in Postgres |
| Validation | zod |

Versions are pinned to stable releases. Prisma is held at 7.10.1 on purpose: in October 2026 npm's
default Prisma version was an 8.0 release candidate.

## Run it locally

Requires Node 24 and PostgreSQL.

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # then set DATABASE_URL
npm run db:migrate          # creates the tables
npm run create-admin        # asks for name, email and password
npm run dev                 # http://localhost:3000, admin at http://localhost:3000/admin
```

`npm run create-admin` with an email that already exists resets that admin's password and logs them out everywhere.

## Admin workflow

1. Log in at `/admin` and click **Add song**.
2. Enter the title in English letters (the web address is made from it) and, optionally, in Tamil.
3. Type singers, music and lyrics credits. Separate names with commas; an artist typed the same way on
   another song is linked automatically.
4. Upload a cover (JPG, PNG or WebP, up to 5 MB; cropped to a square).
5. Paste the Tamil lyrics and the English-letters lyrics, one line per line and an empty line between verses.
6. **Save draft** keeps it hidden. **Publish** puts it on the site immediately (both lyrics and a singer are
   required). A published song can be edited, unpublished or deleted later.

Readers find it on the home page ("Recently added", and "Popular" by views), through search (song title in
either script, album, or any credited artist), or on the artist's page.

## How the code is organised

```
prisma/schema.prisma          Database tables: songs, artists, song_credits, admins, sessions
src/app/(site)/               Public pages: home, search, songs/[slug], artists/[slug]
src/app/admin/                Admin: login, song list, add/edit song
src/app/uploads/              Serves uploaded cover images
src/lib/songs/queries.ts      Cached reads for the public site
src/lib/songs/actions.ts      Save/delete song (admin Server Actions)
src/lib/auth/                 Password hashing, sessions, login/logout
src/lib/uploads.ts            Cover resizing and storage
src/proxy.ts                  Redirects logged-out visitors away from /admin
scripts/create-admin.mts      The create-admin command
```

**Caching:** public pages are prerendered and served from cache. Every admin save, publish, unpublish or
delete clears the `songs` cache tag, so changes appear on the site straight away. The "Popular" list also
refreshes on its own every hour as view counts change.

## Deploying to a VPS

1. **Database user** (once):

   ```bash
   sudo -u postgres psql -c "CREATE ROLE indieverse LOGIN PASSWORD 'a-long-random-password';"
   sudo -u postgres psql -c "CREATE DATABASE indieverse OWNER indieverse;"
   ```

2. **`.env`** on the server:

   ```bash
   DATABASE_URL="postgresql://indieverse:a-long-random-password@localhost:5432/indieverse"
   SITE_URL="https://your-domain.com"
   UPLOAD_DIR="/var/lib/indieverse/uploads"   # outside the app folder, so redeploys never touch it
   ```

3. **Build and start.** The build reads the database (the home page is prerendered), so run it on the
   server or anywhere that can reach the database:

   ```bash
   npm ci
   npm run db:deploy      # applies new migrations, never deletes data
   npm run build
   npm start              # port 3000; keep it running with systemd or pm2
   npm run create-admin   # first deploy only
   ```

4. **nginx in front.** Raise the upload limit: nginx allows 1 MB by default, which breaks cover uploads.

   ```nginx
   server {
     server_name your-domain.com;
     client_max_body_size 6m;

     location /uploads/ {
       alias /var/lib/indieverse/uploads/;   # nginx serves covers directly
       expires max;
     }
     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

5. **Backups.** Back up both the database and the uploads folder:

   ```bash
   pg_dump -Fc indieverse > indieverse-$(date +%F).dump
   tar czf uploads-$(date +%F).tgz -C /var/lib/indieverse uploads
   ```

## Maintenance notes

- **Database changes:** edit `prisma/schema.prisma`, run `npm run db:migrate -- --name what-changed`, and
  commit the new folder in `prisma/migrations`.
- **Install scripts:** npm only runs package install scripts that are approved in `allowScripts` in
  `package.json`. After upgrading Prisma, esbuild or the ESLint resolver, run `npm install-scripts ls` and
  approve the new versions.
- **Adding shadcn components:** `npx shadcn@latest add <component>`. New components import `cn` from the
  `cn` package; change that import to `@/lib/utils`. This project uses `clsx` + `tailwind-merge` instead
  of the newer `cn` package, and keeps shadcn's CSS in `src/app/shadcn.css` so the shadcn CLI isn't a
  runtime dependency.
- `npm audit --omit=dev` should report 0 vulnerabilities. The remaining warnings come from ESLint tooling
  (dev only).
