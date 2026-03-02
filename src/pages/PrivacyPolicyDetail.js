import React, { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import Footer from "./Footer";
import privacyPolicies from "../data/privacyPolicies";

function formatContent(text) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return (
      <React.Fragment key={i}>
        {parts}
        {i < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function PrivacyPolicyDetail() {
  const { appSlug } = useParams();
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const policy = privacyPolicies.find((p) => p.appSlug === appSlug);

  const Container = styled.div`
    margin: 6rem auto 2rem;
    width: 80%;
    max-width: 800px;

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
      color: ${darkMode ? "#aaa" : "#666"};
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: ${darkMode ? "#fff" : "#000"};
    }

    .app-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .app-header img {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      object-fit: cover;
    }

    .app-header h1 {
      margin: 0;
      font-size: 1.75rem;
    }

    .meta {
      font-size: 0.85rem;
      opacity: 0.6;
      margin-bottom: 2rem;
    }

    .meta a {
      color: ${darkMode ? "#6ea8fe" : "#0d6efd"};
      text-decoration: none;
    }

    .meta a:hover {
      text-decoration: underline;
    }

    .section {
      margin-bottom: 1.75rem;
    }

    .section h2 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      padding-bottom: 0.35rem;
      border-bottom: 1px solid ${darkMode ? "#333" : "#e0e0e0"};
    }

    .section p {
      line-height: 1.7;
      font-size: 0.95rem;
      opacity: 0.85;
    }

    .contact-email {
      color: ${darkMode ? "#6ea8fe" : "#0d6efd"};
      text-decoration: none;
    }

    .contact-email:hover {
      text-decoration: underline;
    }

    .not-found {
      text-align: center;
      margin-top: 4rem;
    }

    .not-found h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .not-found a {
      color: ${darkMode ? "#6ea8fe" : "#0d6efd"};
      text-decoration: none;
    }

    @media screen and (max-width: 700px) {
      margin-top: 4rem;

      .app-header h1 {
        font-size: 1.35rem;
      }

      .app-header img {
        width: 40px;
        height: 40px;
      }
    }
  `;

  if (!policy) {
    return (
      <>
        <Container>
          <div className="not-found">
            <h2>Privacy policy not found</h2>
            <p>
              The app you are looking for doesn't have a privacy policy listed
              here.
            </p>
            <Link to="/privacy-policy">← Back to all policies</Link>
          </div>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Container>
        <Link to="/privacy-policy" className="back-link">
          ← All Privacy Policies
        </Link>

        <div className="app-header">
          <img src={policy.iconUrl} alt={policy.appName} />
          <h1>{policy.appName} – Privacy Policy</h1>
        </div>

        <p className="meta">
          Effective date: {policy.effectiveDate}
          {policy.playStoreUrl && (
            <>
              {" · "}
              <a
                href={policy.playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Play
              </a>
            </>
          )}
        </p>

        {policy.sections.map((section, index) => (
          <div className="section" key={index}>
            <h2>{section.title}</h2>
            <p>
              {formatContent(section.content)}
              {section.title === "Contact Us" && policy.contactEmail && (
                <>
                  {" "}
                  <a
                    href={`mailto:${policy.contactEmail}`}
                    className="contact-email"
                  >
                    {policy.contactEmail}
                  </a>
                </>
              )}
            </p>
          </div>
        ))}
      </Container>
      <Footer />
    </>
  );
}

export default PrivacyPolicyDetail;
