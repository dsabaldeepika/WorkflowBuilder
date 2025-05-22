import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Settings2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { messagingService, MessagingIntegration } from '@/services/messagingService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';

const integrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  platform: z.enum(['whatsapp', 'instagram', 'facebook', 'telegram']),
  authType: z.enum(['oauth2', 'api_key']),
  credentials: z.record(z.any()),
  webhookSecret: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  rateLimitPerMinute: z.number().min(1),
  isActive: z.boolean(),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedIntegration, setSelectedIntegration] = React.useState<MessagingIntegration | null>(null);

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => messagingService.getIntegrations(),
  });

  const createMutation = useMutation({
    mutationFn: messagingService.createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      setIsFormOpen(false);
      toast.success('Integration created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: MessagingIntegration) =>
      messagingService.updateIntegration(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      setIsFormOpen(false);
      setSelectedIntegration(null);
      toast.success('Integration updated successfully');
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      rateLimitPerMinute: 60,
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (selectedIntegration) {
      reset(selectedIntegration);
    }
  }, [selectedIntegration, reset]);

  const handleOpenForm = (integration?: MessagingIntegration) => {
    setSelectedIntegration(integration || null);
    setIsFormOpen(true);
    if (!integration) {
      reset({
        rateLimitPerMinute: 60,
        isActive: true,
      });
    }
  };

  const handleFormSubmit = async (data: IntegrationFormData) => {
    if (selectedIntegration) {
      await updateMutation.mutateAsync({ ...selectedIntegration, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.platform}</span>
      ),
    },
    {
      accessorKey: 'authType',
      header: 'Auth Type',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.authType}</span>
      ),
    },
    {
      accessorKey: 'quotaUsed',
      header: 'Messages Sent',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.quotaUsed}</span>
          <span className="text-xs text-gray-500">
            of {row.original.rateLimitPerMinute}/min
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.original.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleOpenForm(row.original)}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const selectedPlatform = watch('platform');

  const renderAuthFields = () => {
    switch (selectedPlatform) {
      case 'whatsapp':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumberId" className="text-right">
                Phone Number ID
              </Label>
              <Input
                id="phoneNumberId"
                {...register('credentials.phoneNumberId')}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                {...register('credentials.apiKey')}
                className="col-span-3"
              />
            </div>
          </>
        );
      case 'instagram':
      case 'facebook':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accessToken" className="text-right">
                Access Token
              </Label>
              <Input
                id="accessToken"
                type="password"
                {...register('credentials.accessToken')}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pageId" className="text-right">
                Page ID
              </Label>
              <Input
                id="pageId"
                {...register('credentials.pageId')}
                className="col-span-3"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messaging Integrations</h1>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          New Integration
        </Button>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Integration Overview</CardTitle>
            <CardDescription>
              Monitor your messaging integrations and their usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {integrations.length}
                </span>
                <span className="text-sm text-gray-500">
                  Active Integrations
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {integrations.reduce(
                    (acc, curr) => acc + curr.quotaUsed,
                    0
                  )}
                </span>
                <span className="text-sm text-gray-500">
                  Total Messages (24h)
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {integrations.reduce(
                    (acc, curr) => acc + curr.rateLimitPerMinute,
                    0
                  )}
                </span>
                <span className="text-sm text-gray-500">
                  Messages/min Capacity
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <DataTable
          columns={columns}
          data={integrations}
          loading={isLoading}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration ? 'Edit Integration' : 'New Integration'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  {...register('name')}
                  error={errors.name?.message}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform" className="text-right">
                  Platform
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue('platform', value as IntegrationFormData['platform'])
                  }
                  defaultValue={selectedIntegration?.platform}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderAuthFields()}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="webhookUrl" className="text-right">
                  Webhook URL
                </Label>
                <Input
                  id="webhookUrl"
                  className="col-span-3"
                  {...register('webhookUrl')}
                  error={errors.webhookUrl?.message}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="webhookSecret" className="text-right">
                  Webhook Secret
                </Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  className="col-span-3"
                  {...register('webhookSecret')}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rateLimitPerMinute" className="text-right">
                  Rate Limit
                </Label>
                <Input
                  id="rateLimitPerMinute"
                  type="number"
                  className="col-span-3"
                  {...register('rateLimitPerMinute', { valueAsNumber: true })}
                  error={errors.rateLimitPerMinute?.message}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Active</Label>
                <Switch
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
