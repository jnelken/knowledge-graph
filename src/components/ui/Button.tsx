"use client";

import React from "react";
import { css, cx } from "@emotion/css";

export type ButtonVariant = "default" | "primary" | "outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  className?: string;
}

const base = css`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;

  &:hover { background: #f5f5f5; border-color: #999; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const variants: Record<ButtonVariant, string> = {
  default: css``,
  outline: css`background: white;`,
  primary: css`
    background: #2196f3;
    color: white;
    border-color: #2196f3;
    &:hover { background: #1976d2; }
  `,
};

export const Button: React.FC<ButtonProps> = ({ variant = "default", className, ...props }) => (
  <button className={cx(base, variants[variant], className)} {...props} />
);

