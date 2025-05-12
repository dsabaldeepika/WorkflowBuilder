import { useLocation } from 'wouter';
import { TemplateWorkflowSetup } from '@/components/templates/TemplateWorkflowSetup';

export default function TemplateSetupPage() {
  const [location] = useLocation();
  
  // Extract template ID from URL query parameters
  const templateId = new URLSearchParams(location.split('?')[1]).get('template');
  
  return <TemplateWorkflowSetup templateId={templateId} />;
}