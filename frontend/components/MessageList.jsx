"use client";

import styled from "styled-components";

const List = styled.div`
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

export function MessageList({ messages, listRef }) {
  return (
    <List ref={listRef}>
      {messages.map((m) => (
        <Bubble key={m.id} role={m.role}>
          {m.text}
        </Bubble>
      ))}
    </List>
  );
}
