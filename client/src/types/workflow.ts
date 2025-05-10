import { ReactNode } from "react";
import { LucideProps } from "lucide-react";

export interface Module {
  id: string;
  label: string;
  description: string;
  type: 'trigger' | 'action';
  icon: React.ComponentType<LucideProps>;
}

export interface App {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  iconBg: string;
  iconColor: string;
  modules: Module[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    appId: string;
    moduleId: string;
    config?: Record<string, any>;
  };
}
