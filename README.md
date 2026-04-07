# HTML Text Extractor & Cleaner

Extract clean, structured text from any raw HTML string. No web scraping, no external dependencies — just pure HTML parsing.

## What it does

Paste any raw HTML and get back a clean, structured JSON object containing:

- **`title`** — The page `<title>` tag or first H1 heading
- **`metaDescription`** — Content of the `<meta name="description">` tag
- **`wordCount`** — Total number of words in the body text
- **`readingTimeMinutes`** — Estimated reading time (based on 200 words/min)
- **`headings`** — All H1–H6 headings with their level and text
- **`paragraphs`** — All `<p>` tag contents as an array of strings
- **`bodyText`** — Full cleaned plain text extracted from the body
- **`links`** — All unique `<a href>` links (with anchor text), deduplicated
- **`images`** — All `<img>` tags with `src` and `alt` attributes
- **`processedAt`** — ISO timestamp of when the Actor ran

## Why use this?

- ✅ **Always works** — no web scraping means no site changes can break it
- ✅ **Pure function** — same HTML in, same result out, every time
- ✅ **Fast** — runs in seconds, well within the 5-minute platform limit
- ✅ **Lightweight** — no browser required, minimal memory usage
- ✅ **Great for developers, SEO teams, and content pipelines**

## Input

| Field             | Type    | Required | Default | Description                            |
| ----------------- | ------- | -------- | ------- | -------------------------------------- |
| `html`            | string  | ✅ Yes   | —       | Raw HTML to process                    |
| `extractHeadings` | boolean | No       | `true`  | Extract H1–H6 headings                 |
| `extractLinks`    | boolean | No       | `true`  | Extract all unique links               |
| `extractImages`   | boolean | No       | `true`  | Extract all images                     |
| `cleanWhitespace` | boolean | No       | `true`  | Remove extra whitespace from body text |
| `minWordLength`   | integer | No       | `1`     | Minimum word length for word count     |

## Example input

```json
{
  "html": "<html><head><title>My Page</title></head><body><h1>Hello</h1><p>Welcome to my page.</p><a href='https://example.com'>Visit</a></body></html>",
  "extractHeadings": true,
  "extractLinks": true,
  "extractImages": true,
  "cleanWhitespace": true
}
```

## Example output

```json
{
  "title": "My Page",
  "metaDescription": "",
  "wordCount": 5,
  "readingTimeMinutes": 1,
  "headings": [{ "level": "H1", "text": "Hello" }],
  "paragraphs": ["Welcome to my page."],
  "bodyText": "Hello\nWelcome to my page.\nVisit",
  "links": [{ "href": "https://example.com", "text": "Visit" }],
  "images": [],
  "processedAt": "2025-01-01T00:00:00.000Z"
}
```

## Use cases

- **Content pipelines** — Strip HTML before feeding text to an AI/LLM
- **SEO auditing** — Extract and inspect headings, meta descriptions, and link structures
- **Data cleaning** — Convert HTML emails or CMS exports to plain text
- **Word count & readability checks** — Quick stats on any HTML document
- **Link extraction** — Pull all links from an HTML snippet without running a full crawler

## Notes

- `<script>`, `<style>`, `<iframe>`, and `<svg>` tags are automatically removed before text extraction
- Fragment-only links (`#anchor`) and `javascript:` links are excluded from the links array
- Duplicate links are removed (deduplicated by `href`)
