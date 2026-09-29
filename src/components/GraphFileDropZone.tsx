'use client';

import React, { useCallback, useState } from 'react';
import { css, cx } from '@emotion/css';
import { pickGraphFile } from '@/utils/data/graphFiles';

const overlayStyles = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(33, 150, 243, 0.1);
  border: 2px dashed #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #2196f3;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const activeOverlayStyles = css`
  opacity: 1;
  pointer-events: all;
`;

interface GraphFileDropZoneProps {
  onFile: (file: File) => void;
  children: React.ReactNode;
}

export const GraphFileDropZone: React.FC<GraphFileDropZoneProps> = ({ onFile, children }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = pickGraphFile(Array.from(event.dataTransfer.files));
    if (file) {
      onFile(file);
    } else {
      alert('Please drop a .txt transcript file or .json graph file');
    }
  }, [onFile]);

  return (
    <div
      className="graph-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      <div className={cx(overlayStyles, isDragging && activeOverlayStyles)}>
        Drop transcript or graph files here
      </div>
    </div>
  );
};
