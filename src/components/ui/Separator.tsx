"use client";

import * as Separator from "@radix-ui/react-separator";
import { css, cx } from "@emotion/css";
import React from "react";

export interface UISeparatorProps extends React.ComponentPropsWithoutRef<typeof Separator.Root> {
  className?: string;
}

const base = css`
  background-color: #eaeaea;
  &[data-orientation="horizontal"] { height: 1px; width: 100%; }
  &[data-orientation="vertical"] { width: 1px; height: 100%; }
`;

export const UISeparator: React.FC<UISeparatorProps> = ({ className, ...props }) => (
  <Separator.Root decorative className={cx(base, className)} {...props} />
);

