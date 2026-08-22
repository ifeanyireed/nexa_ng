"use client";

import React, { useState } from "react";
import { useERPStore, User, DEPARTMENTS } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AdminDashboard() {
  const { users, updateUsers } = useERPStore();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State for custom bulk notification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // User Editing Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editRole, setEditRole] = useState<any>("employee");

  // Loading & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditDept(u.department);
    setEditDesignation(u.designation || "");
    setEditRole(u.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const updatedUser: User = {
        ...editingUser,
        name: editName,
        email: editEmail,
        department: editDept,
        designation: editDesignation,
        role: editRole,
      };

      const newList = users.map(u => u.id === editingUser.id ? updatedUser : u);
      await updateUsers(newList);

      setStatusMessage({
        text: `Successfully updated user ${editName} (${editingUser.id}).`,
        type: "success",
      });
      setEditingUser(null);
    } catch (e: any) {
      setStatusMessage({
        text: `Failed to update user: ${e.message}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (filteredUsers: User[]) => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  // 1. Trigger Reset Password Emails
  const handleSendResetPassword = async () => {
    if (selectedUserIds.length === 0) {
      alert("Please select at least one user.");
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: "Sending reset password emails...", type: "success" });

    try {
      const res = await fetch(`${API_BASE_URL}/send-reset-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });

      let data: any = {};
      const responseText = await res.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          // not JSON
        }
      }

      if (res.ok) {
        setStatusMessage({
          text: `Successfully initiated password reset emails for ${selectedUserIds.length} user(s).`,
          type: "success",
        });
        setSelectedUserIds([]);
      } else {
        setStatusMessage({
          text: `Error: ${data.error || responseText || "Failed to send reset emails"}`,
          type: "error",
        });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Network error: ${e.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Trigger Bulk Notification Emails
  const handleSendBulkNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      alert("Please select at least one user.");
      return;
    }
    if (!subject || !message) {
      alert("Please fill in subject and message.");
      return;
    }

    setIsLoading(true);
    setIsModalOpen(false);
    setStatusMessage({ text: "Sending bulk notifications...", type: "success" });

    try {
      const res = await fetch(`${API_BASE_URL}/send-bulk-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUserIds,
          subject,
          message,
        }),
      });

      let data: any = {};
      const responseText = await res.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          // not JSON
        }
      }

      if (res.ok) {
        setStatusMessage({
          text: `Successfully sent bulk notifications to ${selectedUserIds.length} user(s).`,
          type: "success",
        });
        setSubject("");
        setMessage("");
        setSelectedUserIds([]);
      } else {
        setStatusMessage({
          text: `Error: ${data.error || responseText || "Failed to send notifications"}`,
          type: "error",
        });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Network error: ${e.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Filters
  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.designation && u.designation.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-black text-slate-800 tracking-tight">System Administration</h2>
            <p className="text-xs text-slate-450 font-semibold mt-1">Manage global email campaigns, password resets, and audit user logs</p>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage.text && (
          <div className={`p-4 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-between ${
            statusMessage.type === "success" 
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <span>{statusMessage.text}</span>
            <button 
              onClick={() => setStatusMessage({ text: "", type: "" })}
              className="text-slate-400 hover:text-slate-650 font-extrabold text-[14px]"
            >
              ×
            </button>
          </div>
        )}

        {/* Global Control Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Password Reset */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3 justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Bulk Password Reset</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Dispatch secure password reset tokens to the selected user accounts. Recipients will receive a link to safely update credentials.
              </p>
            </div>
            <button
              onClick={handleSendResetPassword}
              disabled={isLoading || selectedUserIds.length === 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all duration-300 ${
                selectedUserIds.length === 0 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                  : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              }`}
            >
              {isLoading ? "Executing..." : `Reset Passwords for (${selectedUserIds.length}) Users`}
            </button>
          </div>

          {/* Card 2: Bulk Custom Notifications */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3 justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Bulk Notifications Alert</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Send custom announcements, cycle prompts, or performance update alerts directly to the selected employees' email inboxes.
              </p>
            </div>
            <button
              onClick={() => {
                if (selectedUserIds.length === 0) {
                  alert("Please select at least one user.");
                  return;
                }
                setIsModalOpen(true);
              }}
              disabled={isLoading || selectedUserIds.length === 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all duration-300 ${
                selectedUserIds.length === 0 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              }`}
            >
              Compose Notification for ({selectedUserIds.length}) Users
            </button>
          </div>
        </div>

        {/* User Selection Roster */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
            <h3 className="font-bold text-slate-800 text-sm">User Directory Selection</h3>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Selected: {selectedUserIds.length} of {filteredUsers.length} Users
            </span>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search directory by name, ID, email or designation..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700 placeholder-slate-450"
            />
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-2 w-12">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                      onChange={() => handleSelectAll(filteredUsers)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer mr-3"
                    />
                  </th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Designation</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-slate-700">
                {paginatedUsers.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <tr 
                      key={u.id}
                      onClick={() => handleSelectUser(u.id)}
                      className={`hover:bg-slate-50/50 transition-colors duration-250 cursor-pointer ${
                        isChecked ? "bg-blue-50/20" : ""
                      }`}
                    >
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectUser(u.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer mr-3"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || "/character1.jpg"}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover border border-gray-100"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-550">{u.email}</td>
                      <td className="py-3 px-3 text-slate-550">{u.department}</td>
                      <td className="py-3 px-3 text-slate-550">{u.designation || "-"}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          u.role === "admin" 
                            ? "bg-purple-50 text-purple-700 border border-purple-100" 
                            : u.role === "md"
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : u.role === "hr"
                            ? "bg-teal-50 text-teal-700 border border-teal-100"
                            : u.role === "manager"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-gray-50 text-gray-650 border border-gray-150"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditClick(u)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[10px] font-black transition-all duration-200 hover:scale-[1.03] active:scale-97 cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No matching user accounts found in directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-1">
              <span className="text-[11px] text-slate-400 font-bold">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} accounts
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-slate-500 rounded-xl hover:bg-gray-100 disabled:opacity-50 text-xs font-bold"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-slate-500 rounded-xl hover:bg-gray-100 disabled:opacity-50 text-xs font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Notification Compose Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="font-black text-slate-800 text-base">Compose Bulk Notification</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Sending email notification alert to ({selectedUserIds.length}) selected recipients.</p>
            </div>
            
            <form onSubmit={handleSendBulkNotification} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Subject</label>
                <input
                  type="text"
                  placeholder="Performance Cycle Alert"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Message Content</label>
                <textarea
                  placeholder="Enter email HTML/Text message content here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSubject("");
                    setMessage("");
                  }}
                  className="px-4 py-2 border border-gray-200 text-slate-500 hover:bg-gray-50 font-bold rounded-xl text-xs transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors duration-200 cursor-pointer"
                >
                  Dispatch Notifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="font-black text-slate-800 text-base">Edit User Details</h3>
              <p className="text-xs text-slate-450 font-semibold mt-1">Modifying details for user ID: <span className="font-extrabold text-blue-600">{editingUser.id}</span></p>
            </div>
            
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700"
                  >
                    <option value="">Select Department</option>
                    <option value="Administration">Administration</option>
                    <option value="Head of Operations">Head of Operations</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR</option>
                    <option value="md">MD</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Designation</label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  placeholder="e.g. Senior Accountant"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-200 text-slate-500 hover:bg-gray-50 font-bold rounded-xl text-xs transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ERPLayout>
  );
}
