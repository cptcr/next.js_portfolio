import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

const errorMessages = [
  'Oops! Looks like this page is on vacation.',
  'Well, this is awkward... This page doesn’t exist.',
  '404: Page Not Found. But don’t worry, we’re still looking for it.',
  'Lost in space... or just in the wrong URL.',
  'Sorry, the page you were looking for is out having a coffee break.',
  'This page is as lost as your car keys.',
  '404: Page not found. Please try again later, or just give us a call… maybe.',
  'Uh-oh! We can’t find that page. Maybe it ran away to join the circus?',
  'You’ve reached a dead end. But don’t worry, we’re not judging.',
  "The page you're looking for is probably hiding, playing hide and seek.",
  'This page is currently on a break. Please try again later.',
  'The page you want just fell into the void. It’s probably happy there.',
  'Well, this is embarrassing. We lost the page!',
  'Oops, looks like this page wandered off. Let’s pretend we didn’t notice.',
  'This is a 404 error page... because sometimes things just don’t exist.',
  'The page you’re searching for took a wrong turn at Albuquerque.',
  'This page is in another dimension. It’s not coming back anytime soon.',
  "Oops! The page you're looking for took a wrong turn at the web highway.",
  '404 Error: This page has gone on an adventure. Who knows where it went?',
  "We’ve looked everywhere for that page. It's like it never existed… like my will to exercise!",
];

function getRandomMessage() {
  const randomIndex = Math.floor(Math.random() * errorMessages.length);
  return errorMessages[randomIndex];
}

export async function getServerSideProps() {
  const randomMessage = getRandomMessage();

  return {
    props: { randomMessage },
  };
}

export default function NotFound({ randomMessage }: { randomMessage: string }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '150px' }}>
      <h1>404 - Page Not Found</h1>
      <p>{randomMessage}</p>
      <Link href="/">Go back to Home</Link>
    </div>
  );
}
