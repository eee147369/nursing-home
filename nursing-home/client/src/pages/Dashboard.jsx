import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, UserRound, ClipboardList, HeartHandshake } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../api';
import StatCard from '../components/StatCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

const STATUS_COLORS = { '待接单': '#f59e0b', '已接单': '#3b82f6', '服务中': '#22c55e', '已完成': '#9ca3af', '已取消': '#ef4444' };

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await api.getStats();
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filterStatus = searchParams.get('status');

  if (loading) return <CardSkeleton count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">首页仪表盘</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="护工总数" value={data.nurseCount} icon={UserRound} color="blue" trend={8} />
        <StatCard label="在护老人" value={data.elderCount} icon={Users} color="green" trend={5} />
        <StatCard label="进行中订单" value={data.orderCount} icon={ClipboardList} color="amber" />
        <StatCard label="护理项目" value={data.projectCount} icon={HeartHandshake} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">订单状态分布</h3>
          {data.statusDist && data.statusDist.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={data.statusDist.map((d) => ({ name: d.status || '未知', value: d.count }))}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}
                    dataKey="value"
                  >
                    {data.statusDist.map((d) => (
                      <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#d1d5db'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {data.statusDist.map((d) => (
                  <div key={d.status} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[d.status] || '#d1d5db' }} />
                    <span className="text-gray-600">{d.status || '未知'}</span>
                    <span className="tabular-nums font-medium text-gray-900">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无订单数据</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">最近订单</h3>
          {data.recentOrders && data.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.map((o) => (
                <div
                  key={o.order_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{o.order_id} — {o.elder_name || '老人' + o.order_id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {o.nurse_user || '待分配'} · {o.order_time ? new Date(o.order_time).toLocaleDateString('zh-CN') : ''}
                    </p>
                  </div>
                  <span className={`badge ${o.service_type === '已完成' ? 'badge-done' : o.service_type === '服务中' ? 'badge-active' : o.service_type === '已接单' ? 'badge-accepted' : 'badge-pending'}`}>
                    {o.service_type || '待接单'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无订单</p>
          )}
        </div>
      </div>
    </div>
  );
}
