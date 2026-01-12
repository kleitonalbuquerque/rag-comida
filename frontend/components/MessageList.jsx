"use client";

import styled from "styled-components";
import { marked } from "marked";

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
`;

const MessageRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.role === "user" ? "flex-end" : "flex-start")};
  gap: 4px;
`;

const Bubble = styled.div`
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

const Time = styled.small`
  color: var(--muted);
  font-size: 11px;
`;

const formatTime = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
};

const renderMarkdown = (value) => {
  if (!value) return "";
  return marked.parse(value, { breaks: true, mangle: false, headerIds: false });
};

export function MessageList({ messages, listRef }) {
  return (
    <List ref={listRef}>
      {messages.map((m) => (
        <MessageRow key={m.id} role={m.role}>
          <Bubble
            role={m.role}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
          />
          <Time>{formatTime(m.ts)}</Time>
        </MessageRow>
      ))}
    </List>
  );
}
