// Temporarily disable Clerk auth for testing
// import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function CenteredLayout(props: { children: React.ReactNode }) {
  // Temporarily bypass Clerk authentication for testing
  // const { userId } = await auth();

  // if (userId) {
  //   redirect('/dashboard');
  // }

  return (
    <div className="flex min-h-screen items-center justify-center">
      {props.children}
    </div>
  );
}
