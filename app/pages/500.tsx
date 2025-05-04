import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '500 - Internal Server Error',
};

export default function ServerError() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>500 - Internal Server Error</h1>
      <p>Something went wrong on our end. Please try again later.</p>
      <Link href="/">Go back to Home</Link>
    </div>
  );
}
