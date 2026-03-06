import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 400) rotate(90) scale(430 650)">
                <stop stopColor="#FDE047" stopOpacity="0.35" />
                <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(850 240) rotate(90) scale(260 380)">
                <stop stopColor="#A78BFA" stopOpacity="0.35" />
                <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#g1)" />
            <rect width="1200" height="800" fill="url(#g2)" />
            {Array.from({ length: 80 }).map((_, i) => {
              const x = (i * 73) % 1200;
              const y = (i * 41) % 800;
              const r = (i % 6) === 0 ? 2 : 1;
              return <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" fillOpacity="0.55" />;
            })}
          </svg>
        </div>

        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-custom-yellow flex items-center justify-center">
                <span className="text-slate-900 font-bold text-xl font-display">A</span>
              </div>
              <div>
                <div className="text-lg font-bold font-display">AstroAI</div>
                <div className="text-xs text-white/70">Astrology + Numerology</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-medium"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-4 py-2 rounded-lg bg-custom-yellow hover:bg-custom-dark-yellow text-slate-900 text-sm font-semibold"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm text-white/80">
                  <span className="w-2 h-2 rounded-full bg-custom-yellow" />
                  Personalized insights in minutes
                </div>
                <h1 className="mt-5 text-4xl sm:text-5xl font-bold font-display leading-tight">
                  Decode your destiny with
                  <span className="text-custom-yellow"> Astrology</span> &
                  <span className="text-violet-300"> Numerology</span>
                </h1>
                <p className="mt-4 text-white/80 text-lg leading-relaxed">
                  Create your profile, explore your birth chart, track growth metrics, and generate compatibility reports — all powered by a secure account.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="btn-primary"
                  >
                    Create free account
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="btn-secondary"
                  >
                    I already have an account
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="text-sm text-white/70">Birth Chart</div>
                    <div className="mt-1 font-semibold">Zodiac insights</div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="text-sm text-white/70">Numerology</div>
                    <div className="mt-1 font-semibold">Life path numbers</div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="text-sm text-white/70">Reports</div>
                    <div className="mt-1 font-semibold">Compatibility</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/70 text-sm">Today’s celestial map</div>
                      <div className="mt-1 text-xl font-bold font-display">Cosmic Wheel</div>
                    </div>
                    <div className="text-custom-yellow text-sm font-semibold">Live</div>
                  </div>

                  <div className="mt-6 aspect-square rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-yellow-400/10 border border-white/10 flex items-center justify-center">
                    <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="160" cy="160" r="140" stroke="#FDE047" strokeOpacity="0.7" strokeWidth="2" />
                      <circle cx="160" cy="160" r="110" stroke="#A78BFA" strokeOpacity="0.55" strokeWidth="2" />
                      <circle cx="160" cy="160" r="80" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2" />
                      {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (Math.PI * 2 * i) / 12;
                        const x = 160 + Math.cos(angle) * 140;
                        const y = 160 + Math.sin(angle) * 140;
                        const x2 = 160 + Math.cos(angle) * 70;
                        const y2 = 160 + Math.sin(angle) * 70;
                        return (
                          <line
                            key={i}
                            x1={x2}
                            y1={y2}
                            x2={x}
                            y2={y}
                            stroke="#FFFFFF"
                            strokeOpacity="0.18"
                            strokeWidth="2"
                          />
                        );
                      })}
                      <circle cx="160" cy="160" r="6" fill="#FDE047" fillOpacity="0.9" />
                      <path
                        d="M160 48C178 74 188 102 188 132C188 168 174 190 160 210C146 190 132 168 132 132C132 102 142 74 160 48Z"
                        fill="#FDE047"
                        fillOpacity="0.12"
                      />
                      <path
                        d="M160 272C142 246 132 218 132 188C132 152 146 130 160 110C174 130 188 152 188 188C188 218 178 246 160 272Z"
                        fill="#A78BFA"
                        fillOpacity="0.12"
                      />
                    </svg>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                      <div className="text-xs text-white/70">Sun Sign</div>
                      <div className="mt-1 font-semibold">Your profile</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                      <div className="text-xs text-white/70">Life Path</div>
                      <div className="mt-1 font-semibold">Your number</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-custom-yellow/20 blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-violet-400/20 blur-2xl" />
              </div>
            </div>
          </div>

          <section className="relative z-10 bg-white/5 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <div className="text-custom-yellow font-semibold">Secure Authentication</div>
                  <div className="mt-2 text-white/75">JWT-based login and hashed passwords to protect your account.</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <div className="text-violet-300 font-semibold">Personal Profiles</div>
                  <div className="mt-2 text-white/75">Store birth details and chart data safely linked to your user.</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <div className="text-white font-semibold">Reports & Growth</div>
                  <div className="mt-2 text-white/75">Track emotional scores, dominant themes, and compatibility insights.</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
