import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Target,
  Settings,
  Tags,
  BarChart,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  AlertCircle,
  Check,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const steps = [
  {
    id: 'basics',
    title: 'Basic Information',
    description: 'Start with the fundamentals',
    icon: Rocket,
  },
  {
    id: 'details',
    title: 'Template Details',
    description: 'Add more specific information',
    icon: Target,
  },
  {
    id: 'configuration',
    title: 'Configuration',
    description: 'Set up template behavior',
    icon: Settings,
  }
];

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.array(z.string()).min(1, 'Add at least one tag'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isPublic: z.boolean(),
  version: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (template: FormValues) => Promise<void>;
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onCreateTemplate,
}: CreateTemplateModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      tags: [],
      difficulty: 'medium',
      isPublic: true,
      version: '1.0.0',
    },
  });

  const handleNext = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fields);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): (keyof FormValues)[] => {
    switch (step) {
      case 0:
        return ['name', 'description'];
      case 1:
        return ['category', 'tags', 'difficulty'];
      case 2:
        return ['isPublic', 'version'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await onCreateTemplate(data);
      onClose();
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Create New Template
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Build a new workflow template in three simple steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="relative mb-8 mt-4">
          <div className="absolute top-5 w-full h-[2px] bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="relative z-10 flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200",
                      index <= currentStep
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-600">
                    {step.title}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Customer Onboarding Workflow"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Choose a clear, descriptive name for your template
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what this workflow template does..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Explain the purpose and benefits of this workflow
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="lead-management">
                                Lead Management
                              </SelectItem>
                              <SelectItem value="team-notifications">
                                Team Notifications
                              </SelectItem>
                              <SelectItem value="data-synchronization">
                                Data Synchronization
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the most relevant category for your template
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Set the complexity level for implementing this workflow
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 1.0.0"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify the version number for your template
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Public Template
                            </FormLabel>
                            <FormDescription>
                              Make this template available to all users
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Template
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 