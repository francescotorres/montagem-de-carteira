import React from 'react';
import type { InvestorProfile } from '../types';
import { PROFILE_RULES } from '../services/balancingEngine';
import { Shield, Scale, Flame, CheckCircle2 } from 'lucide-react';

interface ProfileSelectorProps {
  currentProfile: InvestorProfile;
  onSelectProfile: (profile: InvestorProfile) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  currentProfile,
  onSelectProfile,
}) => {
  const profiles: InvestorProfile[] = ['CONSERVADOR', 'MODERADO', 'AGRESSIVO'];

  const getProfileIcon = (p: InvestorProfile) => {
    switch (p) {
      case 'CONSERVADOR':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'MODERADO':
        return <Scale className="w-4 h-4 text-blue-400" />;
      case 'AGRESSIVO':
        return <Flame className="w-4 h-4 text-amber-400" />;
    }
  };

  const activeRule = PROFILE_RULES[currentProfile];

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Estratégia de Investimento
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Perfil do Investidor: <span className="text-blue-400">{activeRule.title}</span>
          </h3>
        </div>

        {/* Profile pills */}
        <div className="inline-flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {profiles.map((p) => {
            const isSelected = currentProfile === p;
            return (
              <button
                key={p}
                onClick={() => onSelectProfile(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {getProfileIcon(p)}
                <span>{PROFILE_RULES[p].title}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
        {activeRule.description}
      </p>
    </div>
  );
};
