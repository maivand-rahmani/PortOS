export type DocsHeading = {
  id: string;
  title: string;
  level: number;
};

export type DocsDocument = {
  id: string;
  title: string;
  summary: string;
  path: string;
  folder: string;
  content: string;
  headings: DocsHeading[];
};

export function slugifyDocsHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
