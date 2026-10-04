import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface UserItem { id: number; nome: string; }

export const UsersPanel: React.FC = () => {
  const { token, user: currentUser, logout, apiBase } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newSenha, setNewSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [modalError, setModalError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/users`, { headers });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setUsers(data);
    } catch {
      showToastMsg('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (newSenha !== confirmSenha) { setModalError('As senhas não coincidem'); return; }
    if (newSenha.length < 6) { setModalError('Senha deve ter ao menos 6 caracteres'); return; }
    try {
      const res = await fetch(`${apiBase}/api/users`, {
        method: 'POST', headers,
        body: JSON.stringify({ nome: newNome.trim(), senha: newSenha })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setModalError((err as any).message || 'Erro ao criar usuário');
        return;
      }
      setShowModal(false);
      setNewNome(''); setNewSenha(''); setConfirmSenha('');
      showToastMsg('✅ Usuário criado com sucesso!');
      fetchUsers();
    } catch {
      setModalError('Erro ao criar usuário');
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiBase}/api/users/${id}`, { method: 'DELETE', headers });
      if (res.status === 403) { showToastMsg('⚠️ Você não pode excluir a si mesmo'); return; }
      if (!res.ok) { showToastMsg('Erro ao excluir usuário'); return; }
      showToastMsg('🗑️ Usuário excluído com sucesso!');
      fetchUsers();
    } catch {
      showToastMsg('Erro ao excluir usuário');
    } finally {
      setDeletingId(null);
    }
  };

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.7)',
    boxShadow: '0 4px 20px rgba(31,147,255,0.1)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(56,189,248,0.4)',
    background: 'rgba(255,255,255,0.8)',
    outline: 'none',
    fontSize: '0.9rem',
    color: '#0C4A6E',
    boxSizing: 'border-box',
    fontFamily: "'Inter', system-ui, sans-serif"
  };

  return (
    <div style={{ ...glassCard, padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0C4A6E', fontFamily: "'Inter', system-ui, sans-serif" }}>
          👥 Gerenciar Usuários
        </h2>
        <button
          onClick={() => { setShowModal(true); setModalError(''); setNewNome(''); setNewSenha(''); setConfirmSenha(''); }}
          style={{
            background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
            color: 'white', border: 'none', borderRadius: '10px',
            padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
            fontFamily: "'Inter', system-ui, sans-serif"
          }}
        >
          + Novo Usuário
        </button>
      </div>

      {/* User List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#0369A1' }}>Carregando...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#0369A1', opacity: 0.7 }}>
          Nenhum usuário cadastrado
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {users.map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.7)', borderRadius: '12px',
              border: '1px solid rgba(186,230,253,0.6)', padding: '0.75rem 1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #BAE6FD, #38BDF8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.95rem', fontWeight: 700, color: '#0C4A6E'
                }}>
                  {u.nome[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, color: '#0C4A6E', fontSize: '0.9rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {u.nome}
                  {u.nome === currentUser?.nome && (
                    <span style={{
                      marginLeft: 8, fontSize: '0.7rem',
                      background: 'rgba(56,189,248,0.2)', color: '#0369A1',
                      padding: '2px 8px', borderRadius: '20px'
                    }}>você</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => handleDelete(u.id, u.nome)}
                disabled={deletingId === u.id}
                style={{
                  background: 'rgba(239,68,68,0.1)', color: '#DC2626',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                  padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600,
                  cursor: deletingId === u.id ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  transition: 'all 0.2s'
                }}
              >
                {deletingId === u.id ? '...' : '🗑 Excluir'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(12,74,110,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            ...glassCard, padding: '2rem',
            width: '100%', maxWidth: '400px', margin: '1rem',
            background: 'rgba(255,255,255,0.85)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', color: '#0C4A6E', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Novo Usuário
            </h3>
            {modalError && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem',
                color: '#991B1B', fontSize: '0.82rem'
              }}>
                {modalError}
              </div>
            )}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Nome', val: newNome, set: setNewNome, type: 'text', placeholder: 'Nome do usuário' },
                { label: 'Senha', val: newSenha, set: setNewSenha, type: 'password', placeholder: 'Mínimo 6 caracteres' },
                { label: 'Confirmar Senha', val: confirmSenha, set: setConfirmSenha, type: 'password', placeholder: 'Repita a senha' }
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0369A1', marginBottom: '0.4rem' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type} value={f.val}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder} required
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  border: '1px solid rgba(186,230,253,0.8)',
                  background: 'rgba(255,255,255,0.7)', color: '#0369A1',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                  fontFamily: "'Inter', system-ui, sans-serif"
                }}>
                  Cancelar
                </button>
                <button type="submit" style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                  color: 'white', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
                  fontFamily: "'Inter', system-ui, sans-serif"
                }}>
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56,189,248,0.4)',
          borderRadius: '12px', padding: '0.75rem 1.25rem',
          color: '#0C4A6E', fontWeight: 600, fontSize: '0.85rem',
          boxShadow: '0 4px 20px rgba(31,147,255,0.2)',
          zIndex: 2000, fontFamily: "'Inter', system-ui, sans-serif"
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};
