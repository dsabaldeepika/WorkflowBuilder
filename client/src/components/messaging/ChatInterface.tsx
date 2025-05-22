import React from 'react';
import { Message } from '@/services/messagingService';
import { MessageBubble } from './MessageBubble';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Image as ImageIcon, Mic } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, contentType: Message['contentType']) => Promise<void>;
  isLoading?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [message, setMessage] = React.useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await onSendMessage(message, 'text');
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (file: File, type: Message['contentType']) => {
    // Convert file to base64 or handle file upload logic
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        await onSendMessage(e.target.result as string, type);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 p-4 space-y-4"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            direction={msg.direction}
            timestamp={msg.createdAt}
            status={msg.status}
            contentType={msg.contentType}
          />
        ))}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full inline-block" />
              <div className="w-2 h-2 bg-gray-400 rounded-full inline-block animation-delay-200" />
              <div className="w-2 h-2 bg-gray-400 rounded-full inline-block animation-delay-400" />
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-end space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file, 'image');
                };
                input.click();
              }}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file, 'document');
                };
                input.click();
              }}>
                <Paperclip className="mr-2 h-4 w-4" />
                Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />

          <Button onClick={handleSend} disabled={!message.trim() || isLoading}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
