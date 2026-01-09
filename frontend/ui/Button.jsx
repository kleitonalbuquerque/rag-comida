"use client";

import styled from "styled-components";

const BaseButton = styled.button`
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

export const Button = (props) => <BaseButton {...props} />;
