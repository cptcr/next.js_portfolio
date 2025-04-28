'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';

export default function TestDiscordWebhook() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Webhook URL Required',
        description: 'Please enter a Discord webhook URL',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create a new webhook for testing
      const createResponse = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Test Webhook',
          url: webhookUrl,
          enabled: true,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || 'Failed to create webhook');
      }

      const { webhook } = await createResponse.json();

      // Send test message to the webhook
      const testResponse = await fetch(`/api/admin/webhooks/${webhook.id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message || undefined,
        }),
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        throw new Error(errorData.message || 'Failed to send test message');
      }

      toast({
        title: 'Test Message Sent!',
        description: 'The message was successfully sent to Discord',
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to test webhook',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Discord Webhook</CardTitle>
        <CardDescription>
          Send a test message to your Discord webhook to verify it's working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Discord Webhook URL</label>
          <Input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
          />
          <p className="text-xs text-muted-foreground">
            You can get this URL from Discord Server Settings → Integrations → Webhooks
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Message (optional)</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a custom message or leave blank for default test message"
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSendTest} disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Test Message
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}