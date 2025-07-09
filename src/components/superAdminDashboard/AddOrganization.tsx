"use client";
import React, { useState, useRef, useEffect } from "react";
import { Building2, Mail, Phone, Loader2, MapPin, Plus, Sparkles } from "lucide-react";
import axiosInstance from "@/lib/axios"; // Adjust the import if axiosInstance is in a different path
import { colors } from "@/colors";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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

      // Immediately navigate to the organizations route
      router.push("/dashboard/superadmin/organizations");
      // If you want to show success message for a split second before navigating, use the below instead:
      // timeoutRef.current = setTimeout(() => {
      //   router.push("/dashboard/superadmin/organizations");
      // }, 500);

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
        <div 
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: `${colors.primary.hex}40` }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: `${colors.secondary.hex}40` }}
        ></div>
        <div 
          className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: `${colors.primary.hex}30` }}
        ></div>
      </div>

      <div className="relative w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
            }}
          >
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 
            className="text-4xl font-bold bg-clip-text text-transparent mb-3"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
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
                  <div 
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: colors.primary.hex }}
                  >
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
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300 disabled:opacity-60"
                    style={{
                      '--tw-ring-color': `${colors.primary.hex}33`,
                      '--focus-border-color': colors.primary.hex,
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary.hex;
                      e.target.style.boxShadow = `0 0 0 4px ${colors.primary.hex}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.hex}08, ${colors.secondary.hex}08)`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div 
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: colors.secondary.hex }}
                  >
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
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300 disabled:opacity-60"
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.secondary.hex;
                      e.target.style.boxShadow = `0 0 0 4px ${colors.secondary.hex}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.secondary.hex}08, ${colors.primary.hex}08)`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Address & Email */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div 
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{
                      background: `linear-gradient(45deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
                    }}
                  >
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
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300 disabled:opacity-60"
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary.hex;
                      e.target.style.boxShadow = `0 0 0 4px ${colors.primary.hex}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.hex}08, ${colors.secondary.hex}08)`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                  <div 
                    className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                    style={{
                      background: `linear-gradient(-45deg, ${colors.secondary.hex}, ${colors.primary.hex})`,
                    }}
                  >
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
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-gray-300 disabled:opacity-60"
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.secondary.hex;
                      e.target.style.boxShadow = `0 0 0 4px ${colors.secondary.hex}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, ${colors.secondary.hex}08, ${colors.primary.hex}08)`,
                    }}
                  ></div>
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
                className="group relative overflow-hidden text-white font-bold py-4 px-12 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg transform hover:scale-105 active:scale-95 min-w-[200px]"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${colors.primary.hex}dd, ${colors.secondary.hex}dd)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`;
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary.hex}33, ${colors.secondary.hex}33)`,
                  }}
                ></div>
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