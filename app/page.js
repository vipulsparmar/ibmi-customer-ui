'use client';

import { useState } from 'react';

export default function CustomerDashboard() {
  const [formData, setFormData] = useState({
    CUSTID: 1008,
    NAME: '',
    CITY: '',
    STATE: '',
    BALANCE: 0.00,
  });

  const [lookupId, setLookupId] = useState('1008');
  const [customerRecord, setCustomerRecord] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const showStatus = (text, type = 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
  };

  // 1. GET - Fetch customer by ID
  const handleGetCustomer = async (idToFetch) => {
    const id = idToFetch || lookupId;
    if (!id) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${id}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      const resp = data.RESPONSE;

      if (resp && resp.SUCCESS === '1') {
        setCustomerRecord(resp);
        setFormData({
          CUSTID: resp.CUSTID,
          NAME: resp.NAME.trim(),
          CITY: resp.CITY.trim(),
          STATE: resp.STATE.trim(),
          BALANCE: resp.BALANCE,
        });
        showStatus(`Loaded customer #${resp.CUSTID}`, 'success');
      } else {
        setCustomerRecord(null);
        showStatus(resp?.MESSAGE || 'Customer not found.', 'error');
      }
    } catch (err) {
      showStatus(`Request failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. POST - Create customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          CUSTID: Number(formData.CUSTID),
          NAME: formData.NAME,
          CITY: formData.CITY,
          STATE: formData.STATE,
          BALANCE: Number(formData.BALANCE),
        }),
      });

      const data = await res.json();
      const resp = data.RESPONSE;

      if (resp && resp.SUCCESS === '1') {
        showStatus(`Customer ${resp.CUSTID} created in DB2!`, 'success');
        handleGetCustomer(resp.CUSTID);
      } else {
        showStatus(resp?.MESSAGE || 'Failed to create customer.', 'error');
      }
    } catch (err) {
      showStatus(`Network error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. PUT - Update customer
  const handleUpdateCustomer = async () => {
    if (!formData.CUSTID) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${formData.CUSTID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          CUSTID: Number(formData.CUSTID),
          NAME: formData.NAME,
          CITY: formData.CITY,
          STATE: formData.STATE,
          BALANCE: Number(formData.BALANCE),
        }),
      });

      const data = await res.json();
      const resp = data.RESPONSE;

      if (resp && resp.SUCCESS === '1') {
        showStatus(`Customer #${formData.CUSTID} updated!`, 'success');
        handleGetCustomer(formData.CUSTID);
      } else {
        showStatus(resp?.MESSAGE || 'Update failed.', 'error');
      }
    } catch (err) {
      showStatus(`Error updating: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETE - Delete customer
  const handleDeleteCustomer = async () => {
    const id = customerRecord?.CUSTID || formData.CUSTID;
    if (!id || !confirm(`Delete Customer #${id}?`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });

      const data = await res.json();
      const resp = data.RESPONSE;

      if (resp && resp.SUCCESS === '1') {
        showStatus(`Customer #${id} deleted from DB2.`, 'success');
        setCustomerRecord(null);
        setFormData({ CUSTID: Number(id) + 1, NAME: '', CITY: '', STATE: '', BALANCE: 0 });
      } else {
        showStatus(resp?.MESSAGE || 'Deletion failed.', 'error');
      }
    } catch (err) {
      showStatus(`Delete error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '0 20px', color: '#111827' }}>
      <header style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>IBM i Customer Portal</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
          Real-time CRUD operations over Integrated Web Services (IWS) & DB2
        </p>
      </header>

      {statusMessage.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 6,
          marginBottom: 20,
          fontWeight: 500,
          backgroundColor: statusMessage.type === 'success' ? '#def7ec' : statusMessage.type === 'error' ? '#fde8e8' : '#e1effe',
          color: statusMessage.type === 'success' ? '#03543f' : statusMessage.type === 'error' ? '#9b1c1c' : '#1e429f',
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Search Header */}
      <section style={{ background: '#f9fafb', padding: 18, borderRadius: 8, marginBottom: 28, border: '1px solid #e5e7eb' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          SEARCH CUSTOMER BY ID
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="number"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="e.g. 1005"
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, width: 140 }}
          />
          <button
            onClick={() => handleGetCustomer()}
            disabled={loading}
            style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >
            {loading ? 'Searching...' : 'Search Record'}
          </button>
        </div>
      </section>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20 }}>
          <h2 style={{ fontSize: '1.15rem', marginTop: 0, marginBottom: 16 }}>Customer Form</h2>
          <form onSubmit={handleCreateCustomer}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: 4 }}>Customer ID</label>
              <input
                type="number"
                value={formData.CUSTID}
                onChange={(e) => setFormData({ ...formData, CUSTID: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: 4 }}>Name</label>
              <input
                type="text"
                value={formData.NAME}
                onChange={(e) => setFormData({ ...formData, NAME: e.target.value })}
                required
                maxLength={50}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: 4 }}>City</label>
                <input
                  type="text"
                  value={formData.CITY}
                  onChange={(e) => setFormData({ ...formData, CITY: e.target.value })}
                  maxLength={30}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: 4 }}>State</label>
                <input
                  type="text"
                  value={formData.STATE}
                  onChange={(e) => setFormData({ ...formData, STATE: e.target.value.toUpperCase() })}
                  maxLength={2}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: 4 }}>Balance</label>
              <input
                type="number"
                step="0.01"
                value={formData.BALANCE}
                onChange={(e) => setFormData({ ...formData, BALANCE: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Create (POST)
              </button>
              <button
                type="button"
                onClick={handleUpdateCustomer}
                disabled={loading}
                style={{ padding: '8px 16px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Update (PUT)
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={loading}
                style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Delete
              </button>
            </div>
          </form>
        </section>

        {/* Live DB2 Record Preview */}
        <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, background: '#fafafa' }}>
          <h2 style={{ fontSize: '1.15rem', marginTop: 0, marginBottom: 16 }}>Live DB2 Record</h2>
          {customerRecord ? (
            <div style={{ fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#6b7280' }}>ID:</span>
                <strong>{customerRecord.CUSTID}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#6b7280' }}>Name:</span>
                <strong>{customerRecord.NAME}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#6b7280' }}>City / State:</span>
                <strong>{customerRecord.CITY}, {customerRecord.STATE}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#6b7280' }}>Balance:</span>
                <strong style={{ color: '#059669' }}>${Number(customerRecord.BALANCE).toFixed(2)}</strong>
              </div>
              <div style={{ marginTop: 16, padding: 10, background: '#f3f4f6', borderRadius: 4 }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: 4 }}>RPG RESPONSE MESSAGE</span>
                <code>{customerRecord.MESSAGE}</code>
              </div>
            </div>
          ) : (
            <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: '40px 0', textAlign: 'center' }}>
              No customer record selected. Use search above or fill the form to create one.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}