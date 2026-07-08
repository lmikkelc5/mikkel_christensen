import readingTime from "reading-time";
import sanitizeHtml from "sanitize-html";

import type { TocItem } from "./content";

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function sanitizeStoredHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "div",
      "span",
      "strong",
      "em",
      "u",
      "blockquote",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "a",
      "img",
      "video",
      "source",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "br"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      video: ["src", "controls", "poster", "width", "height"],
      source: ["src", "type"],
      "*": ["class"]
    },
    allowedSchemes: ["http", "https", "mailto", "data"]
  });
}

export function getReadingTimeFromHtml(html: string) {
  return readingTime(stripHtml(html)).text;
}

export function getExcerptFromHtml(html: string, fallback: string) {
  const text = stripHtml(html);
  return text ? text.slice(0, 180) : fallback;
}

export function extractTocFromHtml(html: string): TocItem[] {
  const matches = html.matchAll(/<h([2-3])(?:\s+[^>]*)?>(.*?)<\/h\1>/gi);
  return Array.from(matches).map((match) => {
    const level = Number(match[1]);
    const text = stripHtml(match[2]);
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    return { level, text, id };
  });
}

export function addHeadingIds(html: string) {
  return html.replace(/<h([2-3])(?:\s+[^>]*)?>(.*?)<\/h\1>/gi, (_, level, inner) => {
    const text = stripHtml(inner);
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}
