import React from 'react';
import AppNavbar from './AppNavbar';

const ReportsPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rep_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(520 360) rotate(90) scale(420 640)">
              <stop stopColor="#FDE047" stopOpacity="0.22" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rep_g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(880 240) rotate(90) scale(260 380)">
              <stop stopColor="#A78BFA" stopOpacity="0.28" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#rep_g1)" />
          <rect width="1200" height="800" fill="url(#rep_g2)" />
        </svg>
      </div>

      <AppNavbar />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold font-display">Reports</h1>
        <p className="mt-2 text-white/75 max-w-2xl">
          Generate compatibility reports and review your saved analyses.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="text-custom-yellow text-sm">Compatibility Reports</div>
            <div className="mt-2 text-white/75">Coming soon</div>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="text-violet-200 text-sm">Growth Summaries</div>
            <div className="mt-2 text-white/75">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
