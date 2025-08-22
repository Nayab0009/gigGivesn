"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Hammer, Code, ArrowRight, Sparkles, CheckCircle } from "lucide-react"

// Enum
export enum Industry {
  IT = "it",
  CONSTRUCTION = "construction",
}

export default function Page() {
  return (
    <div className="min-h-screen w-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-12 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-slate-200/30 blur-xl rounded-full"></div>
              <Image
                src="/images/logo/giggives_logo.png"
                alt="GigGives Logo"
                width={150}
                height={60}
                className="h-16 w-auto relative z-10"
                priority
              />
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Premium Services
              </span>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight">
              <span className="bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Perfect Solution
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Transform your vision into reality with our elite professional services. 
              Industry-leading expertise meets cutting-edge innovation.
            </p>
          </div>
        </div>
      </header>

      {/* Service Cards */}
      <main className="relative z-10 container mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto mt-8">
          <ServiceCard
            title="Construction"
            description="Build the extraordinary with premium materials and master craftsmanship"
            icon={<Hammer className="w-8 h-8" />}
            href={`/signin?industry=${Industry.CONSTRUCTION}`}
            features={["Expert Architects", "Premium Materials", "On-Time Delivery"]}
            color="orange"
            delay="0"
          />
          <ServiceCard
            title="Software"
            description="Revolutionary digital solutions that transform and elevate your business"
            icon={<Code className="w-8 h-8" />}
            href={`/signin?industry=${Industry.IT}`}
            features={["Custom Development", "Cloud Solutions", "24/7 Support"]}
            color="blue"
            delay="100"
          />
        </div>
      </main>
    </div>
  )
}

interface ServiceCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  features: string[]
  color: "orange" | "blue" | "purple"
  delay: string
}

function ServiceCard({ title, description, icon, href, features, color, delay }: ServiceCardProps) {
  const gradients = {
    orange: "from-orange-500 via-red-500 to-pink-500",
    blue: "from-blue-500 via-cyan-500 to-teal-500",
    purple: "from-purple-500 via-pink-500 to-rose-500",
  }

  const glows = {
    orange: "group-hover:shadow-orange-500/50",
    blue: "group-hover:shadow-blue-500/50",
    purple: "group-hover:shadow-purple-500/50",
  }

  return (
    <Link href={href} className="group block" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative h-full">
        {/* Glow Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${gradients[color]} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500`}
        ></div>

        {/* Card Content */}
        <div
          className={`relative h-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-slate-300 group-hover:shadow-2xl ${glows[color]}`}
        >
          {/* Icon Badge */}
          <div className="relative mb-4">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${gradients[color]} rounded-xl blur-lg opacity-50`}
            ></div>
            <div
              className={`relative inline-flex p-3 bg-gradient-to-r ${gradients[color]} rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              {icon}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-slate-600 mb-4 leading-relaxed text-sm">{description}</p>

          {/* Features */}
          <ul className="space-y-2 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div
            className={`flex items-center justify-between p-3 bg-gradient-to-r ${gradients[color]} rounded-xl opacity-90 group-hover:opacity-100 transition-opacity`}
          >
            <span className="text-white font-semibold text-sm">Explore Solutions</span>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 group-hover:bg-white/30 transition-colors">
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
