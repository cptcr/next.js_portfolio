import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '401 - Unauthorized',
};

export default function Unauthorized() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>401 - Unauthorized</h1>
      <p>You need to log in to access this page.</p>
      <Link href="/login">Go to Login</Link>
    </div>
  );
}
