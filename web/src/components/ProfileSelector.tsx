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
        return <Shield className="w-3.5 h-3.5 text-emerald-600" />;
      case 'MODERADO':
        return <Scale className="w-3.5 h-3.5 text-blue-600" />;
      case 'AGRESSIVO':
        return <Flame className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const activeRule = PROFILE_RULES[currentProfile];

  return (
    <div className="neo-card rounded-2xl p-5 sm:p-6 transition-all">
      {/* Linha 1: Título do Bloco (sem a palavra Ativo) */}
      <div className="mb-3">
        <span className="text-[11px] uppercase font-bold tracking-wider text-blue-600/80 block">
          Estratégia de Investimento
        </span>
        <h3 className="text-base font-bold text-slate-800">
          Perfil do Investidor: <span className="text-blue-700">{activeRule.title}</span>
        </h3>
      </div>

      {/* Linha 2: Os Botões com fonte tamanho 11px */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
        {profiles.map((p) => {
          const isSelected = currentProfile === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onSelectProfile(p)}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-blue-500 scale-[1.02]'
                  : 'neo-button text-slate-700 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <span className={isSelected ? 'text-white' : ''}>{getProfileIcon(p)}</span>
              <span className="text-[11px]">{PROFILE_RULES[p].title}</span>
              {isSelected && <CheckCircle2 className="w-3 h-3 text-blue-200 ml-auto" />}
            </button>
          );
        })}
      </div>

      {/* Linha 3: Explicação do Perfil com fonte tamanho 10px */}
      <div className="neo-inset p-3 rounded-xl text-[10px] text-slate-600 leading-relaxed border border-blue-100">
        {activeRule.description}
      </div>
    </div>
  );
};
