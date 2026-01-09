import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard for now
  // TODO: Add landing page with auth
  redirect('/dashboard');
}
