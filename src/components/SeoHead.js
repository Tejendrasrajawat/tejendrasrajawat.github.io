import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

const BASE_URL = "https://tejendrasrajawat.github.io";

/**
 * Reusable SEO component for search engines and social sharing.
 * Use on every page for unique title, description, and Open Graph tags.
 */
function SeoHead({ title, description, path = "", keywords = [] }) {
  const fullTitle = title ? `${title} | Tejendra Singh Rajawat` : "Tejendra Singh Rajawat";
  const canonicalUrl = path ? `${BASE_URL}/${path.replace(/^\/+/, "")}` : BASE_URL;
  const keywordsStr = Array.isArray(keywords) ? keywords.join(", ") : keywords;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywordsStr && <meta name="keywords" content={keywordsStr} />}
      <link rel="canonical" href={canonicalUrl} />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content="en_US" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

SeoHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  path: PropTypes.string,
  keywords: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
};

export default SeoHead;
