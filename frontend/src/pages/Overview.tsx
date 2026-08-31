import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowRight, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  mockKpiMetrics, mockStateProgress, mockDailyProcessing,
  mockLanguageDistribution, mockErrorCategories
} from '../data/mockData';
import { useApp } from '../lib/AppContext';
import { useNavigate } from 'react-router-dom';

const LANG_COLORS = ['#4a7c59', '#6b9e7a', '#8dbf9a', '#c9a84c', '#d4b86a', '#dfc887', '#555'];

function KpiCard({ metric, delay }: { metric: typeof mockKpiMetrics[0]; delay: number }) {
  const isUp = metric.trend === 'up';
  const TrendIcon = isUp ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const trendColor = metric.positive
    ? isUp ? 'var(--status-verified)' : 'var(--status-error)'
    : isUp ? 'var(--status-error)' : 'var(--status-verified)';

  return (
    <motion.div
      className="kpi-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="kpi-label">{metric.label}</div>
      <div className="kpi-value">
        {typeof metric.value === 'number'
          ? metric.value.toLocaleString('en-IN')
          : metric.value}
      </div>
      <div className="kpi-meta">
        <span className="kpi-change" style={{ color: trendColor }}>
          <TrendIcon size={12} />
          {Math.abs(metric.change ?? 0)}%
        </span>
        <span className="kpi-change-label">{metric.changeLabel}</span>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-label">{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="chart-tooltip-row">
            <span style={{ color: p.color }}>{p.name}</span>
            <span>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  return (
    <div className="page-overview">
      {/* Header */}
      <div className="page-header">
        <div className="page-label">Dashboard</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Overview</h1>
            <p className="page-description">
              Digitization and verification activity across your jurisdiction.
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => addToast('success', 'Data refreshed.')}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Demo notice */}
      <div className="demo-notice">
        <span className="demo-dot" />
        Sample data — Demo mode. All records are illustrative.
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {mockKpiMetrics.map((m, i) => (
          <KpiCard key={m.id} metric={m} delay={i * 0.06} />
        ))}
      </div>

      {/* Charts row */}
      <div className="dashboard-grid">
        {/* Processing volume */}
        <div className="panel dashboard-chart-wide">
          <div className="panel-header">
            <span className="panel-title">Documents Processed</span>
            <span className="chart-period">Last 8 days</span>
          </div>
          <div className="panel-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockDailyProcessing} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4a7c59" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="documents" name="Processed" stroke="#4a7c59" strokeWidth={2} fill="url(#greenGrad)" dot={false} />
                <Area type="monotone" dataKey="verified" name="Verified" stroke="#c9a84c" strokeWidth={1.5} fill="url(#goldGrad)" dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language distribution */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Language Distribution</span>
          </div>
          <div className="panel-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockLanguageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="language"
                  paddingAngle={2}
                >
                  {mockLanguageDistribution.map((_, i) => (
                    <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="chart-tooltip">
                        <div className="chart-tooltip-label">{payload[0].name}</div>
                        <div className="chart-tooltip-row">
                          <span>Documents</span>
                          <span>{Number(payload[0].value).toLocaleString()}</span>
                        </div>
                        <div className="chart-tooltip-row">
                          <span>Share</span>
                          <span>{payload[0].payload.percentage}%</span>
                        </div>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="lang-legend">
              {mockLanguageDistribution.slice(0, 4).map((l, i) => (
                <div key={l.language} className="lang-legend-item">
                  <span className="lang-dot" style={{ background: LANG_COLORS[i] }} />
                  <span className="lang-name">{l.language}</span>
                  <span className="lang-pct">{l.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error categories */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Error Categories</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/analytics')}>
              Details <ArrowRight size={12} />
            </button>
          </div>
          <div className="panel-body">
            {mockErrorCategories.map(err => (
              <div key={err.category} className="error-bar-row">
                <div className="error-bar-label">
                  <span>{err.category}</span>
                  <span className="error-bar-pct">{err.percentage}%</span>
                </div>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill confidence-low"
                    style={{ width: `${err.percentage}%`, background: 'rgba(192, 72, 72, 0.6)' }}
                  />
                </div>
              </div>
            ))}
            <div className="error-insight">
              <span className="error-insight-icon">💡</span>
              <span>428 documents may benefit from image enhancement before OCR.</span>
              <button className="btn btn-ghost btn-sm">Enhance</button>
            </div>
          </div>
        </div>
      </div>

      {/* State Progress */}
      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-header">
          <span className="panel-title">State-wise Digitization Progress</span>
          <span className="chart-period">{mockStateProgress.reduce((a, s) => a + s.processed, 0).toLocaleString()} total processed</span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Total Records</th>
                <th>Processed</th>
                <th>Verified</th>
                <th>Progress</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {mockStateProgress.map(s => {
                const pct = Math.round((s.processed / s.total) * 100);
                return (
                  <tr key={s.code}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="state-code">{s.code}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.state}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.total.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.processed.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.verified.toLocaleString('en-IN')}</td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="confidence-bar" style={{ flex: 1 }}>
                          <div
                            className="confidence-fill"
                            style={{
                              width: `${pct}%`,
                              background: pct > 80 ? 'var(--status-verified)' : pct > 50 ? 'var(--status-review)' : 'var(--status-error)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 32 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        color: s.accuracy > 96 ? 'var(--status-verified)' : s.accuracy > 94 ? 'var(--text-secondary)' : 'var(--status-review)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                      }}>
                        {s.accuracy}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="dashboard-quick-links">
        {[
          { label: 'Documents awaiting processing', count: 24, href: '/app/processing', color: 'var(--status-processing)' },
          { label: 'Records needing verification', count: 12, href: '/app/verification', color: 'var(--status-review)' },
          { label: 'Validation errors to review', count: 8, href: '/app/records', color: 'var(--status-error)' },
        ].map(ql => (
          <a key={ql.href} href={ql.href} className="quick-link-card">
            <span className="quick-link-count" style={{ color: ql.color }}>{ql.count}</span>
            <span className="quick-link-label">{ql.label}</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          </a>
        ))}
      </div>
    </div>
  );
}
