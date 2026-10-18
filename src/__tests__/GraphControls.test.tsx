import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { GraphControls } from '@/components/GraphControls';
import { DEFAULT_LAYOUT } from '@/constants/graphDefaults';
import { EdgeType, GraphFilter, LayoutSettings, NodeType } from '@/types/graph';

const baseFilter = (): GraphFilter => ({
  nodeTypes: new Set([NodeType.STATEMENT]),
  edgeTypes: new Set([EdgeType.SUPPORTS]),
  searchQuery: '',
  confidenceThreshold: 0.5,
  showUserAdded: true
});

const renderControls = (
  overrides: {
    filter?: GraphFilter;
    layout?: LayoutSettings;
  } = {}
) => {
  const handlers = {
    onFilterChange: vi.fn(),
    onLayoutChange: vi.fn(),
    onExportGraph: vi.fn(),
    onImportGraph: vi.fn(),
    onClearGraph: vi.fn()
  };
  const props = {
    filter: overrides.filter ?? baseFilter(),
    layout: overrides.layout ?? { ...DEFAULT_LAYOUT },
    ...handlers
  };
  const result = render(<GraphControls {...props} />);
  return { ...result, ...handlers, props };
};

const layoutSection = () => {
  const title = screen.getByText('Layout');
  const section = title.closest('.section');
  if (!section) throw new Error('Layout section not found');
  return within(section as HTMLElement);
};

const layoutSlider = (label: string) => {
  const section = layoutSection();
  const labelEl = section.getByText(label);
  const group = labelEl.closest('.slider-group');
  if (!group) throw new Error(`Slider group for ${label} not found`);
  return within(group as HTMLElement).getByRole('slider') as HTMLInputElement;
};

describe('GraphControls layout', () => {
  it('renders Layout slider values from layout props', () => {
    renderControls({
      layout: {
        strength: 0.7,
        distance: 200,
        charge: -450,
        centerForce: 0.1,
        collisionRadius: 20
      }
    });

    expect(layoutSlider('Link Strength').value).toBe('0.7');
    expect(layoutSlider('Link Distance').value).toBe('200');
    expect(layoutSlider('Repulsion Force').value).toBe('450');
  });

  it('formats Link Strength to one decimal and shows absolute repulsion', () => {
    renderControls({
      layout: {
        strength: 0.3,
        distance: 150,
        charge: -250,
        centerForce: 0.1,
        collisionRadius: 20
      }
    });

    const section = layoutSection();
    expect(section.getByText('0.3')).toBeTruthy();
    expect(section.getByText('150')).toBeTruthy();
    expect(section.getByText('250')).toBeTruthy();
  });

  it('converts Link Strength with parseFloat on change', () => {
    const { onLayoutChange } = renderControls({
      layout: { ...DEFAULT_LAYOUT, strength: 0.1 }
    });

    fireEvent.change(layoutSlider('Link Strength'), { target: { value: '0.5' } });

    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    expect(onLayoutChange.mock.calls[0][0].strength).toBe(0.5);
    expect(typeof onLayoutChange.mock.calls[0][0].strength).toBe('number');
  });

  it('converts Link Distance with parseInt on change', () => {
    const { onLayoutChange } = renderControls({
      layout: { ...DEFAULT_LAYOUT, distance: 100 }
    });

    fireEvent.change(layoutSlider('Link Distance'), { target: { value: '180' } });

    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    expect(onLayoutChange.mock.calls[0][0].distance).toBe(180);
    expect(typeof onLayoutChange.mock.calls[0][0].distance).toBe('number');
  });

  it('stores Repulsion Force as a negative charge', () => {
    const { onLayoutChange } = renderControls({
      layout: { ...DEFAULT_LAYOUT, charge: -300 }
    });

    fireEvent.change(layoutSlider('Repulsion Force'), { target: { value: '500' } });

    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    expect(onLayoutChange.mock.calls[0][0].charge).toBe(-500);
  });

  it('preserves unrelated layout fields when one slider changes', () => {
    const layout: LayoutSettings = {
      strength: 0.4,
      distance: 120,
      charge: -350,
      centerForce: 0.25,
      collisionRadius: 18
    };
    const { onLayoutChange } = renderControls({ layout });

    fireEvent.change(layoutSlider('Link Strength'), { target: { value: '0.8' } });

    expect(onLayoutChange).toHaveBeenCalledWith({
      strength: 0.8,
      distance: 120,
      charge: -350,
      centerForce: 0.25,
      collisionRadius: 18
    });
  });

  it('exposes the expected range attributes on each layout slider', () => {
    renderControls();

    const strength = layoutSlider('Link Strength');
    expect(strength.min).toBe('0');
    expect(strength.max).toBe('1');
    expect(strength.step).toBe('0.1');

    const distance = layoutSlider('Link Distance');
    expect(distance.min).toBe('50');
    expect(distance.max).toBe('300');
    expect(distance.step).toBe('10');

    const repulsion = layoutSlider('Repulsion Force');
    expect(repulsion.min).toBe('100');
    expect(repulsion.max).toBe('1000');
    expect(repulsion.step).toBe('50');
  });
});
