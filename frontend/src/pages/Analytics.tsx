import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { mockDailyProcessing, mockLanguageDistribution, mockErrorCategories, mockStateProgress } from '../data/mockData';
import { Zap } from 'lucide-react';

const COLORS = ['#4a7c59', '#6b9e7a', '#8dbf9a', '#c9a84c', '#d4b86a', '#dfc887', '#555'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const KpiCard = ({ label, value, sub, color }: { label: string; value: string | number; sub: string; color?: string }) => (
  <motion.div className="kpi-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value" style={{ color: color || 'var(--text-primary)' }}>
      {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
    </div>
    <div className="kpi-change-label">{sub}</div>
  </motion.div>
);

export default function Analytics() {
  const totalProcessed = mockStateProgress.reduce((a, s) => a + s.processed, 0);
  const totalVerified = mockStateProgress.reduce((a, s) => a + s.verified, 0);

  return (
    <div className="page-analytics">
      <div className="page-header">
        <div className="page-label">Insights</div>
        <h1 className="page-title">Digitization Intelligence</h1>
        <p className="page-description">
          Real-time analytics on digitization progress, extraction accuracy, and error patterns.
        </p>
      </div>

      <div className="kpi-grid">
        <KpiCard label="Total Processed" value={totalProcessed} sub="across all states" color="var(--accent-green-bright)" />
        <KpiCard label="Total Verified" value={totalVerified} sub="digitally verified records" />
        <KpiCard label="Avg. Extraction Accuracy" value="96.8%" sub="+2.4% vs last month" />
        <KpiCard label="Error Rate" value="3.2%" sub="of all documents processed" color="var(--status-review)" />
      </div>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {/* Daily chart */}
        <div className="panel dashboard-chart-wide">
          <div className="panel-header">
            <span className="panel-title">Daily Processing Volume</span>
          </div>
          <div className="panel-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockDailyProcessing} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="documents" name="Processed" fill="#4a7c59" radius={[2, 2, 0, 0]} />
                <Bar dataKey="verified" name="Verified" fill="#c9a84c" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language pie */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Languages</span></div>
          <div className="panel-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={mockLanguageDistribution} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                  dataKey="count" nameKey="language" paddingAngle={2}>
                  {mockLanguageDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-label">{payload[0].name}</div>
                    <div className="chart-tooltip-row"><span>Count</span><span>{Number(payload[0].value).toLocaleString()}</span></div>
                    <div className="chart-tooltip-row"><span>Share</span><span>{payload[0].payload.percentage}%</span></div>
                  </div>
                ) : null} />
              </PieChart>
            </ResponsiveContainer>
            <div className="lang-legend">
              {mockLanguageDistribution.map((l, i) => (
                <div key={l.language} className="lang-legend-item">
                  <span className="lang-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="lang-name">{l.language}</span>
                  <span className="lang-pct">{l.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis */}
      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-header">
          <span className="panel-title">Error Analysis</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>1,340 errors this week</span>
        </div>
        <div className="panel-body">
          <div className="dashboard-grid" style={{ gap: 32 }}>
            <div>
              {mockErrorCategories.map(err => (
                <div key={err.category} className="error-bar-row">
                  <div className="error-bar-label">
                    <span>{err.category}</span>
                    <span className="error-bar-pct">{err.count}</span>
                  </div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{
                      width: `${err.percentage}%`,
                      background: 'rgba(192, 72, 72, 0.6)',
                    }} />
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 8, minWidth: 30 }}>
                    {err.percentage}%
                  </span>
                </div>
              ))}
            </div>
            <div>
              <div className="section-label">AI Recommendations</div>
              {[
                { msg: '428 documents may benefit from image enhancement before OCR.', action: 'Enhance Documents' },
                { msg: '322 handwriting-heavy records should use TrOCR specialized model.', action: 'Apply Model' },
                { msg: '241 damaged documents can be digitally restored before re-processing.', action: 'View Documents' },
              ].map((r, i) => (
                <div key={i} className="ai-recommendation">
                  <Zap size={13} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 6 }}>{r.msg}</div>
                    <button className="btn btn-secondary btn-sm">{r.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy trend */}
      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-header"><span className="panel-title">Extraction Accuracy Trend</span></div>
        <div className="panel-body" style={{ paddingTop: 8 }}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockDailyProcessing} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4a7c59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[90, 100]} tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#4a7c59" strokeWidth={2} fill="url(#accGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
