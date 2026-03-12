import { Helmet } from "react-helmet-async";

function generateTitleFromDescription(description) {
  if (!description) return "Moj Sajt";
  const trimmed = description.substring(0, 60);
  return trimmed.trim() + (description.length > 60 ? "..." : "");
}

export default function SEO({ title, description }) {
  const finalTitle = title || generateTitleFromDescription(description);

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}