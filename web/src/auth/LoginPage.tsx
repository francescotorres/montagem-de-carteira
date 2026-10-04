import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BLOBS = [
  { cx: '20%', cy: '30%', r: '280px', color: '#BAE6FD', delay: '0s', duration: '8s' },
  { cx: '75%', cy: '15%', r: '220px', color: '#E0F2FE', delay: '2s', duration: '10s' },
  { cx: '60%', cy: '75%', r: '300px', color: '#7DD3FC', delay: '4s', duration: '9s' },
  { cx: '10%', cy: '80%', r: '180px', color: '#38BDF8', delay: '1s', duration: '11s' },
  { cx: '85%', cy: '55%', r: '240px', color: '#0EA5E9', delay: '3s', duration: '7s' },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const inactivityMsg = sessionStorage.getItem('logout_reason');

  useEffect(() => {
    if (inactivityMsg) {
      const t = setTimeout(() => sessionStorage.removeItem('logout_reason'), 8000);
      return () => clearTimeout(t);
    }
  }, [inactivityMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(nome.trim(), senha);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 35%, #7DD3FC 65%, #38BDF8 100%)'
    }}>
      {/* Animated Blobs */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
          {BLOBS.map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.color} opacity="0.55" style={{ filter: 'blur(60px)' }}>
              <animate attributeName="cx" values={`${b.cx};${parseFloat(b.cx) + 8}%;${b.cx}`} dur={b.duration} repeatCount="indefinite" begin={b.delay} />
              <animate attributeName="cy" values={`${b.cy};${parseFloat(b.cy) + 5}%;${b.cy}`} dur={b.duration} repeatCount="indefinite" begin={b.delay} />
              <animate attributeName="r" values={`${b.r};${parseInt(b.r) + 30}px;${b.r}`} dur={b.duration} repeatCount="indefinite" begin={b.delay} />
            </circle>
          ))}
        </svg>
      </div>

      {/* Glass Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '420px',
        margin: '1rem',
        background: 'rgba(255,255,255,0.35)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 8px 32px 0 rgba(31,147,255,0.15), inset 0 1px 0 rgba(255,255,255,0.7)',
        padding: '2.5rem 2rem'
      }}>
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 20px rgba(2,132,199,0.35)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Inter', 'Poppins', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#0C4A6E', margin: 0 }}>
            Montagem de Carteiras
          </h1>
          <p style={{ color: '#0369A1', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 500 }}>
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Inactivity Alert */}
        {inactivityMsg && (
          <div style={{
            background: 'rgba(251,191,36,0.2)', borderRadius: '12px',
            border: '1px solid rgba(251,191,36,0.5)',
            padding: '0.75rem 1rem', marginBottom: '1.25rem',
            color: '#92400E', fontSize: '0.8rem', textAlign: 'center'
          }}>
            ⏱ {inactivityMsg}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', borderRadius: '12px',
            border: '1px solid rgba(239,68,68,0.4)',
            padding: '0.75rem 1rem', marginBottom: '1.25rem',
            color: '#991B1B', fontSize: '0.8rem', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Nome Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0369A1', marginBottom: '0.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Nome de Usuário
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text" value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Seu nome de usuário" required autoFocus
                style={{
                  width: '100%', paddingLeft: '44px', paddingRight: '14px',
                  paddingTop: '12px', paddingBottom: '12px',
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(56,189,248,0.4)',
                  outline: 'none', fontSize: '0.95rem',
                  color: '#0C4A6E', fontFamily: "'Inter', system-ui, sans-serif",
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(2,132,199,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(56,189,248,0.4)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Senha Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0369A1', marginBottom: '0.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="Sua senha" required
                style={{
                  width: '100%', paddingLeft: '44px', paddingRight: '48px',
                  paddingTop: '12px', paddingBottom: '12px',
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(56,189,248,0.4)',
                  outline: 'none', fontSize: '0.95rem',
                  color: '#0C4A6E', fontFamily: "'Inter', system-ui, sans-serif",
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(2,132,199,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(56,189,248,0.4)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#38BDF8'
              }}>
                {showPass
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(2,132,199,0.5)' : 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '0.95rem', fontWeight: 700,
              fontFamily: "'Inter', system-ui, sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(2,132,199,0.4)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget).style.transform = 'translateY(-2px)'; (e.currentTarget).style.boxShadow = '0 6px 20px rgba(2,132,199,0.5)'; } }}
            onMouseLeave={e => { (e.currentTarget).style.transform = 'translateY(0)'; (e.currentTarget).style.boxShadow = '0 4px 15px rgba(2,132,199,0.4)'; }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#0369A1', marginTop: '1.5rem', opacity: 0.7 }}>
          Sessão expira automaticamente após 2h de inatividade
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(12,74,110,0.45); }
      `}</style>
    </div>
  );
};
