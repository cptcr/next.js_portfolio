// app/admin/dashboard/page.tsx
import { Suspense } from 'react';
import AdminDashboardClient from './admin-dashboard-client';

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 pb-12">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="w-64 h-8 rounded-md bg-muted animate-pulse"></div>
              <div className="h-10 rounded-md w-28 bg-muted animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 md:grid-cols-4">
              <div className="h-32 rounded-md bg-muted animate-pulse"></div>
              <div className="h-32 rounded-md bg-muted animate-pulse"></div>
              <div className="h-32 rounded-md bg-muted animate-pulse"></div>
              <div className="h-32 rounded-md bg-muted animate-pulse"></div>
            </div>
            <div className="rounded-md h-96 bg-muted animate-pulse"></div>
          </div>
        </div>
      }
    >
      <AdminDashboardClient />
    </Suspense>
  );
}
