"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from "@/lib/axios";
import { useAuth } from "../../context/AuthContext";

const ProfileForm: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || "";

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    email: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/user/${userId}`);
        const data = response.data;
        setFormData({
          name: data.name || '',
          password: data.password || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } catch (error) {
        toast.error('Error fetching profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email is invalid';
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
        } else if (value.length < 4) {
          error = 'Password must be at least 4 characters';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'Phone is required';
        }
        break;
      case 'address':
        if (!value.trim()) {
          error = 'Address is required';
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleUpdateProfile = async () => {
    if (!userId) {
      toast.error('User ID is missing');
      return false;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.patch(`/user/${userId}`, formData);
      if (response.status >= 200 && response.status < 300) {
        toast.success('Profile updated successfully!');
        return true;
      } else {
        toast.error('Failed to update profile');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
      isValid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
      isValid = false;
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const success = await handleUpdateProfile();
      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">Profile Details</h2>
      
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            Profile updated successfully!
          </p>
        </div>
      )}

      {loading && !formData.name ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00a0d1]"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-full dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a0d1]`}
                aria-describedby={errors.name ? "name-error" : ""}
                aria-invalid={errors.name ? "true" : "false"}
              />
              {errors.name && <p id="name-error" className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-full dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a0d1]`}
                aria-describedby={errors.email ? "email-error" : ""}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-full dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a0d1]`}
                aria-describedby={errors.password ? "password-error" : ""}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && <p id="password-error" className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone:
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-full dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a0d1]`}
                aria-describedby={errors.phone ? "phone-error" : ""}
                aria-invalid={errors.phone ? "true" : "false"}
              />
              {errors.phone && <p id="phone-error" className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Address:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-full dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a0d1]`}
                aria-describedby={errors.address ? "address-error" : ""}
                aria-invalid={errors.address ? "true" : "false"}
              />
              {errors.address && <p id="address-error" className="mt-1 text-sm text-red-500">{errors.address}</p>}
            </div>

          </div>

          <div className="flex justify-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-medium rounded-full hover:bg-[#0080a9] focus:outline-none focus:ring-2 focus:ring-[#00a0d1] focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileForm;