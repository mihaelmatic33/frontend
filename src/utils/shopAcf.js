const FIELD_LABELS = {
  article_name: "Product Name",
  product_description: "Description",
  categories: "Categories",
  price: "Price",
  rarity: "Rarity",
  grading_company: "Grading Company",
  grade: "Grade",
  color: "Color",
  add_ons_type: "Add-ons",
  console: "Console",
  type: "Type",
  wearables_type: "Wearables",
  prefrences: "Preferences",
};

const ARTICLE_FIELDS = ["article_name", "product_description", "price"];
const GROUPS = [
  {
    id: "accessories",
    title: "Accessories",
    categoryIds: [96, 126, 247],
    categoryNames: [
      "accesories",
      "accessories",
      "wearables",
      "addons",
      "add-ons",
    ],
    keys: ["wearables_type", "add_ons_type", "color"],
  },
  {
    id: "toys",
    title: "Toys",
    categoryIds: [98, 106, 107, 127],
    categoryNames: ["toys", "figures", "flushies", "plushies", "fan art"],
    keys: ["type", "color", "prefrences"],
  },
  {
    id: "tcg",
    title: "Trading Card Game",
    categoryIds: [95, 112, 110, 109, 129, 130, 131, 132, 133, 134, 135, 136],
    categoryNames: [
      "trading card game(tcg)",
      "graded",
      "sealed",
      "singles",
      "psa",
      "cgc",
      "tag",
    ],
    keys: ["rarity", "grading_company", "grade"],
  },
  {
    id: "videogames",
    title: "Video Games",
    categoryIds: [248],
    categoryNames: ["video games", "videogames"],
    keys: ["console", "type"],
  },
  {
    id: "mystery",
    title: "Mystery",
    categoryIds: [100, 137, 138, 139, 140],
    categoryNames: [
      "mystery",
      "mystery card",
      "mystery sealed",
      "mystery graded card",
    ],
    keys: ["prefrences", "type"],
  },
];

export const formatAcfValue = (value) => {
  if (Array.isArray(value)) {
    const clean = value.filter(Boolean);
    return clean.length > 0 ? clean.join(", ") : "";
  }

  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.trim();

  return "";
};

const formatPriceWithEur = (value) => {
  const base = formatAcfValue(value);
  if (!base) return "";

  if (/\beur\b|€/i.test(base)) {
    return base;
  }

  const normalized = base.replace(/\s+/g, "").replace(",", ".");
  const numeric = Number(normalized);

  if (Number.isFinite(numeric)) {
    return `${numeric.toFixed(2)} EUR`;
  }

  return `${base} EUR`;
};

const toHumanLabel = (key) =>
  key
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const toField = (key, value) => ({
  key,
  label: FIELD_LABELS[key] || toHumanLabel(key),
  value: key === "price" ? formatPriceWithEur(value) : formatAcfValue(value),
});

export const getArticleFields = (acf, options = {}) => {
  const includePrice = options.includePrice ?? true;
  const fieldsToUse = includePrice
    ? ARTICLE_FIELDS
    : ARTICLE_FIELDS.filter((key) => key !== "price");

  return fieldsToUse
    .map((key) => toField(key, acf?.[key]))
    .filter((field) => Boolean(field.value));
};

const toLower = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

const getCategoryContext = (product) => {
  const categoryIds = Array.isArray(product?.["prod-category"])
    ? product["prod-category"].filter((id) => typeof id === "number")
    : [];

  const categoryNames = Array.isArray(product?.acf?.categories)
    ? product.acf.categories.map(toLower).filter(Boolean)
    : [];

  return {
    ids: categoryIds,
    names: categoryNames,
  };
};

const groupMatchesCategory = (group, context) => {
  const byId = group.categoryIds.some((id) => context.ids.includes(id));
  const byName = group.categoryNames.some((name) =>
    context.names.includes(name),
  );
  return byId || byName;
};

const isSealedCategory = (context) =>
  context.ids.includes(110) || context.names.includes("sealed");

export const getGroupedAcfFields = (product) => {
  const safeAcf = product?.acf || {};
  const categoryContext = getCategoryContext(product);

  const matchedGroup =
    GROUPS.find((group) => groupMatchesCategory(group, categoryContext)) ||
    null;

  if (matchedGroup) {
    const hiddenKeys =
      matchedGroup.id === "tcg" && isSealedCategory(categoryContext)
        ? new Set(["rarity", "grading_company"])
        : null;

    const keysToUse = hiddenKeys
      ? matchedGroup.keys.filter((key) => !hiddenKeys.has(key))
      : matchedGroup.keys;

    const fields = keysToUse
      .map((key) => toField(key, safeAcf[key]))
      .filter((field) => Boolean(field.value));

    return fields.length > 0
      ? [
          {
            title: matchedGroup.title,
            fields,
          },
        ]
      : [];
  }

  const fallbackGroup = GROUPS.map((group) => {
    const fields = group.keys
      .map((key) => toField(key, safeAcf[key]))
      .filter((field) => Boolean(field.value));

    return {
      title: group.title,
      fields,
    };
  }).find((group) => group.fields.length > 0);

  return fallbackGroup ? [fallbackGroup] : [];
};
