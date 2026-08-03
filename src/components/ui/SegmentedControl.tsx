"use client";

import React from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { css, cx } from "@emotion/css";

export interface SegmentOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const root = css`
  display: inline-flex;
  gap: 4px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 4px;
`;

const item = css`
  min-width: 90px;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: #333;
  &:hover { background: #f7f7f7; }
  &[data-state="on"] {
    background: #2196f3;
    color: white;
  }
`;

export function SegmentedControl<T extends string = string>({ options, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      className={cx(root, className)}
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label="Toggle view"
    >
      {options.map((opt) => (
        <ToggleGroup.Item key={opt.value} className={item} value={opt.value}>
          {opt.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
