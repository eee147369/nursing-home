import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, LayoutGrid, List } from 'lucide-react';
import { api } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const emptyForm = { project_name: '', project_type: '日常照料', project_img: '' };

const TYPES = ['日常照料', '医疗护理', '康复护理'];

export default function ProjectManagement({ showToast }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      const data = await api.getProjects(params);
      setProjects(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p.project_id); setForm(p); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateProject(editing, form);
        showToast('护理项目已更新');
      } else {
        await api.createProject(form);
        showToast('护理项目已创建');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteProject(deleteTarget);
      showToast('项目已删除');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = projects.filter((p) =>
    !search || p.project_name.includes(search) || p.project_type.includes(search)
  );

  const typeColors = { '日常照料': 'bg-blue-100 text-blue-700', '医疗护理': 'bg-green-100 text-green-700', '康复护理': 'bg-purple-100 text-purple-700' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">护理项目管理</h2>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={18} /> 添加项目
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" className="input pl-9" placeholder="搜索项目..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="搜索护理项目" />
        </div>
        <div className="flex gap-2" role="group" aria-label="按类型筛选">
          <button onClick={() => setFilterType('')} className={`btn btn-sm text-xs ${!filterType ? 'btn-primary' : 'btn-secondary'}`}>全部</button>
          {TYPES.map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`btn btn-sm text-xs ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto" role="group" aria-label="视图切换">
          <button onClick={() => setViewMode('grid')} className={`btn btn-ghost p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`} aria-label="卡片视图" aria-pressed={viewMode === 'grid'}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`btn btn-ghost p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`} aria-label="列表视图" aria-pressed={viewMode === 'list'}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? <CardSkeleton count={6} /> :
       error ? <ErrorState message={error} onRetry={fetchData} /> :
       filtered.length === 0 ? <EmptyState title={filterType || search ? '无匹配项目' : '暂无护理项目'} /> :
       viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.project_id} className="card overflow-hidden group hover:shadow-md transition-shadow duration-200">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                <img
                  src={p.project_img || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop'}
                  alt={p.project_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  width={400}
                  height={300}
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.project_name}</h3>
                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${typeColors[p.project_type] || 'bg-gray-100 text-gray-600'}`}>
                      {p.project_type}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button onClick={() => openEdit(p)} className="btn btn-ghost p-1.5" aria-label={`编辑 ${p.project_name}`}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteTarget(p.project_id)} className="btn btn-ghost p-1.5 text-red-500 hover:text-red-700" aria-label={`删除 ${p.project_name}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
       ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">图片</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.project_id} className="hover:bg-gray-50/50 transition-colors duration-100">
                  <td className="px-4 py-3">
                    <img src={p.project_img || ''} alt="" className="w-10 h-10 rounded object-cover" width={40} height={40} loading="lazy" />
                  </td>
                  <td className="px-4 py-3 font-medium">{p.project_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[p.project_type] || 'bg-gray-100 text-gray-600'}`}>{p.project_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="btn btn-ghost p-1.5" aria-label={`编辑 ${p.project_name}`}><Pencil size={16} /></button>
                      <button onClick={() => setDeleteTarget(p.project_id)} className="btn btn-ghost p-1.5 text-red-500 hover:text-red-700" aria-label={`删除 ${p.project_name}`}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑护理项目' : '添加护理项目'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="project_name">项目名称</label>
            <input id="project_name" className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="project_type">项目分类</label>
            <select id="project_type" className="input" value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="project_img">图片 URL</label>
            <input id="project_img" type="url" className="input" value={form.project_img} onChange={(e) => setForm({ ...form, project_img: e.target.value })} placeholder="https://..." />
          </div>
          {form.project_img && (
            <img src={form.project_img} alt="预览" className="w-full h-32 object-cover rounded-lg" />
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary flex-1">取消</button>
            <button type="submit" className="btn btn-primary flex-1">{editing ? '保存' : '添加'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message="确定要删除此护理项目吗？此操作不可撤销。"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
