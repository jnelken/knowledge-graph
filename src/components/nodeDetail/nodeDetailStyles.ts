import { css } from '@emotion/css';
import { controlRules } from './nodeDetailControlStyles';

const layoutRules = `
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .panel-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    background: #f8f9fa;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .header-actions { display: inline-flex; gap: 8px; align-items: center; }
  .icon-btn { background: none; border: 1px solid #ddd; border-radius: 6px; padding: 4px 8px; cursor: pointer; }
  .icon-btn:hover { background: #f5f5f5; }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 4px;
    
    &:hover {
      color: #333;
    }
  }

  .panel-content {
    padding: 20px;
  }

  .tabs-list { display: flex; gap: 8px; border-bottom: 1px solid #eaeaea; margin-bottom: 12px; }
  .tab-trigger { padding: 6px 10px; border: none; background: transparent; cursor: pointer; border-bottom: 2px solid transparent; }
  .tab-trigger[data-state="active"] { border-bottom-color: #2196f3; color: #2196f3; }

  .section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .node-type-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    margin-bottom: 12px;
  }

  .content-area {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 12px;
    background: #f8f9fa;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    min-height: 60px;
    resize: vertical;
    font-family: inherit;
    
    &:focus {
      outline: none;
      border-color: #2196f3;
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
    }
  }

  .metadata-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .metadata-item {
    font-size: 13px;
  }

  .metadata-label {
    font-weight: 500;
    color: #666;
    margin-bottom: 4px;
  }

  .metadata-value {
    color: #333;
    word-break: break-word;
  }

`;

export const panelStyles = css`${layoutRules}${controlRules}`;
