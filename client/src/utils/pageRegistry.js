import { getContentByKey } from "../services/api";

const defaultPages = [
  { id: "home", name: "Home", slug: "home" },
  { id: "about", name: "About", slug: "about" }
];

const coreDefaults = {
  home: ["hero", "about", "products", "solutions", "imageGrid"],
  about: ["aboutHero", "aboutOverview", "aboutMission", "aboutStarted"]
};

function normalizeSections(sections) {
  const list = Array.isArray(sections) ? sections : [];
  return list
    .map((item) => (typeof item === "string" ? item : item?.type))
    .filter(Boolean)
    .filter((t) => t !== "navbar" && t !== "footer");
}

export async function listPages() {
  try {
    const res = await getContentByKey("pages");
    const v = res?.data?.value;
    if (Array.isArray(v)) {
      const map = new Map();
      [...defaultPages, ...v].forEach((p) => {
        if (!p || !p.slug) return;
        if (!map.has(p.slug)) {
          map.set(p.slug, {
            id: p.id || p.slug,
            name: p.name || p.slug,
            slug: p.slug
          });
        }
      });
      return Array.from(map.values());
    }
  } catch {
    return defaultPages;
  }
  return defaultPages;
}

export async function listSectionsForPage(slug) {
  try {
    const res = await getContentByKey("page-" + slug);
    const v = res?.data?.value || {};
    const list = normalizeSections(v.sections || []);
    if (list.length) return list;
  } catch {
    const def = coreDefaults[slug];
    return Array.isArray(def) ? def : [];
  }
  const def = coreDefaults[slug];
  if (Array.isArray(def)) return def;
  return [];
}

export function numberSections(types) {
  const totals = {};
  types.forEach((t) => {
    totals[t] = (totals[t] || 0) + 1;
  });
  const seen = {};
  return types.map((t) => {
    seen[t] = (seen[t] || 0) + 1;
    const idx = seen[t];
    const id = totals[t] > 1 ? `${t}${idx}` : t;
    return { type: t, id };
  });
}

