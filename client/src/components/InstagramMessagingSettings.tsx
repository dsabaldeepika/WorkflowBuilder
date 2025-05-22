import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstagramMessagingConfig {
  enabled: boolean;
  autoReply: boolean;
  replyTemplate: string;
  pageId?: string;
  accessToken?: string;
}

interface InstagramMessagingSettingsProps {
  className?: string;
  initialConfig?: Partial<InstagramMessagingConfig>;
  onConfigChange?: (config: InstagramMessagingConfig) => void;
}

export function InstagramMessagingSettings({ 
  className,
  initialConfig,
  onConfigChange 
}: InstagramMessagingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [config, setConfig] = useState<InstagramMessagingConfig>({
    enabled: false,
    autoReply: false,
    replyTemplate: 'Hi {{sender}}, thanks for your message! I will get back to you soon.'
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await axios.post('/api/integrations/instagram/config', config);
      toast({
        title: "Success",
        description: "Instagram messaging settings saved successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update parent component when config changes
  React.useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  // Load initial config
  React.useEffect(() => {
    if (initialConfig) {
      setConfig(prev => ({ ...prev, ...initialConfig }));
    }
  }, [initialConfig]);

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Instagram Messaging Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how your automated Instagram DM replies work.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Instagram Messaging</Label>
            <p className="text-sm text-muted-foreground">
              Turn on to activate Instagram DM automation
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-Reply to New Messages</Label>
            <p className="text-sm text-muted-foreground">
              Automatically respond to new Instagram DMs
            </p>
          </div>
          <Switch
            checked={config.autoReply}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoReply: checked }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Auto-Reply Template</Label>
          <Textarea 
            value={config.replyTemplate}
            onChange={(e) => setConfig(prev => ({ ...prev, replyTemplate: e.target.value }))}
            placeholder="Enter your auto-reply message template..."
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            Available variables: {'{{sender}}'}, {'{{message}}'}, {'{{timestamp}}'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Page Connection Settings */}
        <div className="space-y-2">
          <Label>Instagram Page ID</Label>
          <Input
            value={config.pageId || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, pageId: e.target.value }))}
            placeholder="Enter your Instagram Page ID"
          />
          <p className="text-sm text-muted-foreground">
            The ID of your Instagram business page
          </p>
        </div>

        <div className="space-y-2">
          <Label>Access Token</Label>
          <Input
            type="password"
            value={config.accessToken || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
            placeholder="Enter your Instagram Graph API access token"
          />
          <p className="text-sm text-muted-foreground">
            Your long-lived Instagram Graph API access token
          </p>
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isLoading || !config.pageId || !config.accessToken}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </Card>
  );
}
