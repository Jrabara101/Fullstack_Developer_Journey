import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Columns,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  X,
  Check,
  Ban,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { INITIAL_USERS } from '../../data/mockData';

export default function UserTable({ onToast }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [selectedIds, setSelectedIds] = useState(['usr_01', 'usr_02', 'usr_03']);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionRow, setActiveActionRow] = useState(null);

  // Saved Views configuration
  const savedViews = [
    { id: 'all', label: 'All Accounts', count: users.length },
    { id: 'high-spenders', label: 'High Spenders (>$20k)', count: users.filter(u => u.monthlySpend >= 20000).length },
    { id: 'pending', label: 'Pending Approvals', count: users.filter(u => u.status === 'Pending').length },
    { id: 'suspended', label: 'Suspended / At Risk', count: users.filter(u => u.status === 'Suspended').length },
  ];

  // Filtering logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Tab filter
      if (activeTab === 'high-spenders' && user.monthlySpend < 20000) return false;
      if (activeTab === 'pending' && user.status !== 'Pending') return false;
      if (activeTab === 'suspended' && user.status !== 'Suspended') return false;

      // Micro filter: status
      if (statusFilter !== 'all' && user.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      // Micro filter: role
      if (roleFilter !== 'all' && user.role.toLowerCase() !== roleFilter.toLowerCase()) return false;

      // Micro filter: region
      if (regionFilter !== 'all' && user.region.toLowerCase() !== regionFilter.toLowerCase()) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesOrg = user.organization.toLowerCase().includes(q);
        const matchesId = user.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesOrg && !matchesId) return false;
      }

      return true;
    });
  }, [users, activeTab, statusFilter, roleFilter, regionFilter, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Select all handler
  const isAllSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.includes(u.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(selectedIds.filter(id => !paginatedUsers.some(u => u.id === id)));
    } else {
      const newIds = [...new Set([...selectedIds, ...paginatedUsers.map(u => u.id)])];
      setSelectedIds(newIds);
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Batch action handlers
  const handleBatchApprove = () => {
    setUsers(prev => prev.map(u => selectedIds.includes(u.id) ? { ...u, status: 'Active' } : u));
    onToast?.(`Batch approved ${selectedIds.length} user accounts.`);
    setSelectedIds([]);
  };

  const handleBatchSuspend = () => {
    setUsers(prev => prev.map(u => selectedIds.includes(u.id) ? { ...u, status: 'Suspended' } : u));
    onToast?.(`Batch suspended ${selectedIds.length} accounts.`);
    setSelectedIds([]);
  };

  const handleBatchExport = () => {
    const selectedData = users.filter(u => selectedIds.includes(u.id));
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Name,Email,Organization,Role,Status,MonthlySpend,APICalls24h,Region"]
      .concat(selectedData.map(u => `${u.id},"${u.name}",${u.email},"${u.organization}",${u.role},${u.status},${u.monthlySpend},${u.apiCalls24h},${u.region}`))
      .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apex_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast?.(`Exported ${selectedData.length} records to CSV.`);
  };

  // Single row actions
  const handleToggleStatus = (id, newStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    onToast?.(`Account ${id} status updated to ${newStatus}.`);
    setActiveActionRow(null);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-subtle overflow-hidden flex flex-col">
      {/* 1. Saved Views Tabs Bar */}
      <div className="px-5 pt-3.5 border-b border-surface-container flex items-center justify-between gap-4 overflow-x-auto bg-surface-container-low/30">
        <div className="flex items-center gap-1">
          {savedViews.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-surface-container-lowest font-semibold shadow-xs'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                activeTab === tab.id ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-outline'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-1.5">
          <button
            onClick={() => {
              setUsers(INITIAL_USERS);
              onToast?.("Refreshed data from edge cluster.");
            }}
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
            title="Refresh Table Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Micro Filters & Bulk Action Toolbar */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-outline" />
          <input
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by user, email, organization, or ID..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-surface-container-low rounded-lg text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-surface-container shadow-inner"
          />
        </div>

        {/* Faceted Micro Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-lg border border-surface-container font-mono text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="h-8 px-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-lg border border-surface-container font-mono text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="all">Role: All Roles</option>
            <option value="admin">Admin</option>
            <option value="operations">Operations</option>
            <option value="billing">Billing</option>
            <option value="auditor">Auditor</option>
          </select>

          {/* Region filter */}
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="h-8 px-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-lg border border-surface-container font-mono text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="all">Region: Global</option>
            <option value="us-east">US-East</option>
            <option value="eu-central">EU-Central</option>
            <option value="ap-east">AP-East</option>
            <option value="sa-east">SA-East</option>
            <option value="me-south">ME-South</option>
          </select>

          {/* Bulk Action Pill Indicator */}
          {selectedIds.length > 0 && (
            <div className="h-8 px-3 inline-flex items-center gap-2 rounded-lg bg-primary-fixed text-primary font-mono text-xs font-semibold animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{selectedIds.length} Selected</span>
              <div className="flex items-center gap-1 pl-1 border-l border-primary/30">
                <button
                  onClick={handleBatchApprove}
                  className="hover:text-emerald-700 px-1 font-medium transition-colors"
                  title="Approve selected"
                >
                  Approve
                </button>
                <button
                  onClick={handleBatchSuspend}
                  className="hover:text-rose-700 px-1 font-medium transition-colors"
                  title="Suspend selected"
                >
                  Suspend
                </button>
                <button
                  onClick={handleBatchExport}
                  className="hover:text-primary px-1 font-medium transition-colors"
                  title="Export selected CSV"
                >
                  Export
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-0.5 hover:bg-primary/10 rounded transition-colors text-outline hover:text-primary"
                  title="Clear selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. High-Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Sticky Header */}
          <thead className="sticky top-0 bg-surface-container-low/95 backdrop-blur-sm z-10 font-mono text-[11px] uppercase tracking-wider text-outline select-none border-y border-surface-container">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-outline-variant text-primary focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 font-medium">User & Identity</th>
              <th className="px-4 py-3 font-medium">Organization / Team</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right font-mono">Monthly Spend</th>
              <th className="px-4 py-3 font-medium text-right font-mono">API Calls (24h)</th>
              <th className="px-4 py-3 font-medium text-right font-mono">Last Active</th>
              <th className="w-16 px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-container text-on-surface">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-xs text-outline">
                  No records matching the active filter criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-primary-fixed/20 hover:bg-primary-fixed/30'
                        : 'hover:bg-surface-container-low/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(user.id)}
                        className="rounded border-outline-variant text-primary focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Identity */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shadow-xs ${user.avatarColor}`}
                        >
                          {user.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-on-surface truncate">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-outline truncate font-mono">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Organization */}
                    <td className="px-4 py-2.5 text-on-surface-variant font-medium">
                      <div className="truncate">{user.organization}</div>
                      <span className="text-[10px] text-outline font-mono">{user.region}</span>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[11px] text-on-surface-variant font-medium">
                        {user.role}
                      </span>
                    </td>

                    {/* Status badge with semantic color */}
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                          user.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-700'
                            : user.status === 'Pending'
                            ? 'bg-amber-500/15 text-amber-700'
                            : 'bg-rose-500/10 text-rose-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active'
                              ? 'bg-emerald-600'
                              : user.status === 'Pending'
                              ? 'bg-amber-600'
                              : 'bg-rose-600'
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>

                    {/* Monospace Spend */}
                    <td className="px-4 py-2.5 font-mono text-right font-semibold text-on-surface">
                      ${user.monthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Monospace API Calls */}
                    <td className="px-4 py-2.5 font-mono text-right text-outline">
                      {user.apiCalls24h.toLocaleString()}
                    </td>

                    {/* Monospace Last Active */}
                    <td className="px-4 py-2.5 font-mono text-right text-outline">
                      {user.lastActive}
                    </td>

                    {/* Row Action Menu */}
                    <td className="px-4 py-2.5 text-center relative">
                      <button
                        onClick={() => setActiveActionRow(activeActionRow === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
                        title="Account actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeActionRow === user.id && (
                        <div className="absolute right-6 top-8 w-44 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl py-1 z-30 text-left animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => handleToggleStatus(user.id, 'Active')}
                            className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Mark Active</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id, 'Pending')}
                            className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Mark Pending</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id, 'Suspended')}
                            className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspend Account</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Footer & Pagination */}
      <div className="p-3 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest border-t border-surface-container text-xs text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span className="text-outline">
            Showing <strong className="text-on-surface">{Math.min(filteredUsers.length, (currentPage - 1) * rowsPerPage + 1)}-{Math.min(filteredUsers.length, currentPage * rowsPerPage)}</strong> of <strong className="text-on-surface">{filteredUsers.length}</strong> accounts
          </span>
          <div className="h-3.5 w-[1px] bg-surface-container hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Rows:</span>
            <select
              value={rowsPerPage}
              onChange={e => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-surface-container-low text-on-surface rounded px-2 py-0.5 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-7 w-7 inline-flex items-center justify-center rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`h-7 w-7 inline-flex items-center justify-center rounded font-semibold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-7 w-7 inline-flex items-center justify-center rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
