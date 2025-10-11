



  "use client"
  import type React from "react"
  import { useState } from "react"
  import { User, Mail, Phone, Loader2, KeyRound, MapPin, UserPlus, Sparkles,X } from "lucide-react"
  import axiosInstance from "@/lib/axios"
  import { colors } from "@/colors"
  import { useRouter } from "next/navigation"
  import { useAuth } from "@/context/AuthContext"
  const AddManager: React.FC = () => {
    const router = useRouter()
    const { token } = useAuth()
    console.log("this is the token:", token)
    const [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // --- API POST handler ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      try {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("password", form.password);
        formData.append("phone", form.phone);
        formData.append("address", form.address);
        formData.append("role", "manager");
        if (imageFile) {
          formData.append("avatar", imageFile);
        }

        await axiosInstance.post("/user", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          address: "",
        });
        setImageFile(null);
        setImagePreview(null);
        setSuccess("Manager added successfully!")
        setTimeout(() => {
          router.push("/dashboard/admin/managers")
        }, 1200)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to add manager")
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl"
            style={{ background: colors.primary.rgb, opacity: 0.3 }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: colors.secondary.rgb, opacity: 0.3 }}
          ></div>
          <div
            className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full blur-3xl"
            style={{ background: colors.accent.rgb, opacity: 0.3 }}
          ></div>
        </div>

      <div className="relative w-full max-w-5xl [background:var(--form-bg)]  backdrop-blur-xl rounded-3xl shadow-2xl border:var(--border-style)]
    [box-shadow:var(--shadow-combined)] p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold mb-3" style={{ color: colors.white.hex }}>
              Add New Manager
            </h1>
            <p className=" text-lg font-medium" style={{ color: colors.white.hex }}>Empower your team with strong leadership</p>
          </div>
 <button
  type="button"
  onClick={() => router.push("/dashboard/admin/managers")}
  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
>
  <X className="w-4 h-4 text-white" />
</button>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-8">
              <label
                htmlFor="avatar-upload"
                className="w-full max-w-sm border-2 border-dashed border-gray-400 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition [background:var(--field-bg)]"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-32 w-32 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <User className="w-10 h-10 text-gray-400" />
                    <span className="text-gray-400 text-sm">Click or drag file to upload</span>
                  </div>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-8">
              {/* Name & Email */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                    <span className="text-md" style={{ color: colors.white.hex }}>Full Name</span>
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter manager's full name"
                    className="w-full rounded-lg border border-white/20 [background:var(--field-bg)] px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label className="text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                    <span className="text-md"style={{ color: colors.white.hex }}>Email Address</span>
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="manager@company.com"
                      className="w-full rounded-lg border border-white/20 [background:var(--field-bg)] px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Password & Phone */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                    <span className="text-md" style={{ color: colors.white.hex }}>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Create secure password"
                    className="w-full rounded-lg border border-white/20 [background:var(--field-bg)] px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label className="text-gray-800 font-semibold mb-3 flex items-center space-x-3">
                    <span className="text-md" style={{ color: colors.white.hex }}>Phone Number</span>
                  </label>
                  <div className="relative">
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+1 (555) 123-4567"
                      className="w-full rounded-lg border border-white/20 [background:var(--field-bg)] px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Address */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="group lg:col-span-2">
      <label className="text-gray-800 font-semibold mb-3 flex items-center space-x-3">
        <span className="text-md" style={{ color: colors.white.hex }}>Address</span>
      </label>
      <div className="relative">
        <input
          name="address"
          type="text"
          value={form.address}
          onChange={handleChange}
          required
          placeholder="Manager's address"
          className="w-full rounded-lg border border-white/20 [background:var(--field-bg)] px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]"
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
  disabled={isSubmitting}
  className="group relative overflow-hidden text-white font-bold py-4 px-12 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg transform hover:scale-105 active:scale-95 min-w-[200px] border"
  style={{
    backgroundColor: "#0CA9F6",
    border: "1px solid #57B5E7E5",
  }}
>
  <div className="absolute inset-0" style={{ background: colors.accent.rgb, opacity: 0.2 }}></div>
  <div className="relative flex items-center justify-center">
    {isSubmitting ? (
      <>
        <Loader2
          className="animate-spin w-6 h-6 mr-3"
          style={{ color: colors.highlight.hex }}
        />
        <span>Adding...</span>
      </>
    ) : (
      <>
        <span>Add Manager</span>
      </>
    )}
  </div>
</button>

              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  export default AddManager
