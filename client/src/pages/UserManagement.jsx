import { useEffect, useState } from 'react';
import { useSelector }         from 'react-redux';
import { useNavigate }         from 'react-router-dom';
import API                     from '../api/axios';
import Layout                  from '../components/common/Layout';
import Modal                   from '../components/common/Modal';
import ConfirmDialog            from '../components/common/ConfirmDialog';
import toast                   from 'react-hot-toast';

const ROLES = ['superadmin', 'admin', 'judge', 'viewer'];

const roleBadge = (role) => {
  const styles = {
    superadmin: 'bg-purple-100 text-purple-700',
    admin:      'bg-blue-100 text-blue-700',
    judge:      'bg-green-100 text-green-700',
    viewer:     'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[role] || 'bg-gray-100 text-gray-500'}`}>
      {role}
    </span>
  );
};

const UserManagement = () => {
  const { user: currentUser } = useSelector((s) => s.auth);
  const navigate              = useNavigate();

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');

  // Register modal
  const [showRegister, setShowRegister] = useState(false);
  const [regForm,      setRegForm]      = useState({ name: '', email: '', password: '', role: 'judge' });
  const [regLoading,   setRegLoading]   = useState(false);

  // Edit role
  const [editUser,    setEditUser]    = useState(null);
  const [newRole,     setNewRole]     = useState('');

  // Confirm dialog
  const [confirm,     setConfirm]     = useState(null);

  useEffect(() => {
    if (currentUser?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/auth/users');
      setUsers(data.users);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  // ── Register new user ──────────────────────────────────
  const handleRegister = async () => {
    if (!regForm.name || !regForm.email || !regForm.password)
      return toast.error('All fields are required');

    setRegLoading(true);
    try {
      const { data } = await API.post('/auth/register', regForm);
      setUsers([...users, data.user]);
      setShowRegister(false);
      setRegForm({ name: '', email: '', password: '', role: 'judge' });
      toast.success('User created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
    setRegLoading(false);
  };

  // ── Update role ────────────────────────────────────────
  const handleRoleUpdate = async () => {
    if (!editUser || !newRole) return;
    try {
      await API.patch(`/auth/users/${editUser._id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === editUser._id ? { ...u, role: newRole } : u));
      setEditUser(null);
      toast.success('Role updated!');
    } catch { toast.error('Failed to update role'); }
  };

  // ── Toggle status ──────────────────────────────────────
  const handleToggleStatus = async (user) => {
    try {
      const { data } = await API.patch(`/auth/users/${user._id}/status`);
      setUsers(users.map(u => u._id === user._id ? { ...u, isActive: data.isActive } : u));
      toast.success(`User ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update status'); }
    setConfirm(null);
  };

  // ── Filter ─────────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} total users</p>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-center py-20">Loading users...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </td>
                  <td className="px-5 py-4">{roleBadge(u.role)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      u.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-500'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {u._id !== currentUser._id && (
                        <>
                          <button
                            onClick={() => { setEditUser(u); setNewRole(u.role); }}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1.5 rounded-lg transition"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => setConfirm({
                              user: u,
                              title: u.isActive ? 'Deactivate User' : 'Activate User',
                              message: `Are you sure you want to ${u.isActive ? 'deactivate' : 'activate'} ${u.name}?`,
                            })}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                              u.isActive
                                ? 'bg-red-50 hover:bg-red-100 text-red-500'
                                : 'bg-green-50 hover:bg-green-100 text-green-600'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <p className="text-3xl mb-2">👥</p>
              <p>No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Register Modal */}
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Create New User">
        <div className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Juan dela Cruz' },
            { label: 'Email',     key: 'email', type: 'email', placeholder: 'juan@example.com' },
            { label: 'Password',  key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                value={regForm[key]}
                onChange={e => setRegForm({ ...regForm, [key]: e.target.value })}
                placeholder={placeholder}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              value={regForm.role}
              onChange={e => setRegForm({ ...regForm, role: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setShowRegister(false)}
              className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleRegister} disabled={regLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl">
              {regLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User Role">
        {editUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-800">{editUser.name}</p>
              <p className="text-sm text-gray-400">{editUser.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New Role</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditUser(null)}
                className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleRoleUpdate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl">
                Save Role
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.user?.isActive ? 'Deactivate' : 'Activate'}
        danger={confirm?.user?.isActive}
        onConfirm={() => handleToggleStatus(confirm.user)}
        onCancel={() => setConfirm(null)}
      />
    </Layout>
  );
};

export default UserManagement;