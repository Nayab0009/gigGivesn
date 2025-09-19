'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Calendar, Users, Target, CheckCircle2, Clock, Briefcase } from 'lucide-react';
import { getProjectsForManagers } from '@/lib/SprintService';
import { createSprint } from '@/lib/SprintService';
import { useAuth } from "@/context/AuthContext"
import { colors } from "@/colors";

const AddSprint: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<{id: string | number, name: string}[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [form, setForm] = useState({    
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    project: '',
  });
  const [submitting, setSubmitting] = useState(false);
const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user?.id) {
      getProjectsForManagers(String(user.id))
        .then((data) => setProjects(data))
        .catch((err) => console.error('Error fetching projects:', err))
        .finally(() => setLoadingProjects(false));
    }
  }, [user?.id])

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.title,
        description: form.description,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        project: { id: form.project },
      }
      const createdSprint = await createSprint(payload);
      console.log('Sprint Created:', createdSprint);
      setForm({ title: '', description: '', startDate: '', endDate: '', project: '' });
      
      // Navigate to showsprints page after successful creation
router.push(`/dashboard/manager/projects/${createdSprint.project.id}`)
    } catch (error) {
      console.log('Error to create Sprint', error);       
    } finally {
      setSubmitting(false);
    }
  }

  return (
   <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
  <div className="rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto border-2 border-white/40 scrollbar-hide">
    <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
      
            <h1 className="text-xl font-bold mb-2 text-white">Create New Sprint</h1>
            <p className="text-md text-white">Plan and organize your next development sprint</p>
          </div>

          {/* Form Container */}
        <div className="rounded-3xl backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
        <form className="p-6 sm:p-8 space-y-8" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 " style={{ borderColor: colors.primary.hex }}>
            
                  <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white">
                      Sprint Title <span style={{ color: colors.warning.hex }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Sprint 24 - User Authentication & Dashboard"
                      className="w-full px-4 py-4 rounded-xl focus:ring-2 focus:border-transparent outline-none 
                       bg-black/80 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-200
                        focus:border-white/40"
                      style={{ 
                        focusRingColor: colors.primary.hex,
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white">Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder="Describe the main objectives, scope, and expected outcomes for this sprint..."
                   className="w-full px-4 py-4 rounded-xl focus:ring-2 focus:border-transparent outline-none 
                                 bg-black/80 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-200
                                  focus:border-white/40"
                      style={{ 
                        focusRingColor: colors.primary.hex,
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white">
                      Project <span style={{ color: colors.warning.hex }}>*</span>
                    </label>
                    <select
                      required
                      value={form.project}
                      onChange={e => setForm(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full px-4 py-4 rounded-xl focus:ring-2 focus:border-transparent outline-none 
                                 bg-black/80 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-200
                                  focus:border-white/40"
                      style={{ 
                        focusRingColor: colors.primary.hex,
                      }}
                    >
                      <option value="" className="bg-black text-white">Select a project...</option>
                      {loadingProjects ? (
                        <option disabled className="bg-black text-white">Loading projects...</option>
                      ) : (
                        projects.map(project => (
                          <option key={project.id} value={project.id} className="bg-black text-white">
                            {project.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4" style={{ borderColor: colors.primary.hex }}>
        
                  <h2 className="text-xl font-semibold text-white">Timeline & Duration</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white">
                      Start Date <span style={{ color: colors.warning.hex }}>*</span>
                    </label>
                    <input
                      type="date"
                        min={today}
                      required
                      value={form.startDate}
                      onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-4 rounded-xl focus:ring-2 focus:border-transparent outline-none 
                                 bg-black/80 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-200
                                  focus:border-white/40"
                      style={{ 
                        focusRingColor: colors.primary.hex,
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white">
                      End Date <span style={{ color: colors.warning.hex }}>*</span>
                    </label>
                    <input
                      type="date"
                        min={form.startDate || today} 
                      required
                      value={form.endDate}
                    onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                     className="w-full px-4 py-4 rounded-xl focus:ring-2 focus:border-transparent outline-none 
                                 bg-black/80 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-200
                                  focus:border-white/40"
                      style={{ 
                        focusRingColor: colors.primary.hex,
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 " style={{ borderColor: colors.primary.hex }}>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-white/80" />
                  All required fields marked with * must be completed
                </div>
                <button
                  type="submit"
                  disabled={submitting || !form.title || !form.startDate || !form.endDate || !form.project}
                  className="inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 text-white"
                  style={{ 
                    background: submitting || !form.title || !form.startDate || !form.endDate || !form.project 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Sprint...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" style={{ color: colors.highlight.hex }} />
                      Create Sprint
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 pb-6">
              <div className="text-center text-sm text-white/60">
                Sprint planning made simple and effective
              </div>
            </div>
          </div>



          {/* Close Button */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSprint;