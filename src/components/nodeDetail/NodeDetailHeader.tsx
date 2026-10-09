'use client';

import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import { NodeDraft } from '@/hooks/useNodeDraft';

interface NodeDetailHeaderProps {
  draft: NodeDraft;
  onDelete: () => void;
  onClose: () => void;
}

export const NodeDetailHeader: React.FC<NodeDetailHeaderProps> = ({ draft, onDelete, onClose }) => (
  <div className="panel-header">
    <h2 className="panel-title">Node Details</h2>
    <div className="header-actions">
      <Popover.Root>
        <Popover.Trigger className="icon-btn" aria-label="Actions">Actions ▾</Popover.Trigger>
        <Popover.Content sideOffset={8} align="end" style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
          {draft.isEditing ? (
            <>
              <button className="icon-btn" onClick={draft.save}>Save</button>
              <button className="icon-btn" onClick={draft.cancel}>Cancel</button>
            </>
          ) : (
            <>
              <button className="icon-btn" onClick={draft.startEditing}>Edit</button>
              <Dialog.Root>
                <Dialog.Trigger className="icon-btn">Delete…</Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
                  <Dialog.Content style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: 12, border: '1px solid #e0e0e0', padding: 20, minWidth: 360, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <Dialog.Title style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Delete Node</Dialog.Title>
                    <Dialog.Description style={{ marginTop: 8, fontSize: 13, color: '#555' }}>
                      This will remove the node and all its connections. This action cannot be undone.
                    </Dialog.Description>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                      <Dialog.Close asChild>
                        <button className="button">Cancel</button>
                      </Dialog.Close>
                      <Dialog.Close asChild>
                        <button className="button danger" onClick={onDelete}>Delete</button>
                      </Dialog.Close>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </>
          )}
          <Popover.Arrow width={10} height={5} style={{ fill: 'white', stroke: '#e0e0e0' }} />
        </Popover.Content>
      </Popover.Root>
      <button className="close-button" onClick={onClose}>×</button>
    </div>
  </div>
);
