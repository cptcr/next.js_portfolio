'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import DiscordWebhooks from './discord-webhooks';

export default function SettingsIntegrations() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('discord');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="discord">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <path d="M21 8c-1.5 1.5-3 2-5 2s-3.5-.5-5-2-2-3-2-5h12c0 2-.5 3.5-2 5z" />
              <path d="M8 16.5c1.5.5 3 .5 4.5.5s3.5-.5 5-2c1.5-1.5 2-3 2-5H3c0 2 .5 3.5 2 5 .5.5 1 1 1.5 1.5" />
              <path d="M7.5 19.5c1.5-1.5 2-3 2-5" />
              <path d="M16.5 19.5c-1.5-1.5-2-3-2-5" />
            </svg>
            Discord
          </TabsTrigger>
          <TabsTrigger value="api">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <path d="M15 5v14" />
              <path d="M5 19h14" />
              <circle cx="9" cy="9" r="4" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="19" r="2" />
            </svg>
            API Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discord">
          <DiscordWebhooks />
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Configure API access for external services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                API integration will be implemented in a future update. This will allow external
                services to access your blog content programmatically.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
