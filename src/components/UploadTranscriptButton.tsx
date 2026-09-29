'use client';

import React, { useRef } from 'react';

interface UploadTranscriptButtonProps {
  onFile: (file: File) => void;
}

export const UploadTranscriptButton: React.FC<UploadTranscriptButtonProps> = ({ onFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        className="toolbar-button primary"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload Transcript
      </button>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".txt,.json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFile(file);
            e.target.value = '';
          }
        }}
      />
    </>
  );
};
