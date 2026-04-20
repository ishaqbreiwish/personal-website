# personal-portfolio

Minimal [Hugo](https://gohugo.io/) site: home page, blog section, projects section. Content lives under `content/`; layouts under `layouts/`; global assets under `static/`.

## Prerequisites

Install Hugo (extended build not required for this theme). Check your version:

```bash
hugo version
```

## Local preview

From the repository root:

```bash
hugo server -D
```

Open the URL Hugo prints (usually `http://localhost:1313/`). The `-D` flag includes pages marked `draft: true`.

Build a production site (writes to `public/`, which is gitignored):

```bash
hugo
```

## Where content goes

| Path | Purpose |
|------|--------|
| `content/_index.md` | Home page metadata (title only; body is optional). The visible intro is in `layouts/index.html`. |
| `content/blog/_index.md` | Blog section index (`/blog/`). |
| `content/projects/_index.md` | Projects section index (`/projects/`). |

The sidebar lists **subsections** (folders that contain `_index.md`) and **standalone pages** (a single `.md` file directly under `blog/` or `projects/`).

### Add a standalone blog post

Create a file under `content/blog/` whose name becomes the URL slug (e.g. `content/blog/my-post.md` → `/blog/my-post/`).

Minimal front matter (YAML):

```yaml
---
title: "My post"
date: 2026-04-19
draft: false
---
```

Write Markdown below the closing `---`.

CLI (uses `archetypes/blog.md`; path is relative to `content/`):

```bash
hugo new blog/your-slug.md
```

Set `draft: true` until you are ready to publish; use `hugo server -D` to preview drafts.

### Add a blog “folder” (series)

1. Create a directory: `content/blog/series-name/` (use a URL-friendly folder name; it becomes part of the URL).
2. Add `content/blog/series-name/_index.md` with at least:

```yaml
---
title: "Human-readable series title"
---
```

3. Add posts as separate files in that folder, for example `content/blog/series-name/part-1.md`, each with its own `title`, `date`, and body.

The blog list page groups posts under each subsection. The sidebar shows each series as a folder and lists its pages.

### Add a project (same patterns)

- **Single project page:** `content/projects/project-name.md` → `/projects/project-name/`.
- **Project group:** `content/projects/group-name/_index.md` plus pages inside `content/projects/group-name/`.

CLI:

```bash
hugo new projects/project-name.md
```

### Tags and categories (optional)

You can add taxonomy fields to front matter:

```yaml
tags: ["rust", "systems"]
categories: ["notes"]
```

Hugo will generate tag and category pages if taxonomies are enabled in config (this site uses Hugo defaults where applicable).

## Configuration

Site-wide settings are in `hugo.toml` (`baseURL`, `title`, `[params]`, etc.). Change `baseURL` to your real domain before deploying.

## Deploying

Any static host that serves the `public/` directory after `hugo` works (GitHub Pages, Netlify, Cloudflare Pages, etc.). Do not commit `public/`; it is listed in `.gitignore` and rebuilt in CI or on deploy.
