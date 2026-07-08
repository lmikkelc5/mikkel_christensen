# Personal Website CMS

A clean, modern personal website built with Next.js, TypeScript, and Tailwind CSS that behaves like a lightweight custom CMS.

## Architecture

This project is file-backed, not database-backed.

- Long-form content is stored as HTML
- Searchable/filterable metadata is stored as JSON
- Photography is metadata-driven with a single `data/photos.json` index
- The `/admin` dashboard is the primary editing interface

The goal is that you rarely need to touch source code to add or edit content.

## Key Features

- Password-protected admin dashboard at `/admin`
- Rich text editor that stores clean HTML
- File-backed CRUD for articles, recipes, projects, and photography
- Drag-and-drop photo uploads with automatic EXIF extraction and thumbnails
- Metadata-driven photography library with auto-generated galleries
- Search/filtering driven by metadata JSON
- Responsive public site with dark mode

## Folder Structure

```text
app/
  admin/
  api/
  about/
  articles/
  contact/
  photography/
  projects/
  recipes/
components/
  admin/
content/
  articles/
    my-article/
      article.html
      metadata.json
  recipes/
    pizza/
      recipe.html
      metadata.json
  projects/
    march-madness-db/
      project.html
      metadata.json
lib/
data/
  photos.json
public/
  content/
  photography/
    originals/
    thumbnails/
```

## Getting Started

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

3. Start development:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Admin Authentication

The admin area uses a simple username/password setup for now.

Set these environment variables:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this
ADMIN_SESSION_SECRET=change-this-too
```

Without environment variables, the app falls back to:

- username: `admin`
- password: `changeme`

Update these before deploying.

## Managing Articles, Recipes, and Projects

The preferred workflow is:

1. Visit `/admin`
2. Sign in
3. Choose `Articles`, `Recipes`, or `Projects`
4. Create, edit, delete, save, and upload files directly in the dashboard

Each entry is stored in a folder:

### Article

```text
content/articles/first-post/
  article.html
  metadata.json
```

### Recipe

```text
content/recipes/pizza/
  recipe.html
  metadata.json
```

### Project

```text
content/projects/march-madness-db/
  project.html
  metadata.json
```

### Example article metadata

```json
{
  "title": "My First Article",
  "subtitle": "Optional subtitle",
  "description": "Short summary",
  "date": "2026-07-08",
  "category": "Programming",
  "tags": ["Programming", "Python"],
  "featured": true,
  "coverImage": "/content/articles/first-post/cover.jpg"
}
```

The HTML file contains the formatted body content. The JSON file contains structured metadata used for search, filters, listings, and featured sections.

## Rich Text Editor

The built-in admin editor supports:

- Bold
- Italics
- Underline
- Headings
- Quotes
- Bullet lists
- Numbered lists
- Tables
- Code blocks
- Links
- Images
- Videos
- Horizontal rules

It stores the result as HTML behind the scenes.

## Photography

Photography works like a lightweight Lightroom library. Each image is stored once and indexed in metadata.

```text
public/photography/originals/
  IMG_0001.jpg
  IMG_0002.jpg

data/photos.json
```

Example metadata:

```json
{
  "file": "IMG_0001.jpg",
  "title": "Lincoln Memorial",
  "description": "Sunrise on Portra 400.",
  "trip": "Washington DC",
  "film": "Portra 400",
  "camera": "Canon AE-1",
  "lens": "50mm f/1.8",
  "dateTaken": "2026-07-16",
  "location": "Washington DC",
  "tags": ["travel", "architecture", "film"],
  "featured": true,
  "favorite": true
}
```

On upload, the admin dashboard automatically extracts EXIF data when available (date, camera, lens, ISO, aperture, shutter speed, focal length, GPS). You only need to fill in fields that cannot be inferred, such as trip, film stock, description, tags, favorite, and featured.

Galleries are generated automatically from metadata:

- Browse by film stock
- Browse by trip
- Browse by camera
- Browse by year
- Favorites
- Featured portfolio

The admin Photography section supports:

- Upload one or many photos (drag-and-drop)
- Edit metadata
- Delete or replace photos
- Search and filter
- Batch edit selected photos
- Mark favorites and featured photos

## Uploads

Uploads are written into intuitive filesystem locations:

- Content images: `public/content/<collection>/<slug>/`
- Photography originals: `public/photography/originals/`
- Photography thumbnails: `public/photography/thumbnails/` (generated automatically)

This keeps files easy to inspect and edit manually in VS Code.

## Search

Search/filter UIs are built from metadata JSON fields such as:

- `title`
- `description`
- `tags`
- `category`
- `status`

The long-form HTML body is not the primary search source.

## Deployment to Vercel

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/).
3. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`.
4. Update `lib/site-config.ts` with your real production URL and profile links.

Because the content is file-based, this project works best when edits happen in an environment where the filesystem is writable.

## Customizing the Design

- Update site name, URL, email, and social links in `lib/site-config.ts`
- Adjust design tokens in `app/globals.css`
- Replace sample content in `content/`
- Replace sample images in `public/photography/originals/`
- Replace `public/resume.pdf`

## Future Expansion

The architecture is intentionally shaped so you can later:

- Move content storage to a database
- Add multiple users
- Add comments or likes
- Add newsletters
- Add analytics

The public UI already reads through a content service layer, and the admin UI already writes through API routes, which makes those upgrades easier later.
