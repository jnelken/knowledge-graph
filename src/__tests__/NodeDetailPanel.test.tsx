import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { NodeDetailPanel } from '@/components/NodeDetailPanel';
import { EdgeType, GraphEdge, GraphNode, NodeType } from '@/types/graph';

const node = (id: string, overrides: Partial<GraphNode> = {}): GraphNode => ({
  id,
  type: NodeType.STATEMENT,
  content: `${id} content`,
  metadata: { credibility: 0.9 },
  ...overrides
});

const edge = (id: string, source: string | GraphNode, target: string | GraphNode, type = EdgeType.SUPPORTS): GraphEdge => ({
  id,
  source,
  target,
  type,
  strength: 0.5,
  confidence: 0.9
});

const renderPanel = (props: Partial<React.ComponentProps<typeof NodeDetailPanel>> = {}) => {
  const handlers = {
    onNodeUpdate: vi.fn(),
    onNodeDelete: vi.fn(),
    onClose: vi.fn()
  };
  const allProps = {
    node: node('n1'),
    relatedEdges: [],
    relatedNodes: [],
    ...handlers,
    ...props
  };
  const result = render(<NodeDetailPanel {...allProps} />);
  return { ...result, ...handlers, props: allProps };
};

const panelButtons = () => within(screen.getByRole('tabpanel'));

const openRelationshipsTab = () => {
  fireEvent.mouseDown(screen.getByRole('tab', { name: /Relationships/ }));
};

const openActionsMenu = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NodeDetailPanel view mode', () => {
  it('renders nothing without a node', () => {
    const { container } = renderPanel({ node: null });
    expect(container.innerHTML).toBe('');
  });

  it('shows the title, formatted type badge, and content', () => {
    renderPanel({ node: node('n1', { type: NodeType.INSTITUTION, content: 'Acme Corp' }) });
    expect(screen.getByRole('heading', { name: 'Node Details' })).toBeTruthy();
    expect(screen.getByText('Institution')).toBeTruthy();
    expect(screen.getByText('Acme Corp')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('shows credibility as a rounded percentage', () => {
    renderPanel({ node: node('n1', { metadata: { credibility: 0.876 } }) });
    expect(screen.getByText('Confidence')).toBeTruthy();
    expect(screen.getByText('88%')).toBeTruthy();
  });

  it('falls back to 50% when credibility is missing or zero', () => {
    const { unmount } = renderPanel({ node: node('n1', { metadata: {} }) });
    expect(screen.getByText('50%')).toBeTruthy();
    unmount();
    renderPanel({ node: node('n1', { metadata: { credibility: 0 } }) });
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('shows only the metadata fields that are present', () => {
    const { unmount } = renderPanel({ node: node('n1', { metadata: { credibility: 0.9 } }) });
    for (const label of ['Source', 'Category', 'Timestamp', 'User Added', 'Context']) {
      expect(screen.queryByText(label)).toBeNull();
    }
    unmount();

    renderPanel({
      node: node('n1', {
        userAdded: true,
        metadata: {
          credibility: 0.9,
          source: 'Hearing transcript',
          category: 'Finance',
          timestamp: '2024-01-02',
          context: 'Said under oath'
        }
      })
    });
    expect(screen.getByText('Hearing transcript')).toBeTruthy();
    expect(screen.getByText('Finance')).toBeTruthy();
    expect(screen.getByText('2024-01-02')).toBeTruthy();
    expect(screen.getByText('User Added')).toBeTruthy();
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(screen.getByText('Said under oath')).toBeTruthy();
  });

  it('calls onClose from the close button', () => {
    const { onClose } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('NodeDetailPanel relationships tab', () => {
  it('counts edges in the tab label and lists direction, type, and the other node', () => {
    const self = node('n1');
    const other = node('n2', { content: 'Other claim' });
    const author = node('n3', { content: 'Jane Doe' });
    renderPanel({
      node: self,
      relatedEdges: [
        edge('e1', 'n1', 'n2', EdgeType.SUPPORTS),
        edge('e2', author, self, EdgeType.AUTHORED_BY),
        edge('e3', 'n1', 'missing', EdgeType.REFUTES)
      ],
      relatedNodes: [other, author]
    });

    expect(screen.getByRole('tab', { name: 'Relationships (3)' })).toBeTruthy();
    openRelationshipsTab();

    expect(screen.getByText('Supports →')).toBeTruthy();
    expect(screen.getByText('Other claim')).toBeTruthy();
    expect(screen.getByText('← Authored by')).toBeTruthy();
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('Refutes →')).toBeTruthy();
    expect(screen.getByText('Unknown node')).toBeTruthy();
  });

  it('says so when there are no relationships', () => {
    renderPanel();
    expect(screen.getByRole('tab', { name: 'Relationships (0)' })).toBeTruthy();
    openRelationshipsTab();
    expect(screen.getByText('No relationships.')).toBeTruthy();
  });
});

describe('NodeDetailPanel edit mode', () => {
  it('swaps the content for a focused textarea and Save/Cancel buttons', () => {
    renderPanel({ node: node('n1', { content: 'Original' }) });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Original');
    expect(document.activeElement).toBe(textarea);
    expect(panelButtons().getByRole('button', { name: 'Save' })).toBeTruthy();
    expect(panelButtons().getByRole('button', { name: 'Cancel' })).toBeTruthy();
    expect(panelButtons().queryByRole('button', { name: 'Delete' })).toBeNull();
  });

  it('saves trimmed changed content and leaves edit mode', () => {
    const { onNodeUpdate } = renderPanel({ node: node('n1', { content: 'Original' }) });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Revised  ' } });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Save' }));

    expect(onNodeUpdate).toHaveBeenCalledWith('n1', { content: 'Revised' });
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('skips the update when the trimmed content is unchanged', () => {
    const { onNodeUpdate } = renderPanel({ node: node('n1', { content: 'Original' }) });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: ' Original ' } });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Save' }));

    expect(onNodeUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('saves whitespace-only content as an empty string', () => {
    const { onNodeUpdate } = renderPanel({ node: node('n1', { content: 'Original' }) });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Save' }));

    expect(onNodeUpdate).toHaveBeenCalledWith('n1', { content: '' });
  });

  it('cancel discards the draft without updating', () => {
    const { onNodeUpdate } = renderPanel({ node: node('n1', { content: 'Original' }) });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Draft' } });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Cancel' }));

    expect(onNodeUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Original');
  });

  it('drafts the newly selected node when the node prop changes without a remount', () => {
    const { rerender, props } = renderPanel({ node: node('n1', { content: 'First' }) });
    rerender(<NodeDetailPanel {...props} node={node('n2', { content: 'Second' })} />);
    expect(screen.getByText('Second')).toBeTruthy();

    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Second');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Second revised' } });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Save' }));
    expect(props.onNodeUpdate).toHaveBeenCalledTimes(1);
    expect(props.onNodeUpdate).toHaveBeenCalledWith('n2', { content: 'Second revised' });
  });

  it('discards an unsaved draft and leaves edit mode when another node is selected', () => {
    const { rerender, props } = renderPanel({ node: node('n1', { content: 'First' }) });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Unsaved first draft' } });

    rerender(<NodeDetailPanel {...props} node={node('n2', { content: 'Second' })} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Second')).toBeTruthy();

    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Second');
    fireEvent.click(panelButtons().getByRole('button', { name: 'Save' }));
    expect(props.onNodeUpdate).not.toHaveBeenCalled();
  });

  it('keeps the draft when the same node rerenders with updated fields', () => {
    const { rerender, props } = renderPanel({ node: node('n1', { content: 'First' }) });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'In progress' } });

    rerender(<NodeDetailPanel {...props} node={node('n1', { content: 'First', metadata: { credibility: 0.5 } })} />);
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('In progress');
  });
});

