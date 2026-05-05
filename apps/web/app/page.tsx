import { redirect } from 'next/navigation';
import { defaultCanonicalPath } from '@/lib/i18n';

export default function RootPage() {
  redirect(defaultCanonicalPath());
}
