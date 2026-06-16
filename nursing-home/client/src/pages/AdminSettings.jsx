import { useState, useEffect, useCallback } from 'react';
import { Plus, Shield, Trash2, Key } from 'lucide-react';
import { api } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function AdminSettings({ showToast }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwTarget, setPwTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdmins();
      setAdmins(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createAdmin(form);
      showToast('管理员已添加');
      setModalOpen(false);
      setForm({ username: '', password: '' });
      fetchAdmins();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePassword = async () => {
    try {
      await api.updateAdmin(pwTarget, { password: newPassword });
      showToast('密码已更新');
      setPwModalOpen(false);
      setNewPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteAdmin(deleteTarget);
      showToast('管理员已删除');
      setDeleteTarget(null);
      fetchAdmins();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    { key: 'admin_id', label: 'ID', render: (r) => <span className="tabular-nums text-gray-400">#{r.admin_id}</span> },
    { key: 'username', label: '用户名', render: (r) => (
      <span className="flex items-center gap-2 font-medium">
        <Shield size={14} className="text-brand-500" /> {r.username}
      </span>
    )},
    { key: 'actions', label: '操作', width: '140px', render: (r) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => { setPwTarget(r.admin_id); setPwModalOpen(true); }}
          className="btn btn-ghost p-1.5"
          aria-label={`修改 ${r.username} 密码`}
        >
          <Key size={16} />
        </button>
        <button
          onClick={() => setDeleteTarget({ id: r.admin_id, name: r.username })}
          className="btn btn-ghost p-1.5 text-red-500 hover:text-red-700"
          aria-label={`删除管理员 ${r.username}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">管理员设置</h2>
        <button onClick={() => { setForm({ username: '', password: '' }); setModalOpen(true); }} className="btn btn-primary">
          <Plus size={18} /> 添加管理员
        </button>
      </div>

      {loading ? <TableSkeleton rows={3} cols={3} /> :
       error ? <ErrorState message={error} onRetry={fetchAdmins} /> :
       <DataTable columns={columns} data={admins.map((a) => ({ ...a, id: a.admin_id }))} />}

      {/* Create Admin */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="添加管理员">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label" htmlFor="admin_username">用户名</label>
            <input id="admin_username" className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} autoComplete="username" />
          </div>
          <div>
            <label className="label" htmlFor="admin_password">密码</label>
            <input id="admin_password" type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} autoComplete="new-password" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary flex-1">取消</button>
            <button type="submit" className="btn btn-primary flex-1">添加</button>
          </div>
        </form>
      </Modal>

      {/* Change Password */}
      <Modal open={pwModalOpen} onClose={() => { setPwModalOpen(false); setNewPassword(''); }} title="修改密码">
        <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
          <div>
            <label className="label" htmlFor="new_password">新密码</label>
            <input id="new_password" type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setPwModalOpen(false); setNewPassword(''); }} className="btn btn-secondary flex-1">取消</button>
            <button type="submit" className="btn btn-primary flex-1">保存</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除管理员 "${deleteTarget?.name}" 吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
