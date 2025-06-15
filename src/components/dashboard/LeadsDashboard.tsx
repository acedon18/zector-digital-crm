import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Adjust the endpoint as needed for your deployment
const SOCKET_ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || 'http://localhost:3001';

export interface Lead {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  country?: string;
  score?: number;
  status?: string;
  tags?: string[];
  enriched?: boolean;
  enrichmentError?: string;
  createdAt?: string;
}

const LeadsDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    // Fetch initial leads from API
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => setLeads(data));

    // Connect to WebSocket for real-time updates
    const socket = io(SOCKET_ENDPOINT);
    socket.on('new-lead', (lead: Lead) => {
      setLeads(prev => [lead, ...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Live Leads</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Industry</th>
            <th>Size</th>
            <th>Phone</th>
            <th>Website</th>
            <th>Country</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead._id}>
              <td>{lead.firstName} {lead.lastName}</td>
              <td>{lead.email}</td>
              <td>{lead.companyName}</td>
              <td>{lead.industry}</td>
              <td>{lead.companySize}</td>
              <td>{lead.phone}</td>
              <td>{lead.website}</td>
              <td>{lead.country}</td>
              <td>{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsDashboard;
