"use client";

import styled, { createGlobalStyle } from "styled-components";
import { Chat } from "../components/Chat";

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #0f172a;
    --panel: #111827;
    --accent: #38bdf8;
    --accent-strong: #0ea5e9;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --border: #1f2937;
    --danger: #ef4444;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: radial-gradient(circle at 10% 20%, #0b1224 0, #0f172a 45%, #0a0f1f 100%);
    color: var(--text);
    font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  }
`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export default function HomePage() {
  return (
    <Page>
      <GlobalStyle />
      <Chat />
    </Page>
  );
}
