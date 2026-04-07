import { Actor } from 'apify';
import * as cheerio from 'cheerio';

await Actor.init();

try {
  // ─── Read input ────────────────────────────────────────────────────────────────
  const input = await Actor.getInput() ?? {};

  const {
    html = '',
    extractHeadings = true,
    extractLinks = true,
    extractImages = true,
    cleanWhitespace = true,
    minWordLength = 1,
  } = input;

  // ─── Validate ──────────────────────────────────────────────────────────────────
  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    await Actor.fail('Input "html" is required and must be a non-empty string.');
    await Actor.exit();
    process.exit(1);
  }

  // Prevent processing extremely large HTML (>10MB) to avoid memory issues
  if (html.length > 10 * 1024 * 1024) {
    await Actor.fail('Input HTML exceeds 10MB limit. Please use smaller HTML documents.');
    await Actor.exit();
    process.exit(1);
  }

  // Validate minWordLength is within bounds
  const validatedMinWordLength = Math.max(0, Math.min(20, parseInt(minWordLength) || 1));

  console.log(`Processing HTML input (${html.length} characters)...`);

  // ─── Parse ─────────────────────────────────────────────────────────────────────
  const $ = cheerio.load(html);

  // ─── Title & Meta MUST be extracted BEFORE removing <head> ────────────────────
  const title = $('title').text().trim() || $('h1').first().text().trim() || '';

  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  // Remove non-content elements (head removed AFTER title/meta are read)
  $('script, style, noscript, head, iframe, object, embed, svg').remove();

  // ─── Headings ──────────────────────────────────────────────────────────────────
  const headings = [];
  if (extractHeadings) {
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const level = el.tagName.toUpperCase();
      const text = $(el).text().trim();
      if (text) headings.push({ level, text });
    });
  }

  // ─── Links ─────────────────────────────────────────────────────────────────────
  const links = [];
  if (extractLinks) {
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.trim();
      const text = $(el).text().trim();
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        links.push({ href, text: text || null });
      }
    });
    // Deduplicate by href
    const seen = new Set();
    for (let i = links.length - 1; i >= 0; i--) {
      if (seen.has(links[i].href)) links.splice(i, 1);
      else seen.add(links[i].href);
    }
  }

  // ─── Images ────────────────────────────────────────────────────────────────────
  const images = [];
  if (extractImages) {
    $('img').each((_, el) => {
      const src = $(el).attr('src')?.trim();
      const alt = $(el).attr('alt')?.trim() || null;
      if (src) images.push({ src, alt });
    });
  }

  // ─── Body text ─────────────────────────────────────────────────────────────────
  let bodyText = $('body').text();

  if (cleanWhitespace) {
    bodyText = bodyText
      .replace(/\t/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // ─── Word count & reading time ─────────────────────────────────────────────────
  const words = bodyText
    .split(/\s+/)
    .filter((w) => w.length >= validatedMinWordLength);

  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // ─── Paragraphs ────────────────────────────────────────────────────────────────
  const paragraphs = [];
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 0) paragraphs.push(text);
  });

  // ─── Build output ──────────────────────────────────────────────────────────────
  const result = {
    title,
    metaDescription,
    wordCount,
    readingTimeMinutes,
    ...(extractHeadings && { headings }),
    paragraphs,
    bodyText,
    ...(extractLinks && { links }),
    ...(extractImages && { images }),
    processedAt: new Date().toISOString(),
  };

  // ─── Save to dataset ───────────────────────────────────────────────────────────
  await Actor.pushData(result);

  console.log(`Done! Extracted ${wordCount} words, ${headings.length} headings, ${links.length} links, ${images.length} images.`);

  await Actor.exit();
} catch (error) {
  console.error('Unexpected error:', error);
  await Actor.fail(`Actor failed: ${error.message}`);
  process.exit(1);
}