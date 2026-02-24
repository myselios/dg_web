import { useApp } from '../../context/AppContext';
import { WORKFLOW_LABELS } from '../../../infrastructure/mock/data';
import type { WorkflowType } from '../../../domain/entities/types';
import styles from './FeatureSelect.module.css';

const WORKFLOWS = Object.keys(WORKFLOW_LABELS) as WorkflowType[];

export function FeatureSelect() {
  const { state, dispatch } = useApp();

  return (
    <nav className={styles.wrapper} aria-label="Workflow selection">
      {WORKFLOWS.map((wf) => (
        <button
          key={wf}
          className={`${styles.chip} ${state.selectedWorkflow === wf ? styles.chipActive : ''}`}
          onClick={() => dispatch({ type: 'SET_WORKFLOW', payload: wf })}
          aria-pressed={state.selectedWorkflow === wf}
        >
          {WORKFLOW_LABELS[wf]}
        </button>
      ))}
    </nav>
  );
}