describe('NodeDetailPanel delete', () => {
  it('deletes and closes after the inline button is confirmed', () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal('confirm', confirm);
    const { onNodeDelete, onClose } = renderPanel();
    fireEvent.click(panelButtons().getByRole('button', { name: 'Delete' }));

    expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete this node and all its connections?');
    expect(onNodeDelete).toHaveBeenCalledWith('n1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the inline confirm is declined', () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const { onNodeDelete, onClose } = renderPanel();
    fireEvent.click(panelButtons().getByRole('button', { name: 'Delete' }));

    expect(onNodeDelete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('NodeDetailPanel actions menu', () => {
  it('offers Edit, which enters edit mode', () => {
    renderPanel();
    openActionsMenu();
    const menu = screen.getByRole('dialog');
    fireEvent.click(within(menu).getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('offers Save and Cancel while editing', () => {
    const { onNodeUpdate } = renderPanel({ node: node('n1', { content: 'Original' }) });
    fireEvent.click(panelButtons().getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Revised' } });
    openActionsMenu();
    const menu = screen.getByRole('dialog');
    expect(within(menu).getByRole('button', { name: 'Cancel' })).toBeTruthy();
    fireEvent.click(within(menu).getByRole('button', { name: 'Save' }));

    expect(onNodeUpdate).toHaveBeenCalledWith('n1', { content: 'Revised' });
  });

  it('deletes and closes from the confirmation dialog', () => {
    const { onNodeDelete, onClose } = renderPanel();
    openActionsMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Delete…' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete Node' });
    expect(within(dialog).getByText(/This action cannot be undone/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(onNodeDelete).toHaveBeenCalledWith('n1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('leaves the node alone when the confirmation dialog is cancelled', () => {
    const { onNodeDelete, onClose } = renderPanel();
    openActionsMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Delete…' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete Node' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(onNodeDelete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Delete Node' })).toBeNull();
  });
});
