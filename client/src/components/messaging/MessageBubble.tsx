import React from 'react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  contentType: 'text' | 'image' | 'video' | 'document' | 'audio';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  direction,
  timestamp,
  status,
  contentType,
}) => {
  const isOutbound = direction === 'outbound';

  const renderContent = () => {
    switch (contentType) {
      case 'image':
        return <img src={content} alt="Message" className="max-w-full rounded-lg" />;
      case 'video':
        return <video src={content} controls className="max-w-full rounded-lg" />;
      case 'audio':
        return <audio src={content} controls className="w-full" />;
      case 'document':
        return (
          <div className="flex items-center space-x-2">
            <DocumentIcon className="h-5 w-5" />
            <a href={content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              View Document
            </a>
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }
  };

  const renderStatus = () => {
    if (!isOutbound) return null;

    const statusIcons = {
      pending: <ClockIcon className="h-4 w-4 text-gray-400" />,
      sent: <CheckIcon className="h-4 w-4 text-gray-400" />,
      delivered: <CheckIcon className="h-4 w-4 text-blue-500" />,
      read: <CheckIcon className="h-4 w-4 text-green-500" />,
      failed: <ExclamationIcon className="h-4 w-4 text-red-500" />,
    };

    return statusIcons[status || 'pending'];
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-[80%] mb-4",
        isOutbound ? "ml-auto" : "mr-auto"
      )}
    >
      <div
        className={cn(
          "rounded-lg p-3 min-w-[120px]",
          isOutbound 
            ? "bg-blue-500 text-white ml-auto" 
            : "bg-gray-100 dark:bg-gray-800"
        )}
      >
        {renderContent()}
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-xs opacity-70">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

// Icons
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
