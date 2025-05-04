import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '503 - Service Unavailable',
};

export default function ServiceUnavailable() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>503 - Service Unavailable</h1>
      <p>We’re currently down for maintenance. Please try again later.</p>
      <Link href="/">Go back to Home</Link>
    </div>
  );
}
