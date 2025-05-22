import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { messagingService, MessageTemplate } from '@/services/messagingService';
import { TemplateFormDialog } from '@/components/messaging/TemplateFormDialog';
import { toast } from 'react-hot-toast';

export default function MessagingTemplatesPage() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = React.useState<MessageTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => messagingService.getTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: messagingService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MessageTemplate> }) =>
      messagingService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setIsFormOpen(false);
      setSelectedTemplate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: messagingService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast.success('Template deleted successfully');
    },
  });

  const approveMutation = useMutation({
    mutationFn: messagingService.approveTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast.success('Template approved successfully');
    },
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'language',
      header: 'Language',
    },
    {
      accessorKey: 'isApproved',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.original.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.original.isApproved ? 'Approved' : 'Pending'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSelectedTemplate(row.original);
                setIsFormOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            {!row.original.isApproved && (
              <DropdownMenuItem
                onClick={() => approveMutation.mutate(row.original.id)}
              >
                Approve
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm('Are you sure you want to delete this template?')) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleSubmit = async (data: Partial<MessageTemplate>) => {
    if (selectedTemplate) {
      await updateMutation.mutateAsync({ id: selectedTemplate.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Message Templates</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={templates}
        loading={isLoading}
      />

      <TemplateFormDialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTemplate(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedTemplate || undefined}
        title={selectedTemplate ? 'Edit Template' : 'Create Template'}
      />
    </div>
  );
}

const MoreHorizontalIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);
