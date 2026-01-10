"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Card } from "../ui/Card";
import { InputBar } from "./InputBar";
import { MessageList } from "./MessageList";

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

export function Chat() {
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

  const handleSend = async (evt) => {
    evt.preventDefault();
    if (!input.trim() || loading) return;
    const userText = input.trim();

    // Inclui breve histórico para contexto do LLM (últimas 6 mensagens).
    const history = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Bot"}: ${m.text}`)
      .slice(-6)
      .join("\n");
    const messagePayload = history
      ? `${history}\nUsuario: ${userText}`
      : userText;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: userText },
    ]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messagePayload, top_k: 3 }),
      });

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const data = await res.json();
      const reply = data.answer || "Nao encontrei nada relevante.";
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
    <>
      <Header>
        <Title>Seu chatbot de comidas e receitas</Title>
        <ClearButton type="button" onClick={handleClear}>
          Limpar chat
        </ClearButton>
      </Header>

      <Main>
        <Card style={{ minHeight: "70vh" }}>
          <MessageList messages={messages} listRef={listRef} />

          {error && <ErrorText>{error}</ErrorText>}
          <Status>{loading ? "Buscando resposta..." : ""}</Status>

          <InputBar
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={loading}
          />
        </Card>
      </Main>
    </>
  );
}
