import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Phone } from 'lucide-react';
import { api } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const emptyForm = { nurse_user: '', nurse_age: '', nurse_gender: '女', nurse_phone: '', nurse_photo: '' };

export default function NurseManagement({ showToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const search = searchParams.get('search') || '';
  const gender = searchParams.get('gender') || '';

  const fetchNurses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (gender) params.gender = gender;
      const data = await api.getNurses(params);
      setNurses(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, gender]);

  useEffect(() => { fetchNurses(); }, [fetchNurses]);

  const updateParams = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (nurse) => { setEditing(nurse.nurse_user); setForm(nurse); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateNurse(editing, form);
        showToast('护工信息已更新');
      } else {
        await api.createNurse(form);
        showToast('护工已添加');
      }
      setModalOpen(false);
      fetchNurses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteNurse(deleteTarget);
      showToast('护工已删除');
      setDeleteTarget(null);
      fetchNurses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    { key: 'nurse_photo', label: '头像', width: '60px', render: (r) => (
      <img src={r.nurse_photo || 'https://api.dicebear.com/8.x/avataaars/svg?seed=default'} alt={r.nurse_user} className="w-9 h-9 rounded-full object-cover" width={36} height={36} />
    )},
    { key: 'nurse_user', label: '护工账号' },
    { key: 'nurse_gender', label: '性别', render: (r) => r.nurse_gender },
    { key: 'nurse_age', label: '年龄', render: (r) => <span className="tabular-nums">{r.nurse_age}</span> },
    { key: 'nurse_phone', label: '联系电话', render: (r) => (
      <span className="tabular-nums flex items-center gap-1"><Phone size={12} className="text-gray-400" />{r.nurse_phone}</span>
    )},
    { key: 'order_count', label: '接单数', render: (r) => <span className="tabular-nums font-medium">{r.order_count}</span> },
    { key: 'actions', label: '操作', width: '120px', render: (r) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(r)} className="btn btn-ghost p-1.5" aria-label={`编辑护工 ${r.nurse_user}`}>
          <Pencil size={16} />
        </button>
        <button onClick={() => setDeleteTarget(r.nurse_user)} className="btn btn-ghost p-1.5 text-red-500 hover:text-red-700" aria-label={`删除护工 ${r.nurse_user}`}>
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">护工管理</h2>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={18} /> 添加护工
        </button>
      </div>

      {/* Search / Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            className="input pl-9"
            placeholder="搜索护工账号或电话…"
            value={search}
            onChange={(e) => updateParams('search', e.target.value)}
            aria-label="搜索护工"
          />
        </div>
        <select className="input w-auto" value={gender} onChange={(e) => updateParams('gender', e.target.value)} aria-label="按性别筛选">
          <option value="">全部性别</option>
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
      </div>

      {/* Content */}
      {loading ? <TableSkeleton rows={5} cols={7} /> :
       error ? <ErrorState message={error} onRetry={fetchNurses} /> :
       nurses.length === 0 ? <EmptyState title={search || gender ? '无匹配护工' : '暂无护工数据'} description={search || gender ? '请调整搜索条件' : '点击"添加护工"开始'} action={!(search || gender) ? <button onClick={openCreate} className="btn btn-primary"><Plus size={16} />添加护工</button> : null} /> :
       <DataTable columns={columns} data={nurses.map((n, i) => ({ ...n, id: n.nurse_user || i }))} />
      }

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑护工' : '添加护工'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="nurse_user">护工账号</label>
            <input id="nurse_user" className="input" value={form.nurse_user} onChange={(e) => setForm({ ...form, nurse_user: e.target.value })} required disabled={!!editing} autoComplete="username" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="nurse_age">年龄</label>
              <input id="nurse_age" type="number" className="input" value={form.nurse_age} onChange={(e) => setForm({ ...form, nurse_age: e.target.value })} required min={18} max={70} />
            </div>
            <div>
              <label className="label" htmlFor="nurse_gender">性别</label>
              <select id="nurse_gender" className="input" value={form.nurse_gender} onChange={(e) => setForm({ ...form, nurse_gender: e.target.value })}>
                <option value="女">女</option>
                <option value="男">男</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="nurse_phone">联系电话</label>
            <input id="nurse_phone" type="tel" className="input" value={form.nurse_phone} onChange={(e) => setForm({ ...form, nurse_phone: e.target.value })} required maxLength={11} autoComplete="tel" />
          </div>
          <div>
            <label className="label" htmlFor="nurse_photo">头像 URL</label>
            <input id="nurse_photo" type="url" className="input" value={form.nurse_photo} onChange={(e) => setForm({ ...form, nurse_photo: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary flex-1">取消</button>
            <button type="submit" className="btn btn-primary flex-1">{editing ? '保存' : '添加'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除护工 "${deleteTarget}" 吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
