import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface UserItem { id: number; nome: string; }

export const UsersPanel: React.FC = () => {
  const { user: currentUser, listUsers, createUser, deleteUser, updatePassword } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newSenha, setNewSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [modalError, setModalError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  // Password change modal state
  const [passwordModalUser, setPasswordModalUser] = useState<UserItem | null>(null);
  const [editingPassword, setEditingPassword] = useState('');
  const [confirmEditingPassword, setConfirmEditingPassword] = useState('');
  const [showEditingPass, setShowEditingPass] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err: unknown) {
      showToastMsg(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [listUsers]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (newSenha !== confirmSenha) { setModalError('As senhas não coincidem'); return; }
    if (newSenha.length < 4) { setModalError('Senha deve ter ao menos 4 caracteres'); return; }
    try {
      await createUser(newNome, newSenha);
      setShowModal(false);
      setNewNome(''); setNewSenha(''); setConfirmSenha('');
      showToastMsg('✅ Usuário criado com sucesso!');
      fetchUsers();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (users.length <= 1) {
      showToastMsg('⚠️ Não é permitido excluir o único usuário do sistema.');
      return;
    }
    const isSelf = Boolean(currentUser && nome.toLowerCase() === currentUser.nome.toLowerCase());
    const promptMsg = isSelf
      ? `Você está prestes a excluir sua própria conta "${nome}". Sua sessão será encerrada e você será desconectado. Deseja continuar?`
      : `Tem certeza que deseja excluir o usuário "${nome}"?`;

    if (!window.confirm(promptMsg)) return;

    setDeletingId(id);
    try {
      await deleteUser(id);
      showToastMsg('🗑️ Usuário excluído com sucesso!');
      if (!isSelf) {
        fetchUsers();
      }
    } catch (err: unknown) {
      showToastMsg(err instanceof Error ? err.message : 'Erro ao excluir usuário');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    setPasswordModalError('');

    if (editingPassword !== confirmEditingPassword) {
      setPasswordModalError('As senhas não coincidem');
      return;
    }
    if (editingPassword.length < 4) {
      setPasswordModalError('A senha deve ter no mínimo 4 caracteres');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(passwordModalUser.id, editingPassword);
      showToastMsg(`✅ Senha de "${passwordModalUser.nome}" alterada com sucesso!`);
      setPasswordModalUser(null);
      setEditingPassword('');
      setConfirmEditingPassword('');
    } catch (err: unknown) {
      setPasswordModalError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 8px 32px rgba(31,147,255,0.15)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(56,189,248,0.4)',
    background: 'rgba(255,255,255,0.9)',
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
          👥 Gerenciar Usuários e Senhas
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
              background: 'rgba(255,255,255,0.85)', borderRadius: '12px',
              border: '1px solid rgba(186,230,253,0.7)', padding: '0.75rem 1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
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
                      background: 'rgba(56,189,248,0.25)', color: '#0369A1',
                      padding: '2px 8px', borderRadius: '20px', fontWeight: 700
                    }}>você</span>
                  )}
                </span>
              </div>

              {/* Action Buttons: Change Password & Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => {
                    setPasswordModalUser(u);
                    setEditingPassword('');
                    setConfirmEditingPassword('');
                    setPasswordModalError('');
                  }}
                  title="Alterar senha deste usuário"
                  style={{
                    background: 'rgba(56,189,248,0.15)', color: '#0284C7',
                    border: '1px solid rgba(56,189,248,0.4)', borderRadius: '8px',
                    padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                    display: 'flex', alignItems: 'center', gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  🔑 Alterar Senha
                </button>

                <button
                  onClick={() => handleDelete(u.id, u.nome)}
                  disabled={deletingId === u.id || users.length <= 1}
                  title={users.length <= 1 ? "Não é permitido excluir o único usuário do sistema" : "Excluir este usuário"}
                  style={{
                    background: users.length <= 1 ? 'rgba(156,163,175,0.1)' : 'rgba(239,68,68,0.1)',
                    color: users.length <= 1 ? '#9CA3AF' : '#DC2626',
                    border: users.length <= 1 ? '1px solid rgba(156,163,175,0.3)' : '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600,
                    cursor: (deletingId === u.id || users.length <= 1) ? 'not-allowed' : 'pointer',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    transition: 'all 0.2s',
                    opacity: users.length <= 1 ? 0.6 : 1
                  }}
                >
                  {deletingId === u.id ? '...' : '🗑 Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(12,74,110,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onClick={e => { if (e.target === e.currentTarget) setPasswordModalUser(null); }}
        >
          <div style={{
            ...glassCard, padding: '2rem',
            width: '100%', maxWidth: '400px', margin: '1rem',
            background: 'rgba(255,255,255,0.92)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#0C4A6E', fontFamily: "'Inter', system-ui, sans-serif" }}>
              🔑 Alterar Senha
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#0369A1' }}>
              Defina a nova senha para o usuário <strong>{passwordModalUser.nome}</strong>:
            </p>

            {passwordModalError && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem',
                color: '#991B1B', fontSize: '0.82rem'
              }}>
                {passwordModalError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0369A1', marginBottom: '0.4rem' }}>
                  Nova Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEditingPass ? 'text' : 'password'}
                    value={editingPassword}
                    onChange={e => setEditingPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    required
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditingPass(!showEditingPass)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#0284C7', fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    {showEditingPass ? 'Ocultar' : 'Exibir'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0369A1', marginBottom: '0.4rem' }}>
                  Confirmar Nova Senha
                </label>
                <input
                  type={showEditingPass ? 'text' : 'password'}
                  value={confirmEditingPassword}
                  onChange={e => setConfirmEditingPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px',
                    border: '1px solid rgba(186,230,253,0.8)',
                    background: 'rgba(255,255,255,0.7)', color: '#0369A1',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                    fontFamily: "'Inter', system-ui, sans-serif"
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px',
                    border: 'none',
                    background: isUpdatingPassword ? 'rgba(2,132,199,0.5)' : 'linear-gradient(135deg, #38BDF8, #0284C7)',
                    color: 'white', fontWeight: 700, cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
                    fontFamily: "'Inter', system-ui, sans-serif"
                  }}
                >
                  {isUpdatingPassword ? 'Salvando...' : 'Salvar Senha'}
                </button>
              </div>
            </form>
          </div>
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
            background: 'rgba(255,255,255,0.92)'
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
                { label: 'Senha', val: newSenha, set: setNewSenha, type: 'password', placeholder: 'Mínimo 4 caracteres' },
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
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56,189,248,0.5)',
          borderRadius: '12px', padding: '0.75rem 1.25rem',
          color: '#0C4A6E', fontWeight: 600, fontSize: '0.85rem',
          boxShadow: '0 4px 20px rgba(31,147,255,0.25)',
          zIndex: 2000, fontFamily: "'Inter', system-ui, sans-serif"
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};
