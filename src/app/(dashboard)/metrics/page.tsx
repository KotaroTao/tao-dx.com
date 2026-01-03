'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MetricsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/metrics/daily');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );
}
