import React, { useState, useEffect } from 'react';
import './App.css';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: string;
}

const App = () => {  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sample data
  useEffect(() => {
    const sampleLeads: Lead[] = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        company: 'Tech Corp',
        source: 'Website',
        status: 'new',
        createdAt: new Date().toLocaleDateString()
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@business.com',
        phone: '+1 (555) 987-6543',
        company: 'Business Solutions',
        source: 'Social Media',
        status: 'contacted',
        createdAt: new Date().toLocaleDateString()
      },
      {
        id: 3,
        name: 'Mike Davis',
        email: 'mike@startup.io',
        phone: '+1 (555) 456-7890',
        company: 'StartupX',
        source: 'Referral',
        status: 'qualified',
        createdAt: new Date().toLocaleDateString()
      }
    ];
    setLeads(sampleLeads);
  }, []);

  const AddLeadForm = () => (
    <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Add New Lead</h3>
        <form onSubmit={(e) => { e.preventDefault(); setShowAddForm(false); }}>
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input type="tel" placeholder="Phone" required />
          <input type="text" placeholder="Company" required />
          <select required>
            <option value="">Select Source</option>
            <option value="Website">Website</option>
            <option value="Social Media">Social Media</option>
            <option value="Referral">Referral</option>
            <option value="Cold Call">Cold Call</option>
          </select>
          <div className="form-buttons">
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit">Add Lead</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🎯 Zector Digital CRM</h1>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{leads.length}</span>
              <span className="stat-label">Total Leads</span>
            </div>
            <div className="stat">
              <span className="stat-number">{leads.filter(l => l.status === 'new').length}</span>
              <span className="stat-label">New</span>
            </div>
            <div className="stat">
              <span className="stat-number">{leads.filter(l => l.status === 'qualified').length}</span>
              <span className="stat-label">Qualified</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="nav">
        <button 
          className={activeTab === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'leads' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('leads')}
        >
          👥 Leads
        </button>
        <button 
          className={activeTab === 'analytics' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </nav>

      <main className="main">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <h2>Dashboard Overview</h2>
              <button className="add-btn" onClick={() => setShowAddForm(true)}>
                ➕ Add New Lead
              </button>
            </div>
            
            <div className="cards-grid">
              <div className="card">
                <h3>Recent Leads</h3>
                <div className="lead-list">
                  {leads.slice(0, 3).map(lead => (
                    <div key={lead.id} className="lead-item">
                      <div className="lead-info">
                        <strong>{lead.name}</strong>
                        <span>{lead.company}</span>
                      </div>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(lead.status) }}
                      >
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Lead Sources</h3>
                <div className="source-chart">
                  <div className="source-item">
                    <span>Website</span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div className="source-item">
                    <span>Social Media</span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div className="source-item">
                    <span>Referral</span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="leads">
            <div className="leads-header">
              <h2>All Leads</h2>
              <button className="add-btn" onClick={() => setShowAddForm(true)}>
                ➕ Add New Lead
              </button>
            </div>
            
            <div className="leads-table">
              <div className="table-header">
                <span>Name</span>
                <span>Company</span>
                <span>Email</span>
                <span>Phone</span>
                <span>Source</span>
                <span>Status</span>
                <span>Date</span>
              </div>
              
              {leads.map(lead => (
                <div key={lead.id} className="table-row">
                  <span className="lead-name">{lead.name}</span>
                  <span>{lead.company}</span>
                  <span>{lead.email}</span>
                  <span>{lead.phone}</span>
                  <span>{lead.source}</span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(lead.status) }}
                  >
                    {lead.status}
                  </span>
                  <span>{lead.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics">
            <h2>Analytics & Reports</h2>
            <div className="analytics-grid">
              <div className="card">
                <h3>Conversion Rate</h3>
                <div className="metric">
                  <span className="metric-value">23.5%</span>
                  <span className="metric-change positive">+5.2%</span>
                </div>
              </div>
              
              <div className="card">
                <h3>Avg. Response Time</h3>
                <div className="metric">
                  <span className="metric-value">2.4h</span>
                  <span className="metric-change negative">+0.3h</span>
                </div>
              </div>
              
              <div className="card">
                <h3>Monthly Goal</h3>
                <div className="goal-progress">
                  <div className="progress-circle">
                    <span>78%</span>
                  </div>
                  <span>23 of 30 leads</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAddForm && <AddLeadForm />}
    </div>
  );
};

export default App;
