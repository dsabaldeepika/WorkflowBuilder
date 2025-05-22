import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { messagingService, Message } from '@/services/messagingService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  content: z.string().min(1, 'Message is required'),
  contentType: z.enum(['text', 'image', 'video', 'document', 'audio']),
  integrationId: z.number(),
});

type SendMessageFormData = z.infer<typeof sendMessageSchema>;

export default function MessagingPage() {
  const queryClient = useQueryClient();
  const [activeIntegrationId, setActiveIntegrationId] = React.useState<number | null>(null);
  const [selectedRecipient, setSelectedRecipient] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { data: integrations = [], isLoading: loadingIntegrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => messagingService.getIntegrations(),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeIntegrationId, selectedRecipient],
    queryFn: () =>
      messagingService.getMessages({
        integrationId: activeIntegrationId || undefined,
        ...(selectedRecipient && { recipientId: selectedRecipient }),
      }),
    enabled: !!activeIntegrationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: messagingService.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupedMessages = React.useMemo(() => {
    const grouped: Record<string, Message[]> = {};
    messages.forEach((message) => {
      const recipientId = message.direction === 'outbound' ? message.recipientId : message.senderId;
      if (!grouped[recipientId]) {
        grouped[recipientId] = [];
      }
      grouped[recipientId].push(message);
    });
    return grouped;
  }, [messages]);

  const handleSendMessage = async (data: SendMessageFormData) => {
    if (!activeIntegrationId) return;

    await sendMessageMutation.mutateAsync({
      ...data,
      integrationId: activeIntegrationId,
      direction: 'outbound',
      status: 'pending',
    });
  };

  if (loadingIntegrations) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!integrations.length) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>No Integrations Found</CardTitle>
            <CardDescription>
              You need to set up at least one messaging integration before you can send messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {/* Navigate to integrations setup */}}>
              Set Up Integration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4">
            <Select
              value={activeIntegrationId?.toString()}
              onValueChange={(value) => setActiveIntegrationId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {integrations.map((integration) => (
                  <SelectItem key={integration.id} value={integration.id.toString()}>
                    {integration.name} ({integration.platform})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t">
            {Object.keys(groupedMessages).map((recipientId) => (
              <button
                key={recipientId}
                onClick={() => setSelectedRecipient(recipientId)}
                className={`w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedRecipient === recipientId ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <div className="font-medium">{recipientId}</div>
                <div className="text-sm text-gray-500 truncate">
                  {groupedMessages[recipientId][0]?.content}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="col-span-9 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
          {selectedRecipient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">{selectedRecipient}</h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  groupedMessages[selectedRecipient]?.map((message) => (
                    <MessageBubble
                      key={message.id}
                      content={message.content}
                      direction={message.direction}
                      timestamp={message.createdAt}
                      status={message.status}
                      contentType={message.contentType}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSubmit(handleSendMessage)} className="p-4 border-t">
                <div className="flex space-x-2">
                  <Select
                    defaultValue="text"
                    onValueChange={(value) => register('contentType').onChange({ target: { value } })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    {...register('content')}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
