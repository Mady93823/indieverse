# Isai Varigal (இசை வரிகள்)

A Tamil song lyrics site. Every song is shown in **தமிழ்** (Tamil script) with **Tanglish** (the same
Tamil words in English letters) under each line; readers can switch to Tamil only or Tanglish only.
The project started as "IndieVerse"; the site name and logo are settings, so it can be renamed again
from the admin.
Admins add songs, lyrics and cover images in the admin panel, and manage artists, pages, site settings,
the logo, search-engine settings and Google AdSense there too.

## Stack

| Part | Choice |
| --- | --- |
| App (site, admin and backend in one) | Next.js 16 (App Router, TypeScript), React 19 |
| UI | Tailwind CSS 4, shadcn/ui (Radix primitives), lucide icons, Inter + Noto Sans Tamil |
| Database | PostgreSQL + Prisma 7.10.1 |
| Images | Saved on the server's disk and resized with sharp: covers (800×800 WebP plus a 1200×630 share image), artist photos, logo files |
| Admin login | Node's built-in `crypto.scrypt` for passwords, sessions stored in Postgres |
| Validation | zod |

Versions are pinned to stable releases. Prisma is held at 7.10.1 on purpose: in October 2026 npm's
default Prisma version was an 8.0 release candidate.

## Quick setup

You need **Node.js 24** and **PostgreSQL 14 or newer**. Check with `node -v` and `psql --version`.

**1. Get the code and install**

```bash
git clone https://github.com/Mady93823/indieverse.git
cd indieverse
npm install          # also generates the database client
```

**2. Create a database** (once)

```bash
sudo -u postgres psql -c "CREATE ROLE indieverse LOGIN PASSWORD 'choose-a-password';"
sudo -u postgres psql -c "CREATE DATABASE indieverse OWNER indieverse;"
```

**3. Settings file**

```bash
cp .env.example .env
```

Open `.env` and set:

| Setting | What to put |
| --- | --- |
| `DATABASE_URL` | `postgresql://indieverse:choose-a-password@localhost:5432/indieverse` |
| `SITE_URL` | `http://localhost:3000` on your computer; your real address (`https://…`) on a server |
| `UPLOAD_DIR` | Leave as `uploads` locally; on a server use a folder outside the app, e.g. `/var/lib/indieverse/uploads` |

**4. Create the tables and your admin login**

```bash
npm run db:migrate     # creates the tables
npm run create-admin   # asks for your name, email and a password
```

**5. Start it**

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (log in with the email and password from step 4)

**Optional:** `npm run demo:add` fills the site with 12 made-up songs so you can see how it looks.
Remove them before going live with `npm run demo:remove`.

**Going live on a server:** see [Deploying to a VPS](#deploying-to-a-vps) below. In short:
`npm ci`, `npm run db:deploy`, `npm run build`, `npm start`.

`npm run create-admin` with an email that already exists resets that admin's password and logs them out everywhere.

### Demo data

```bash
npm run demo:add       # 12 demo songs (10 published, 2 drafts) with covers, 10 artists
npm run demo:remove    # deletes them again, e.g. before going live
```

The demo songs, lyrics and artists are all made up, so no real lyrics or artist names are published by
accident. Running `demo:add` again resets the demo songs to their original state. Both commands only touch
songs that still have their generated demo cover, so your own songs are never changed or deleted.

The commands change the database directly, so a running site doesn't see the change until you restart
`npm run dev`. On a production server, run `npm run build` again and restart.

### Share images for older covers

Covers uploaded now get a 1200×630 JPEG for link previews (WhatsApp, Instagram, X) automatically. For
covers uploaded before that existed, run once:

```bash
npm run covers:share
```

## Admin workflow

### Adding a song

1. Log in at `/admin` and click **Add a song**.
2. Enter the title in English letters (the web address is made from it) and, optionally, in Tamil.
3. Type singers, music and lyrics credits, separated by commas. Existing artists are suggested as you
   type, so the same person isn't entered twice with different spellings.
4. Upload a cover (JPG, PNG or WebP, up to 5 MB; cropped to a square).
5. Paste the Tamil lyrics and the English-letters lyrics, one line per line and an empty line between verses.
6. Optional but recommended: **About this song**, a few lines in your own words. It's shown under the
   lyrics and is the original content Google and AdSense look for.
7. **Save draft** keeps it hidden (use **Preview** to see it). **Publish** puts it on the site immediately
   (both lyrics and a singer are required). Ctrl/⌘+S saves.

Also on the song form: **Feature on the home page** (Editor's picks), **Hide ads on this song**, an
**internal note** only admins see (e.g. where permission for the lyrics came from), and **Search &
sharing** to override the automatic Google title and description. Changing a published song's web
address keeps the old address working: it forwards to the new one.

### The rest of the admin

| Section | What it's for |
| --- | --- |
| Dashboard | Counts, recent songs, drafts to finish, songs missing a cover/About/YouTube link, launch readiness |
| Songs | All songs with filters (published, drafts, featured), sorting and search |
| Artists | Photo, Tamil name, bio and links for each artist; **Merge** two entries for the same person |
| Pages | About, Contact, Privacy, Terms and Copyright pages, from templates; publish each when ready |
| Settings | Site name, contact email, social links, footer, home page text, logo and icons, share image, Search Console and Bing codes, "hide from search engines" |
| Ads | Step-by-step AdSense guide with live checks, publisher ID, on/off per ad position, and a preview of where ads appear |
| Subscribers | Newsletter sign-ups from the home page; download them as CSV for any email tool |
| Team | Add people as **Owner** (everything) or **Editor** (songs, artists and pages only) |
| Account | Change your name, email and password; log out other devices |

## Launch checklist

The Ads → Guide page checks most of this for you.

1. Deploy on your own domain with HTTPS, and set `SITE_URL` to it.
2. `npm run demo:remove` on the server.
3. Settings: site name, contact email, logo. Pages: review and publish About, Contact, Privacy and Copyright.
4. Make sure **Hide the whole site from search engines** is off (Settings → Search engines).
5. Verify the site in [Google Search Console](https://search.google.com/search-console) (paste the
   HTML-tag code in Settings → Search engines) and submit `https://your-domain/sitemap.xml`.
6. Keep publishing songs with About text. Ask artists to link to their page on the site: links from
   other sites are what help a new site rank most.

## Google AdSense: when and how

- **Now:** everything is built in, with ads off. Nothing loads from Google until you switch ads on.
- **Apply** when the launch checklist is done and there are about 30–50 real songs with About text,
  usually 4–8 weeks after launch. Google sets no minimum site age, but thin new sites are often refused
  for "low value content".
- **Lyrics are copyrighted.** Google doesn't allow ads next to copied or copyrighted content without
  permission. Publish lyrics the artists are happy to share, note the permission on the song, and use
  "Hide ads on this song" when unsure.
- Saving the publisher ID adds Google's verification tag and `/ads.txt`. Turn on Google's own consent
  message in AdSense (Privacy & messaging → European regulations) for visitors from Europe, the UK and
  Switzerland. After approval, create responsive ad units, paste their slot IDs, and start with two
  positions: after the lyrics and on the home page. Keep **Auto ads** off in AdSense.

## How the code is organised

```
prisma/schema.prisma          Tables: songs, artists, song_credits, admins, sessions, settings, pages, redirects
src/app/(site)/               Public pages: home, songs, artists, latest, trending, popular, decades,
                              lyricists, composers, search, about/contact/privacy/terms/copyright
src/app/admin/(panel)/        Admin: dashboard, songs, artists, pages, settings, ads, team, account
src/app/admin/(preview)/      Draft previews with the public layout
src/app/uploads/              Serves uploaded images
src/app/ads.txt, sitemap.ts, robots.ts, manifest.ts, favicon.ico   Generated from the data and settings
src/lib/settings/             Site settings: schemas with defaults, cached reads, save actions
src/lib/songs/, artists/, pages/   Queries and admin actions for each
src/lib/seo/                  Automatic titles and descriptions, structured data (JSON-LD)
src/lib/ads/readiness.ts      The launch/AdSense checks
src/lib/auth/                 Password hashing, sessions, login, account and team actions
src/lib/uploads.ts            Image resizing and storage
src/proxy.ts                  Redirects logged-out visitors away from /admin
scripts/                      create-admin, demo data, share-image backfill
```

**Look:** the public site is a light reading design with one pink accent (the `.site` theme in
`src/app/globals.css`); the admin keeps its own "Marigold & Ink" look. The home page photo is
`public/Neon Lights Over a Rock Concert.png` unless one is uploaded in Settings → Logo & images.

**Trending** adds up the last 7 days of reads (`song_daily_views`); **All-time popular** uses each song's total.

**Settings** are stored as one JSON value per group (general, home, branding, seo, ads) and checked against
the zod schemas in `src/lib/settings/schema.ts`, which also hold the defaults. A new setting needs no
migration: add it to the schema and its default.

**Caching:** public pages are prerendered and served from cache. Admin changes clear the matching cache
tag (`songs`, `settings`, `pages` or `redirects`), so they appear on the site straight away. The "Popular"
list also refreshes on its own every hour as view counts change. Changes made directly in the database
(the demo scripts, `psql`) need a restart (`npm run dev`) or a new build in production.

**Old addresses:** when a published song's or an artist's web address changes, or two artists are merged,
a redirect is stored so old links and search results keep working. Visitors are forwarded with an instant
redirect, which Google treats as permanent.

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

4. **nginx in front.** Raise the upload limit: nginx allows 1 MB by default, which breaks image uploads.

   ```nginx
   server {
     server_name your-domain.com;
     client_max_body_size 6m;

     location /uploads/ {
       alias /var/lib/indieverse/uploads/;   # nginx serves uploaded images directly
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
