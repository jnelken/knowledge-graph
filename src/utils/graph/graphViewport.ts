const SIDEBAR_WIDTH = 300;
const DETAIL_PANEL_WIDTH = 400;
const TOOLBAR_HEIGHT = 60;

export function getGraphViewportSize(hasDetailPanel: boolean): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 800, height: 600 };
  return {
    width: window.innerWidth - SIDEBAR_WIDTH - (hasDetailPanel ? DETAIL_PANEL_WIDTH : 0),
    height: window.innerHeight - TOOLBAR_HEIGHT
  };
}
