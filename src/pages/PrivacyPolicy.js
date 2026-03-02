import React, { useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import Footer from "./Footer";
import privacyPolicies from "../data/privacyPolicies";

function PrivacyPolicy() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const Container = styled.div`
    margin: 6rem auto 2rem;
    width: 80%;
    max-width: 900px;

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      opacity: 0.6;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .app-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .app-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      border: 1px solid ${darkMode ? "#333" : "#e0e0e0"};
      border-radius: 12px;
      text-decoration: none;
      color: ${darkMode ? "#fff" : "#000"};
      transition: all 0.2s ease-in-out;
    }

    .app-card:hover {
      border-color: ${darkMode ? "#666" : "#999"};
      background-color: ${darkMode ? "#111" : "#f8f8f8"};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"};
    }

    .app-icon {
      width: 60px;
      height: 60px;
      border-radius: 14px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .app-info h3 {
      margin: 0 0 0.25rem;
      font-size: 1.15rem;
    }

    .app-info p {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.6;
    }

    .arrow {
      margin-left: auto;
      font-size: 1.25rem;
      opacity: 0.4;
    }

    @media screen and (max-width: 700px) {
      margin-top: 4rem;

      .app-card {
        padding: 1rem;
      }

      .app-icon {
        width: 48px;
        height: 48px;
      }
    }
  `;

  return (
    <>
      <Container>
        <h1>Privacy Policies</h1>
        <p className="subtitle">
          Privacy policies for our Google Play Store applications.
        </p>
        <div className="app-list">
          {privacyPolicies.map((app) => (
            <Link
              to={`/privacy-policy/${app.appSlug}`}
              className="app-card"
              key={app.appSlug}
            >
              <img
                src={app.iconUrl}
                alt={app.appName}
                className="app-icon"
              />
              <div className="app-info">
                <h3>{app.appName}</h3>
                <p>Effective: {app.effectiveDate}</p>
              </div>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default PrivacyPolicy;
