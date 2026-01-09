"use client";

import { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

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

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  letter-spacing: 0.4px;
  color: var(--text);
`;

const ClearButton = styled.button`
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  &:hover {
    color: var(--text);
    border-color: var(--accent);
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
`;

const ChatPanel = styled.div`
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 70vh;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
`;

const Bubble = styled.div`
  align-self: ${(p) => (p.role === "user" ? "flex-end" : "flex-start")};
  background: ${(p) => (p.role === "user" ? "var(--accent)" : "#1f2937")};
  color: ${(p) => (p.role === "user" ? "#0b1224" : "var(--text)")};
  border-radius: 14px;
  padding: 10px 12px;
  max-width: 80%;
  font-size: 14px;
  line-height: 1.4;
  border: 1px solid var(--border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const InputRow = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const TextInput = styled.textarea`
  flex: 1;
  background: #0b1224;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  min-height: 56px;
  resize: none;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: var(--accent);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #0b1224;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 10px 30px rgba(56, 189, 248, 0.3);
  &:hover {
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Status = styled.div`
  color: var(--muted);
  font-size: 13px;
  min-height: 18px;
`;

const ErrorText = styled.div`
  color: var(--danger);
  font-size: 13px;
`;

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const bestReply = (results) => {
    if (!results || results.length === 0)
      return "Nao encontrei nada relevante.";
    const top = results[0];
    return `Encontrei algo relacionado: ${top.content}`;
  };

  const handleSend = async (evt) => {
    evt.preventDefault();
    if (!input.trim() || loading) return;
    const userText = input.trim();

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: userText },
    ]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText, top_k: 3 }),
      });

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const data = await res.json();
      const reply = bestReply(data);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "bot", text: reply },
      ]);
    } catch (err) {
      setError("Erro ao buscar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError("");
  };

  return (
    <Page>
      <GlobalStyle />
      <Header>
        <Title>Seu chatbot de comidas e receitas</Title>
        <ClearButton type="button" onClick={handleClear}>
          Limpar chat
        </ClearButton>
      </Header>

      <Main>
        <ChatPanel>
          <Messages ref={listRef}>
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role}>
                {m.text}
              </Bubble>
            ))}
          </Messages>

          {error && <ErrorText>{error}</ErrorText>}
          <Status>{loading ? "Buscando resposta..." : ""}</Status>

          <InputRow onSubmit={handleSend}>
            <TextInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo sobre comidas ou receitas"
              disabled={loading}
            />
            <SendButton type="submit" disabled={loading || !input.trim()}>
              Enviar
            </SendButton>
          </InputRow>
        </ChatPanel>
      </Main>
    </Page>
  );
}
