"use client"
import { Save, Settings as SettingsIcon } from "lucide-react"

type SettingsTabProps = {
  project: {
    id: number
    name: string
    [key: string]: any
  } | null
  settingsProjectName: string
  setSettingsProjectName: (name: string) => void
  settingsSaving: boolean
  settingsSuccess: boolean
  settingsError: string | null
  handleProjectNameSave: () => void
}

const SettingsTab = ({
  project,
  settingsProjectName,
  setSettingsProjectName,
  settingsSaving,
  settingsSuccess,
  settingsError,
  handleProjectNameSave
}: SettingsTabProps) => {
  return (
    <div className="rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden w-full mx-auto" style={{ background: "#0000004D" }}>
      <div className="border-b border-white/10 px-8 py-5 flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-white/70" />
        <span className="text-2xl font-bold text-white">Project Settings</span>
      </div>
      <form
        className="px-8 py-8"
        onSubmit={(e) => {
          e.preventDefault()
          handleProjectNameSave()
        }}
      >
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-white/90">Project Name</label>
          <input
            type="text"
            value={settingsProjectName}
            onChange={(e) => setSettingsProjectName(e.target.value)}
            className="w-3xl px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-emerald-400 transition-all text-lg font-semibold"
            disabled={settingsSaving}
            maxLength={80}
            required
            placeholder="Enter project name"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors shadow border border-white/20 hover:opacity-90 focus:outline-none ${
              settingsSaving ? "opacity-70 cursor-not-allowed" : ""
            }`}
            style={{ backgroundColor: "rgba(12, 169, 246, 1)" }}
            disabled={settingsSaving}
          >
            <Save className="w-5 h-5" />
            {settingsSaving ? "Saving..." : "Save"}
          </button>

          {settingsSuccess && (
            <span className="text-emerald-400 font-semibold">Saved!</span>
          )}
          {settingsError && (
            <span className="text-rose-400 font-semibold">{settingsError}</span>
          )}
        </div>
      </form>
    </div>
  )
}

export default SettingsTab
