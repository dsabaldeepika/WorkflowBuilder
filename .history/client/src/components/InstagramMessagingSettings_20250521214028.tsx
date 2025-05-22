import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import axios from 'axios';
import { toast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

interface InstagramMessagingConfig {
  enabled: boolean;
  autoReply: boolean;
  replyTemplate: string;
}

export function InstagramMessagingSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<InstagramMessagingConfig>({
    enabled: false,
    autoReply: false,
    replyTemplate: 'Hi {{sender}}, thanks for your message! I'll get back to you soon.'
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

  return (
    <Card className="p-6 space-y-6">
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
            Available variables: {{sender}}, {{message}}, {{timestamp}}
          </p>
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </Card>
  );
}
