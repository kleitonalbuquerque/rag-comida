"use client";

import styled from "styled-components";

const BaseTextArea = styled.textarea`
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

export const TextArea = (props) => <BaseTextArea {...props} />;
