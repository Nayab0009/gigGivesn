"use client";
import React, { useState } from "react";
import { Building2, Mail, Phone, Loader2, MapPin, Plus, Sparkles } from "lucide-react";
import axiosInstance from "@/lib/axios"; // Adjust the import if axiosInstance is in a different path

type OrgFormData = {
  name: string;
  number: string;
  address: string;
  email: string;
};

const initialForm: OrgFormData = {
  name: "",
  number: "",
  address: "",
  email: "",
};

const AddOrganization: React.FC = () => {
  const [form, setForm] = useState<OrgFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.post("/user/Organization", form);
      setSuccess("Organization added successfully!");
      setForm(initialForm);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to add organization"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 sm:p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-3">
            Add Organization
          </h1>
          <p className="text-gray-600 text-lg font-medium">Build your organizational network</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-8">
            {/* Name & Number */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Organization Name</span>
                </label>
                <div className="relative">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter organization name"
                    disabled={loading}
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300 disabled:opacity-60"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-sm">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Contact Number</span>
                </label>
                <div className="relative">
                  <input
                    name="number"
                    value={form.number}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    disabled={loading}
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300 disabled:opacity-60"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Address & Email */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Address</span>
                </label>
                <div className="relative">
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="Organization address"
                    disabled={loading}
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300 disabled:opacity-60"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-sm">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Email Address</span>
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="organization@company.com"
                    disabled={loading}
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300 disabled:opacity-60"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Error or Success Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                <div className="text-red-700 font-semibold text-lg">{error}</div>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                <div className="text-green-700 font-semibold text-lg flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold py-4 px-12 rounded-full hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg transform hover:scale-105 active:scale-95 min-w-[200px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6 mr-3" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-300" />
                      <span>Add Organization</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrganization;