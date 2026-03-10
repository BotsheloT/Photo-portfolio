# Botshelo — Photography Portfolio

A minimal, editorial photography portfolio with a custom headless CMS. Built with Next.js 14 (App Router), SQLite, and Cloudinary.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via `better-sqlite3` |
| Image storage | Cloudinary (free tier) |
| Image processing | Sharp |
| Auth | JWT via `jose` |
| Drag-to-reorder | `@dnd-kit` |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Admin password — choose something secure
ADMIN_PASSWORD=your-secure-password

# JWT secret — generate with: openssl rand -base64 32
JWT_SECRET=your-jwt-secret

# Cloudinary — from cloudinary.com > Dashboard
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Cloudinary setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From the Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**
3. Paste them into `.env.local`

No additional Cloudinary configuration is needed — the app creates uploads under a `portfolio/` folder automatically.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database is created automatically at `data/portfolio.db` on first run. The `data/` directory is gitignored.

### 5. Access the CMS

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and enter your `ADMIN_PASSWORD`.

---

## CMS Workflow

1. **Create a shoot** — `/admin/dashboard` → New Shoot → fill in name, category, description → Create Shoot
2. **Upload images** — on the edit page, click "Upload Images" (accepts JPG, PNG, WEBP)
3. **Set thumbnail** — click "Set as Thumbnail" next to the desired image (shown in amber/orange when active). This image appears on the home page and category grids.
4. **Reorder** — drag images to set gallery order
5. **Save** — click "Save Shoot"

---

## Site Structure

| Route | Description |
|---|---|
| `/` | Home — all thumbnails, colour-sorted, infinite scroll |
| `/work/personal` | Personal shoots grid |
| `/work/collabs` | Collabs shoots grid |
| `/work/[slug]` | Shoot detail with full gallery |
| `/info` | Bio, email, Instagram |
| `/admin` | CMS login |
| `/admin/dashboard` | Shoot list |
| `/admin/shoots/new` | Create shoot |
| `/admin/shoots/[id]` | Edit shoot + upload images |
| `/admin/info` | Edit Info page content |

---

## Colour Sort

When a thumbnail image is uploaded, the app samples its pixel data with Sharp and extracts the dominant hue (0–360°). Thumbnails on the home page are sorted by this hue value, creating a smooth colour-wheel progression across the grid. Monochrome or near-greyscale images (low saturation) are sorted to the end.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repository into [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel project settings
4. Deploy

**Note:** Vercel's filesystem is ephemeral — the SQLite `data/` directory will be reset on each deployment. For production persistence, migrate the database to [Turso](https://turso.tech) (libSQL, drop-in SQLite replacement) or another persistent store.

---

## Font

Uses **Inter** (Google Fonts) — the closest freely available alternative to Neue Haas Grotesk. Loaded via `next/font/google` with zero layout shift.

---

## Accent Colour

`#FF6F00` — applied only to:
- Active/current nav link state
- Text link hover states
- "Set as Thumbnail" active state in the CMS
