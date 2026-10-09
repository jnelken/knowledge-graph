export const controlRules = `  .relationships-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .relationship-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 8px;
    font-size: 13px;
    background: white;
  }

  .relationship-type {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 500;
    color: white;
    margin-right: 8px;
    min-width: 60px;
    text-align: center;
  }

  .relationship-target {
    flex: 1;
    color: #333;
  }

  .confidence-meter {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .confidence-bar {
    flex: 1;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    background: linear-gradient(90deg, #f44336 0%, #ff9800 50%, #4caf50 100%);
    transition: width 0.3s ease;
  }

  .confidence-value {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    min-width: 35px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    margin-top: 20px;
  }

  .button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f5f5;
      border-color: #999;
    }

    &.primary {
      background: #2196f3;
      color: white;
      border-color: #2196f3;

      &:hover {
        background: #1976d2;
      }
    }

    &.danger {
      background: #f44336;
      color: white;
      border-color: #f44336;

      &:hover {
        background: #d32f2f;
      }
    }
  }

  .edit-mode {
    .content-area {
      background: white;
      border-color: #2196f3;
    }
  }
`;
