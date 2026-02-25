/**
 * FeatureSelect Component (T-008, Story S2)
 *
 * Renders 5 workflow tabs as horizontal chips.
 * Dispatches SET_WORKFLOW action to change the active workflow.
 */
import { useApp } from '../../context/AppContext';
import { WORKFLOW_LABELS } from '../../../infrastructure/mock/data';
import { WORKFLOW_TYPES } from '../../../domain/entities/types';
import type { WorkflowType } from '../../../domain/entities/types';
import styles from './FeatureSelect.module.css';

export default function FeatureSelect() {
  const { state, dispatch } = useApp();

  const handleTabClick = (workflow: WorkflowType) => {
    dispatch({ type: 'SET_WORKFLOW', payload: workflow });
  };

  return (
    <div className={styles.container} role="tablist" aria-label="Workflow selection">
      {WORKFLOW_TYPES.map((workflow) => {
        const isSelected = state.selectedWorkflow === workflow;

        return (
          <button
            key={workflow}
            role="tab"
            aria-selected={isSelected}
            className={`${styles.tab} ${isSelected ? styles.active : ''}`}
            onClick={() => handleTabClick(workflow)}
          >
            {WORKFLOW_LABELS[workflow]}
          </button>
        );
      })}
    </div>
  );
}
