"use client";

import styled from "styled-components";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/TextArea";

const Row = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export function InputBar({ value, onChange, onSend, disabled }) {
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    }
  };

  return (
    <Row onSubmit={onSend}>
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pergunte algo sobre comidas ou receitas"
        disabled={disabled}
        onKeyDown={handleKeyDown}
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Enviar
      </Button>
    </Row>
  );
}
