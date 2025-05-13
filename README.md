# PumpFlux - State Animation Documentation

PumpFlux uses advanced animations to provide visual feedback on workflow state changes. This document explains the animation systems and how to use them effectively in the application.

## Table of Contents
- [StateChangeAnimation System](#statechangeanimation-system)
- [WorkflowAnimationCard Component](#workflowanimationcard-component)
- [Animation States](#animation-states)
- [Usage Examples](#usage-examples)
- [Custom Animation Integration](#custom-animation-integration)

## StateChangeAnimation System

The `StateChangeAnimation` system provides a suite of components for visualizing workflow state transitions throughout the application. The system is built with Framer Motion and React to provide smooth, physics-based animations that convey status changes in an intuitive way.

### Core Components

- **WorkflowStateProvider**: Context provider that manages workflow state and history
- **StateChangeAnimation**: Animates transitions between workflow states with configurable styles
- **WorkflowStateIndicator**: Visual indicator for a specific workflow state
- **WorkflowStateTransition**: Shows current state with reference to previous state
- **WorkflowStateHistory**: Displays a history log of state transitions
- **WorkflowStateProgressBar**: Progress bar with state-specific visual feedback
- **WorkflowStateBadge**: Badge component showing state with appropriate styling

### State Types

```typescript
export type WorkflowState = 'idle' | 'starting' | 'running' | 'completed' | 'failed' | 'paused' | 'retrying' | 'waiting';
```

Each state has specific visual properties (colors, icons, animations) defined in the `stateConfig` object.

## WorkflowAnimationCard Component

The `WorkflowAnimationCard` component provides a card interface for displaying workflows with animated state indicators. This component is useful for dashboard views and workflow listings.

### Features

- Displays workflow state with animated transitions
- Shows workflow metadata (last run, next run, type)
- Optional controls for changing workflow state (for demo or testing)
- Hover effects for improved interactivity

## Animation States

PumpFlux uses a consistent visual language for workflow states:

| State | Color | Icon | Animation | Description |
|-------|-------|------|-----------|-------------|
| idle | Slate | Clock | Static | Workflow is waiting to start |
| starting | Blue | PlayCircle | Pulse | Workflow is initializing |
| running | Blue | Loader2 | Spin | Workflow is actively running |
| completed | Green | CheckCircle | Glow | Workflow completed successfully |
| failed | Red | XCircle | Shake | Workflow encountered an error |
| paused | Amber | PauseCircle | Flash | Workflow execution is paused |
| retrying | Purple | RefreshCcw | Spin | Attempting to run again after failure |
| waiting | Slate | Clock | Static | Waiting for input or configuration |

## Usage Examples

### Basic State Indicator

```jsx
import { StateChangeAnimation } from './components/workflow/StateChangeAnimation';

<StateChangeAnimation state="running" />
```

### State with Progress Bar

```jsx
import { WorkflowStateProgressBar } from './components/workflow/StateChangeAnimation';

<WorkflowStateProgressBar state="running" progress={65} />
```

### Full State Management

```jsx
import { 
  WorkflowStateProvider, 
  useWorkflowState, 
  WorkflowStateTransition 
} from './components/workflow/StateChangeAnimation';

function WorkflowStatusPanel() {
  const { setState } = useWorkflowState();
  
  return (
    <div>
      <WorkflowStateTransition />
      <button onClick={() => setState('running')}>Start Workflow</button>
      <button onClick={() => setState('completed')}>Complete</button>
    </div>
  );
}

// Wrap with provider
<WorkflowStateProvider initialState="idle">
  <WorkflowStatusPanel />
</WorkflowStateProvider>
```

## Custom Animation Integration

The animation system is designed to be flexible and can be integrated into custom components:

1. Use the `useWorkflowState` hook to access state management functions
2. Implement state transitions with appropriate timing
3. Apply the provided animation components to visualize state

### Example: Creating custom workflow node with state visualization

```jsx
import { WorkflowStateProvider, WorkflowStateIndicator } from './components/workflow/StateChangeAnimation';

function CustomWorkflowNode({ initialState = 'idle' }) {
  const [nodeState, setNodeState] = useState(initialState);
  
  return (
    <WorkflowStateProvider initialState={initialState}>
      <div className="custom-node">
        <div className="node-header">
          <h3>Custom Node</h3>
          <WorkflowStateIndicator state={nodeState} />
        </div>
        <div className="node-actions">
          <button onClick={() => setNodeState('running')}>Run</button>
          <button onClick={() => setNodeState('paused')}>Pause</button>
        </div>
      </div>
    </WorkflowStateProvider>
  );
}
```

For detailed implementation references, see the source code in:
- `client/src/components/workflow/StateChangeAnimation.tsx`
- `client/src/components/workflow/WorkflowAnimationCard.tsx`