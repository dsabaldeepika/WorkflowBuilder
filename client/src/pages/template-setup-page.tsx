import { useParams } from 'wouter';
import { TemplateWorkflowSetup } from '@/components/templates/TemplateWorkflowSetup';

export default function TemplateSetupPage() {
  // Extract template ID from route parameters
  const params = useParams();
  const templateId = params.id;
  
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Configure Workflow Template</h1>
      {templateId ? (
        <TemplateWorkflowSetup templateId={templateId} />
      ) : (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Template Not Found</h2>
          <p className="mb-4">The requested template could not be found.</p>
          <a href="/templates" className="text-primary hover:underline">
            ← Return to Template Gallery
          </a>
        </div>
      )}
    </div>
  );
}