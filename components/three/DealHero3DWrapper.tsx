'use client';

import dynamic from 'next/dynamic';

const DealHero3D = dynamic(() => import('./DealHero3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center bg-[#0a0e27]">
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#0066ff] border-t-transparent" />
        <p className="text-sm text-gray-400">Loading deals...</p>
      </div>
    </div>
  ),
});

export default DealHero3D;
