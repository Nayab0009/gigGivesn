"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Search, Plus, RefreshCw, Edit, Trash2, Eye, AlertCircle, Building2, Mail, Phone, MapPin, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { colors } from "@/colors";

type Organization = {
  id: string;
  name: string;
  number: string;
  address: string;
  email: string;
};

const ShowOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<{ [key in keyof Organization]?: string }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/user/Organization");
        setOrganizations(res.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch organizations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Filter data
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.number?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [organizations, searchTerm]);

  // Function to refresh data
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/user/Organization");
      setOrganizations(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch organizations"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle edit organization
  const handleEdit = (org: Organization) => {
    setEditingOrg({ ...org });
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingOrg) return;

    // Validate fields
    const errors: { [key in keyof Organization]?: string } = {};
    if (!editingOrg.name.trim()) errors.name = "Name is required.";
    if (!editingOrg.email.trim()) errors.email = "Email is required.";
    if (!editingOrg.number.trim()) errors.number = "Phone number is required.";
    if (!editingOrg.address.trim()) errors.address = "Address is required.";
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const res = await axiosInstance.patch(`/user/Organization/${editingOrg.id}`, {
        name: editingOrg.name,
        number: editingOrg.number,
        address: editingOrg.address,
        email: editingOrg.email,
      });

      // Update the organization in the list
      setOrganizations(prev => 
        prev.map(org => org.id === editingOrg.id ? { ...org, ...res.data } : org)
      );

      setIsEditModalOpen(false);
      setEditingOrg(null);
      setEditErrors({});
      alert("Organization updated successfully!");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to update organization"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete organization
  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(org.id);
    try {
      await axiosInstance.delete(`/user/Organization/${org.id}`);
      
      // Remove the organization from the list
      setOrganizations(prev => prev.filter(o => o.id !== org.id));
      alert("Organization deleted successfully!");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete organization"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle input change in edit form
  const handleEditInputChange = (field: keyof Organization, value: string) => {
    if (editingOrg) {
      setEditingOrg({ ...editingOrg, [field]: value });
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Organizations Dashboard
          </h1>
          <p
            className="text-lg"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Manage and track all organizations
          </p>
        </div>

        {/* Action Bar */}
        <div
          className="mb-8 rounded-2xl shadow-lg border p-6"
          style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
            color: '#fff',
            borderColor: colors.primary.hex,
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: colors.accent.hex }}
              />
              <input
                type="text"
                placeholder="Search organizations by name, email, ID or phone..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl focus:ring-2 transition-all duration-300 shadow-sm focus:shadow-md"
                style={{
                  background: '#fff',
                  color: colors.primary.hex,
                  border: `1px solid ${colors.primary.hex}`,
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div
                className="text-sm px-4 py-2 rounded-full border"
                style={{
                  background: colors.accent.hex,
                  color: colors.primary.hex,
                  borderColor: colors.primary.hex,
                }}
              >
                <span className="font-semibold" style={{ color: colors.primary.hex }}>{filteredOrganizations.length}</span> of {organizations.length} organizations
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                  color: '#fff',
                  border: `1px solid ${colors.primary.hex}`,
                }}
                onClick={() => router.push("/dashboard/superadmin/addOrganization")}
              >
                <Plus className="w-4 h-4" style={{ color: colors.highlight.hex }} />
                Add Organization
              </button>
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                style={{
                  background: '#fff',
                  color: colors.primary.hex,
                  border: `1px solid ${colors.primary.hex}`,
                }}
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4" style={{ color: colors.secondary.hex }} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div
          className="rounded-2xl shadow-lg border overflow-hidden"
          style={{
            background: '#fff',
            borderColor: colors.primary.hex,
          }}
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                style={{ background: colors.accent.hex }}
              >
                <RefreshCw className="w-6 h-6 animate-spin" style={{ color: colors.primary.hex }} />
              </div>
              <p className="text-lg" style={{ color: colors.primary.hex }}>Loading organizations...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: colors.warning.hex }}>
                <AlertCircle className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <p className="text-lg font-medium mb-2" style={{ color: colors.warning.hex }}>Error Loading Organizations</p>
              <p style={{ color: colors.secondary.hex }}>{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-6 py-2 rounded-full transition-colors duration-300"
                style={{ background: colors.primary.hex, color: '#fff' }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: colors.primary.hex }}>
                <thead style={{ background: colors.accent.hex }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Organization Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Contact Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="w-8 h-8" style={{ color: colors.primary.hex }} />
                          </div>
                          <p className="text-slate-600 text-lg font-medium mb-1">
                            {organizations.length === 0 ? "No organizations found" : "No matching organizations"}
                          </p>
                          <p className="text-slate-500">
                            {organizations.length === 0 ? "Add your first organization to get started" : "Try adjusting your search criteria"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrganizations.map((org, index) => (
                      <tr
                        key={org.id}
                        className={`bg-white transition-all duration-300 hover:bg-gradient-to-r hover:from-[${colors.primary.hex}] hover:to-[${colors.secondary.hex}] hover:text-white`}
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                                  color: '#fff',
                                }}
                              >
                                {org.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold leading-tight" style={{ color: colors.primary.hex }}>{org.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" style={{ background: colors.accent.hex, color: colors.primary.hex }}>
                                    Organization
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" style={{ color: colors.primary.hex }} />
                              <span className="text-sm font-medium" style={{ color: colors.primary.hex }}>{org.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" style={{ color: colors.secondary.hex }} />
                              <span className="text-sm" style={{ color: colors.secondary.hex }}>{org.number}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" style={{ color: colors.accent.hex }} />
                            <span className="text-sm max-w-sm" title={org.address} style={{ color: colors.accent.hex }}>
                              {org.address}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1"
                              style={{
                                background: colors.highlight.hex,
                                color: colors.primary.hex,
                              }}
                              onClick={() => handleEdit(org)}
                              title="Edit Organization"
                            >
                              <Edit className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            </button>
                            <button
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleDelete(org)}
                              disabled={isDeleting === org.id}
                              style={{
                                background: colors.warning.hex,
                                color: '#fff',
                              }}
                              title="Delete Organization"
                            >
                              {isDeleting === org.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#fff' }} />
                              ) : (
                                <Trash2 className="w-4 h-4" style={{ color: '#fff' }} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {!loading && !error && (
          <div
            className="mt-8 rounded-2xl shadow-lg border p-6"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              color: '#fff',
              borderColor: colors.primary.hex,
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{organizations.length}</div>
                  <div className="text-sm">Total Organizations</div>
                </div>
                <div className="w-px h-12" style={{ background: colors.accent.hex }}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{filteredOrganizations.length}</div>
                  <div className="text-sm">Filtered Results</div>
                </div>
                <div className="w-px h-12" style={{ background: colors.accent.hex }}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {organizations.length > 0 ? "Active" : "Inactive"}
                  </div>
                  <div className="text-sm">System Status</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: colors.highlight.hex }}></div>
                <span className="text-sm">System Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Edit Organization</h2>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingOrg(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={editingOrg.name}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter organization name"
                    />
                    {editErrors.name && (
                      <div className="text-red-600 text-xs mt-1">{editErrors.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingOrg.email}
                      onChange={(e) => handleEditInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter email address"
                    />
                    {editErrors.email && (
                      <div className="text-red-600 text-xs mt-1">{editErrors.email}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editingOrg.number}
                      onChange={(e) => handleEditInputChange('number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                    {editErrors.number && (
                      <div className="text-red-600 text-xs mt-1">{editErrors.number}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={editingOrg.address}
                      onChange={(e) => handleEditInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter address"
                    />
                    {editErrors.address && (
                      <div className="text-red-600 text-xs mt-1">{editErrors.address}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingOrg(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowOrganizations;