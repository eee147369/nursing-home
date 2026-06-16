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

const emptyForm = { relative_name: '', relative_phone: '', elder_name: '', elder_age: '', elder_gender: '男' };

export default function RelativeManagement({ showToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [relatives, setRelatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const search = searchParams.get('search') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      const data = await api.getRelatives(params);
      setRelatives(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r.relative_id); setForm(r); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateRelative(editing, form);
        showToast('亲属信息已更新');
      } else {
        await api.createRelative(form);
        showToast('亲属已添加');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteRelative(deleteTarget);
      showToast('亲属已删除');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    { key: 'relative_id', label: '亲属ID', render: (r) => <span className="tabular-nums text-gray-400">#{r.relative_id}</span> },
    { key: 'relative_name', label: '亲属姓名', render: (r) => <span className="font-medium">{r.relative_name}</span> },
    { key: 'relative_phone', label: '联系电话', render: (r) => (
      <span className="tabular-nums flex items-center gap-1"><Phone size={12} className="text-gray-400" />{r.relative_phone}</span>
    )},
    { key: 'elder_name', label: '老人姓名', render: (r) => r.elder_name },
    { key: 'elder_age', label: '老人年龄', render: (r) => <span className="tabular-nums">{r.elder_age}</span> },
    { key: 'elder_gender', label: '老人性别', render: (r) => r.elder_gender },
    { key: 'actions', label: '操作', width: '100px', render: (r) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(r)} className="btn btn-ghost p-1.5" aria-label={`编辑亲属 ${r.relative_name}`}>
          <Pencil size={16} />
        </button>
        <button onClick={() => setDeleteTarget({ id: r.relative_id, name: r.relative_name })} className="btn btn-ghost p-1.5 text-red-500 hover:text-red-700" aria-label={`删除亲属 ${r.relative_name}`}>
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">亲属与老人管理</h2>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={18} /> 添加亲属
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          className="input pl-9"
          placeholder="搜索亲属姓名、电话或老人姓名…"
          value={search}
          onChange={(e) => setSearchParams(search ? { search: e.target.value } : {}, { replace: true })}
          aria-label="搜索亲属"
        />
      </div>

      {loading ? <TableSkeleton rows={6} cols={7} /> :
       error ? <ErrorState message={error} onRetry={fetchData} /> :
       relatives.length === 0 ? <EmptyState title={search ? '无匹配亲属' : '暂无亲属数据'} description={search ? '请调整搜索条件' : '点击"添加亲属"开始'} action={!search ? <button onClick={openCreate} className="btn btn-primary"><Plus size={16} />添加亲属</button> : null} /> :
       <DataTable columns={columns} data={relatives.map((r) => ({ ...r, id: r.relative_id }))} />
      }

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑亲属' : '添加亲属'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
            <legend className="text-sm font-semibold text-gray-700 px-1">亲属信息</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="relative_name">亲属姓名</label>
                <input id="relative_name" className="input" value={form.relative_name} onChange={(e) => setForm({ ...form, relative_name: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="relative_phone">联系电话</label>
                <input id="relative_phone" type="tel" className="input" value={form.relative_phone} onChange={(e) => setForm({ ...form, relative_phone: e.target.value })} required maxLength={11} autoComplete="tel" />
              </div>
            </div>
          </fieldset>
          <fieldset className="space-y-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
            <legend className="text-sm font-semibold text-gray-700 px-1">老人信息</legend>
            <div>
              <label className="label" htmlFor="elder_name">老人姓名</label>
              <input id="elder_name" className="input" value={form.elder_name} onChange={(e) => setForm({ ...form, elder_name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="elder_age">老人年龄</label>
                <input id="elder_age" type="text" className="input" value={form.elder_age} onChange={(e) => setForm({ ...form, elder_age: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="elder_gender">老人性别</label>
                <select id="elder_gender" className="input" value={form.elder_gender} onChange={(e) => setForm({ ...form, elder_gender: e.target.value })}>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
            </div>
          </fieldset>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary flex-1">取消</button>
            <button type="submit" className="btn btn-primary flex-1">{editing ? '保存' : '添加'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除亲属 "${deleteTarget?.name}" 及其关联老人信息吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
