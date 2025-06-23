"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Search, Plus, RefreshCw, Edit, Trash2, Eye, AlertCircle, Building2, Mail, Phone, MapPin, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8 ml-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Organizations Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage and track all organizations</p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-100 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organizations by name, email, ID or phone..."
                className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md bg-white/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700 bg-white/60 px-4 py-2 rounded-full border border-emerald-200">
                <span className="font-semibold text-gray-800">{filteredOrganizations.length}</span> of {organizations.length}{" "}
                organizations
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                onClick={() => router.push("/dashboard/superadmin/addOrganization")}
              >
                <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                Add Organization
              </button>
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white border border-emerald-200 hover:border-emerald-300 text-gray-700 hover:text-gray-800 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 transition-transform duration-300 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-lg border border-white/50 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
              <p className="text-gray-600 text-lg">Loading organizations...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 text-lg font-medium mb-2">Error Loading Organizations</p>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-200">
                <thead className="bg-gradient-to-r from-emerald-100 to-teal-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Organization Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 divide-y divide-emerald-100">
                  {filteredOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="w-8 h-8 text-emerald-500" />
                          </div>
                          <p className="text-gray-600 text-lg font-medium mb-1">
                            {organizations.length === 0 ? "No organizations found" : "No matching organizations"}
                          </p>
                          <p className="text-gray-500">
                            {organizations.length === 0 ? "Add your first organization to get started" : "Try adjusting your search criteria"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrganizations.map((org, index) => (
                      <tr
                        key={org.id}
                        className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50/50 transition-all duration-300 ${
                          index % 2 === 0 ? "bg-white/60" : "bg-emerald-50/30"
                        }`}
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {org.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 leading-tight">{org.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
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
                              <Mail className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm font-medium text-gray-900">{org.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-teal-500" />
                              <span className="text-sm text-gray-600">{org.number}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-gray-600 max-w-sm" title={org.address}>
                              {org.address}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button 
                              className="group inline-flex items-center justify-center w-10 h-10 text-amber-600 hover:text-white bg-amber-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1"
                              onClick={() => handleEdit(org)}
                              title="Edit Organization"
                            >
                              <Edit className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            </button>
                            <button 
                              className="group inline-flex items-center justify-center w-10 h-10 text-rose-600 hover:text-white bg-rose-50 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleDelete(org)}
                              disabled={isDeleting === org.id}
                              title="Delete Organization"
                            >
                              {isDeleting === org.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
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
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-100 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{organizations.length}</div>
                  <div className="text-sm text-gray-600">Total Organizations</div>
                </div>
                <div className="w-px h-12 bg-emerald-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{filteredOrganizations.length}</div>
                  <div className="text-sm text-gray-600">Filtered Results</div>
                </div>
                <div className="w-px h-12 bg-emerald-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {organizations.length > 0 ? "Active" : "Inactive"}
                  </div>
                  <div className="text-sm text-gray-600">System Status</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Active</span>
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