"use client"
import { useEffect, useState } from "react"
import { Calendar, Users, Cloud, Wrench, Shield, Camera, User, Building } from "lucide-react"

interface DailyReport {
  id: number
  projectName: string
  date: string
  submittedBy: string
  weather: string
  workforce: string
  workPerformed: string
  safetyIssues: string
  equipment: string
  photos: string[]
}

export default function DailyReportsList() {
  const [reports, setReports] = useState<DailyReport[]>([])

  useEffect(() => {
    const dummyReports: DailyReport[] = [
      {
        id: 1,
        projectName: "Skyline Tower Construction",
        date: "2025-08-20",
        submittedBy: "John Doe (Site Engineer)",
        weather: "Sunny, 30°C",
        workforce: "45 workers",
        workPerformed: "Concrete foundation poured, steel reinforcements installed.",
        safetyIssues: "No incidents reported.",
        equipment: "2 Excavators, 1 Crane",
        photos: [
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
        ],
      },
      {
        id: 2,
        projectName: "Greenfield Housing Project",
        date: "2025-08-19",
        submittedBy: "Alice Smith (Supervisor)",
        weather: "Cloudy, 28°C",
        workforce: "30 workers",
        workPerformed: "Bricklaying for ground floor walls, electrical conduits installation.",
        safetyIssues: "Minor slip reported, no injuries.",
        equipment: "Concrete Mixer, Forklift",
        photos: ["https://images.unsplash.com/photo-1581094996419-0d902853c6ba?w=400&h=300&fit=crop"],
      },
      {
        id: 3,
        projectName: "Metro Bridge Expansion",
        date: "2025-08-18",
        submittedBy: "Mike Johnson (Project Manager)",
        weather: "Light rain, 25°C",
        workforce: "60 workers",
        workPerformed: "Bridge deck reinforcement, waterproofing membrane application.",
        safetyIssues: "Safety briefing conducted for wet weather conditions.",
        equipment: "Mobile Crane, Concrete Pump, Safety Barriers",
        photos: [
          "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1597149960419-08b45d6a269e?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
        ],
      },
    ]

    setReports(dummyReports)
  }, [])

  const getSafetyStatusColor = (safetyIssues: string) => {
    if (safetyIssues.toLowerCase().includes("no incidents")) {
      return "text-emerald-600 bg-emerald-50"
    } else if (safetyIssues.toLowerCase().includes("minor")) {
      return "text-amber-600 bg-amber-50"
    } else {
      return "text-red-600 bg-red-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Daily Construction Reports</h1>
                <p className="text-slate-300 mt-1">Professional project progress tracking for contractors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400">{reports.length}</div>
                <div className="text-sm text-slate-300">Total Reports</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-emerald-400">
                  {reports.filter((r) => r.safetyIssues.toLowerCase().includes("no incidents")).length}
                </div>
                <div className="text-sm text-slate-300">Safe Days</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-amber-400">
                  {reports.reduce((acc, r) => acc + Number.parseInt(r.workforce.split(" ")[0]), 0)}
                </div>
                <div className="text-sm text-slate-300">Total Workers</div>
              </div>
            </div>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-600 text-lg">No daily reports available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report, index) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-12 rounded-full ${
                          index % 3 === 0
                            ? "bg-gradient-to-b from-blue-400 to-blue-600"
                            : index % 3 === 1
                              ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
                              : "bg-gradient-to-b from-purple-400 to-purple-600"
                        }`}
                      />
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{report.projectName}</h3>
                        <div className="flex items-center gap-4 text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(report.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{report.submittedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getSafetyStatusColor(report.safetyIssues)}`}
                    >
                      {report.safetyIssues.toLowerCase().includes("no incidents")
                        ? "✓ Safe"
                        : report.safetyIssues.toLowerCase().includes("minor")
                          ? "⚠ Minor Issue"
                          : "⚠ Safety Alert"}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Cloud className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-600 mb-1">Weather</div>
                        <div className="text-slate-900 font-medium">{report.weather}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-600 mb-1">Workforce</div>
                        <div className="text-slate-900 font-medium">{report.workforce}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-600 mb-1">Equipment</div>
                        <div className="text-slate-900 font-medium">{report.equipment}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-600 mb-1">Safety</div>
                        <div className="text-slate-900 font-medium">{report.safetyIssues}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <h4 className="font-semibold text-slate-800">Work Performed Today</h4>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-slate-700 leading-relaxed">{report.workPerformed}</p>
                    </div>
                  </div>

                  {report.photos?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Camera className="w-5 h-5 text-slate-600" />
                        <h4 className="font-semibold text-slate-800">Site Progress Photos</h4>
                        <span className="text-sm text-slate-500">({report.photos.length} photos)</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {report.photos.map((photo, i) => (
                          <div key={i} className="group relative">
                            <img
                              src={photo || "/placeholder.svg"}
                              alt={`Site Progress ${i + 1}`}
                              className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-200" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
