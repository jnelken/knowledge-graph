"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import { css, cx } from "@emotion/css";

export interface RootSelectOption {
  label: string;
  value: string;
}

interface RootSelectProps {
  options: RootSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const trigger = css`
  min-width: 240px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
`;

const content = css`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 6px 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
`;

const item = css`
  font-size: 13px;
  padding: 6px 10px;
  cursor: pointer;
  color: #333;
  &:hover,
  &[data-state="checked"] { background: #f5f7fb; }
`;

export const RootSelect: React.FC<RootSelectProps> = ({ options, value, onChange, placeholder = "Select root", className }) => (
  <Select.Root value={value} onValueChange={onChange}>
    <Select.Trigger className={cx(trigger, className)} aria-label="Root selector">
      <Select.Value placeholder={placeholder} />
      <Select.Icon>▾</Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className={content} position="popper" sideOffset={6}>
        <Select.Viewport>
          {options.map(opt => (
            <Select.Item key={opt.value} className={item} value={opt.value}>
              <Select.ItemText>{opt.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

