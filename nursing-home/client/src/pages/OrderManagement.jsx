import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { api } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const STATUSES = ['', '待接单', '已接单', '服务中', '已完成'];
const NEXT_STATUS = { '待接单': '已接单', '已接单': '服务中', '服务中': '已完成' };

const emptyForm = { nurse_user: '', elder_id: '', service_type: '待接单', order_time: '', service_time: '', service_end: '', assigned_nurses: [] };

export default function OrderManagement({ showToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [relatives, setRelatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status) params.status = status;
      if (search) params.search = search;
      const [o, n, r] = await Promise.all([
        api.getOrders(params),
        api.getNurses(),
        api.getRelatives(),
      ]);
      setOrders(o);
      setNurses(n);
      setRelatives(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (o) => {
    setEditing(o.order_id);
    const assigned = o.assigned_nurses ? o.assigned_nurses.split(',') : [];
    setForm({ ...o, assigned_nurses: assigned, elder_id: String(o.elder_id || '') });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateOrder(editing, { ...form, elder_id: parseInt(form.elder_id) || 0 });
        showToast('订单已更新');
      } else {
        await api.createOrder({ ...form, elder_id: parseInt(form.elder_id) || 0 });
        showToast('订单已创建');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const advanceStatus = async (order) => {
    const next = NEXT_STATUS[order.service_type];
    if (!next) return;
    try {
      await api.updateOrderStatus(order.order_id, next);
      showToast(`订单 #${order.order_id} 状态已更新为"${next}"`);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteOrder(deleteTarget);
      showToast('订单已删除');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const statusBadge = (s) => {
    const map = { '待接单': 'badge-pending', '已接单': 'badge-accepted', '服务中': 'badge-active', '已完成': 'badge-done' };
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s || '待接单'}</span>;
  };

  const columns = [
    { key: 'order_id', label: '订单号', render: (r) => <span className="tabular-nums font-medium">#{r.order_id}</span> },
    { key: 'elder_name', label: '老人', render: (r) => r.elder_name || `亲属#${r.elder_id}` },
    { key: 'nurse_user', label: '护工', render: (r) => r.assigned_nurses || (r.nurse_user || '待分配') },
    { key: 'service_type', label: '状态', render: (r) => statusBadge(r.service_type) },
    { key: 'order_time', label: '下单时间', render: (r) => r.order_time ? new Date(r.order_time).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'service_time', label: '服务开始', render: (r) => r.service_time ? new Date(r.service_time).toLocaleDateString('zh-CN') : '-' },
    { key: 'actions', label: '操作', width: '160px', render: (r) => (
      <div className="flex items-center gap-1">
        {NEXT_STATUS[r.service_type] && (
          <button onClick={() => advanceStatus(r)} className="btn btn-ghost p-1.5 text-green-600 hover:text-green-800" title={`转为${NEXT_STATUS[r.service_type]}`} aria-label={`订单 #${r.order_id} 转为${NEXT_STATUS[r.service_type]}`}>
            <ChevronRight size={16} />
          </button>
        )}
        <button onClick={() => openEdit(r)} className="btn btn-ghost p-1.5" aria-label={`编辑订单 #${r.order_id}`}>
          <Pencil size={16} />
        </button>
        <button onClick={() => setDeleteTarget(r.order_id)} className="btn btn-ghost p-1.5 text-red-500 hover:text-red-700" aria-label={`删除订单 #${r.order_id}`}>
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">订单管理</h2>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={18} /> 创建订单
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            className="input pl-9"
            placeholder="搜索订单号或老人姓名…"
            value={search}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('search', e.target.value); else next.delete('search');
              setSearchParams(next, { replace: true });
            }}
            aria-label="搜索订单"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="订单状态筛选">
          {STATUSES.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (s) next.set('status', s); else next.delete('status');
                setSearchParams(next, { replace: true });
              }}
              className={`btn text-xs ${status === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s || '全部'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <TableSkeleton rows={5} cols={7} /> :
       error ? <ErrorState message={error} onRetry={fetchData} /> :
       orders.length === 0 ? <EmptyState title={status || search ? '无匹配订单' : '暂无订单'} description={status || search ? '请调整筛选条件' : '点击"创建订单"开始'} /> :
       <DataTable columns={columns} data={orders.map((o) => ({ ...o, id: o.order_id }))} />
      }

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑订单' : '创建订单'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="elder_id">老人（亲属）</label>
              <select id="elder_id" className="input" value={form.elder_id} onChange={(e) => setForm({ ...form, elder_id: e.target.value })} required>
                <option value="">请选择老人</option>
                {relatives.map((r) => (
                  <option key={r.relative_id} value={r.relative_id}>{r.elder_name}（{r.relative_name}）</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="service_type">状态</label>
              <select id="service_type" className="input" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}>
                {STATUSES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">分配护工</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-gray-200">
              {nurses.map((n) => (
                <label key={n.nurse_user} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors duration-100">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    checked={form.assigned_nurses?.includes(n.nurse_user) || false}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(form.assigned_nurses || []), n.nurse_user]
                        : (form.assigned_nurses || []).filter((x) => x !== n.nurse_user);
                      setForm({ ...form, assigned_nurses: next });
                    }}
                  />
                  <span>{n.nurse_user}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label" htmlFor="order_time">下单时间</label>
              <input id="order_time" type="datetime-local" className="input" value={form.order_time ? form.order_time.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, order_time: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="service_time">服务开始</label>
              <input id="service_time" type="datetime-local" className="input" value={form.service_time ? form.service_time.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, service_time: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="service_end">服务结束</label>
              <input id="service_end" type="datetime-local" className="input" value={form.service_end ? form.service_end.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, service_end: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary flex-1">取消</button>
            <button type="submit" className="btn btn-primary flex-1">{editing ? '保存' : '创建'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除订单 #${deleteTarget} 吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
