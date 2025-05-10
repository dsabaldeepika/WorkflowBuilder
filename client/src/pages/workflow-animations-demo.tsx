import React from 'react';
import WorkflowStateDemo from '@/components/workflow/WorkflowStateDemo';

export default function WorkflowAnimationsDemoPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workflow State Animations</h1>
        <p className="text-muted-foreground">
          This page demonstrates the micro-animations used to highlight workflow state transitions.
          These animations provide visual feedback to users when workflow states change.
        </p>
      </div>
      
      <WorkflowStateDemo />
    </div>
  );
}