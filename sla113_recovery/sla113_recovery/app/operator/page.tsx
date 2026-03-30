import { redirect } from 'next/navigation';

/**
 * /operator 
 * Redirects to the root dispatcher which handles the login portal
 */
export default function OperatorRoute() {
  redirect('/');
}
