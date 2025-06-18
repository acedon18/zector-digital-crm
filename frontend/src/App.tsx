import React, { useState } from 'react';
import './App.css';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed-won' | 'closed-lost';
  source: string;
  value: number;
  created: string;
}

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 1,
      name: 'María García',
      email: 'maria@empresa.es',
      phone: '+34 600 123 456',
      company: 'Empresa Digital SL',
      status: 'new',
      source: 'Website',
      value: 5000,
      created: '2025-06-18'
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos@tech.es',
      phone: '+34 600 789 012',
      company: 'Tech Solutions',
      status: 'contacted',
      source: 'LinkedIn',
      value: 12000,
      created: '2025-06-17'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana@marketing.es',
      phone: '+34 600 345 678',
      company: 'Marketing Pro',
      status: 'qualified',
      source: 'Referral',
      value: 8500,
      created: '2025-06-16'
    }
  ]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const getStatusBadge = (status: Lead['status']) => (
    <span className={`status-badge ${status}`}>
      {status.replace('-', ' ').toUpperCase()}
    </span>
  );

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const wonLeads = leads.filter(lead => lead.status === 'closed-won');
  const totalWon = wonLeads.reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div className="crm-container">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🎯 Zector Digital CRM</h1>
          <nav className="nav">
            <button
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-btn ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              👥 Leads
            </button>
            <button
              className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📈 Analytics
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Leads</h3>
                  <p className="stat-number">{leads.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Pipeline Value</h3>
                  <p className="stat-number">€{totalValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Won Deals</h3>
                  <p className="stat-number">{wonLeads.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>Revenue</h3>
                  <p className="stat-number">€{totalWon.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>🔥 Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-icon">📞</span>
                  <span>Called María García - Interested in digital marketing services</span>
                  <span className="activity-time">2 hours ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">📧</span>
                  <span>Sent proposal to Carlos López - €12,000 project</span>
                  <span className="activity-time">5 hours ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">🤝</span>
                  <span>Meeting scheduled with Ana Martínez for tomorrow</span>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="leads-section">
            <div className="section-header">
              <h2>💼 Lead Management</h2>
              <button className="btn-primary">+ Add New Lead</button>
            </div>
            
            <div className="leads-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Value</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} onClick={() => setSelectedLead(lead)}>
                      <td className="lead-name">{lead.name}</td>
                      <td>{lead.company}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{getStatusBadge(lead.status)}</td>
                      <td className="lead-value">€{lead.value.toLocaleString()}</td>
                      <td>{lead.source}</td>
                      <td>
                        <button className="btn-small">✏️ Edit</button>
                        <button className="btn-small">📞 Call</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>📊 Analytics & Reports</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Lead Sources</h3>
                <div className="chart-placeholder">
                  <p>📈 Website: 40%</p>
                  <p>💼 LinkedIn: 35%</p>
                  <p>🤝 Referrals: 25%</p>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Conversion Rate</h3>
                <div className="chart-placeholder">
                  <p className="big-metric">24%</p>
                  <p>Lead to Customer</p>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Monthly Trends</h3>
                <div className="chart-placeholder">
                  <p>📈 Leads: +15% this month</p>
                  <p>💰 Revenue: +23% this month</p>
                  <p>🎯 Conversion: +8% this month</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Lead Details: {selectedLead.name}</h3>
              <button onClick={() => setSelectedLead(null)}>✕</button>
            </div>
            <div className="modal-content">
              <p><strong>Company:</strong> {selectedLead.company}</p>
              <p><strong>Email:</strong> {selectedLead.email}</p>
              <p><strong>Phone:</strong> {selectedLead.phone}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedLead.status)}</p>
              <p><strong>Value:</strong> €{selectedLead.value.toLocaleString()}</p>
              <p><strong>Source:</strong> {selectedLead.source}</p>
              <p><strong>Created:</strong> {selectedLead.created}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
