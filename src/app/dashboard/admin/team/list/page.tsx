"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { Mail, Phone, Users, Pencil, Trash2, Search } from 'lucide-react'

const teamMembers = [
	{
		id: 1,
		name: 'John Smith',
		role: 'Frontend Developer',
		email: 'john@example.com',
		phone: '+1 234-567-8901',
		image: '/images/cards/fahad.png',
	},
	{
		id: 2,
		name: 'Sarah Johnson',
		role: 'UI/UX Designer',
		email: 'sarah@example.com',
		phone: '+1 234-567-8902',
		image: '/images/cards/card-02.png',
	},
	{
		id: 3,
		name: 'Michael Brown',
		role: 'Backend Developer',
		email: 'michael@example.com',
		phone: '+1 234-567-8903',
		image: '/images/cards/card-03.png',
	},
	{
		id: 4,
		name: 'Emma Wilson',
		role: 'Project Manager',
		email: 'emma@example.com',
		phone: '+1 234-567-8904',
		image: '/images/cards/card-01.png',
	},
	{
		id: 5,
		name: 'David Clark',
		role: 'DevOps Engineer',
		email: 'david@example.com',
		phone: '+1 234-567-8905',
		image: '/images/cards/card-01.png',
	},
	{
		id: 6,
		name: 'Lisa Anderson',
		role: 'Full Stack Developer',
		email: 'lisa@example.com',
		phone: '+1 234-567-8906',
		image: '/images/cards/card-02.png',
	},
	{
		id: 7,
		name: 'Robert Taylor',
		role: 'System Architect',
		email: 'robert@example.com',
		phone: '+1 234-567-8907',
		image: '/images/cards/card-03.png',
	},
	{
		id: 8,
		name: 'Julia White',
		role: 'QA Engineer',
		email: 'julia@example.com',
		phone: '+1 234-567-8908',
		image: '/images/cards/fahad.png',
	},
]

const TeamListPage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (id: number) => {
    console.log('Edit member:', id)
    // Implement edit functionality
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      console.log('Delete member:', id)
      // Implement delete functionality
    }
  }

  return (
    <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Team Members</h1>
          <p className="text-gray-600">Manage your team members and their roles</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-md">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-700">
              Total: {teamMembers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
          />
        </div>
      </div>

      {/* Enhanced List Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-left text-base font-semibold text-gray-600">Member</th>
                <th className="px-8 py-5 text-left text-base font-semibold text-gray-600">Role</th>
                <th className="px-8 py-5 text-left text-base font-semibold text-gray-600">Contact</th>
                <th className="px-8 py-5 text-right text-base font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-5">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-white shadow-lg">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          sizes="64px"
                          priority={member.id <= 4}
                          className="object-cover"
                          loading="eager"
                          quality={90}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&size=128&background=random`;
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-lg font-semibold text-gray-900 block mb-1">{member.name}</span>
                        <p className="text-base text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-2 text-base text-blue-700 bg-blue-50 rounded-lg font-medium">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <div className="flex items-center text-base text-gray-600">
                        <Mail className="w-5 h-5 mr-3 text-gray-400" />
                        {member.email}
                      </div>
                      <div className="flex items-center text-base text-gray-600">
                        <Phone className="w-5 h-5 mr-3 text-gray-400" />
                        {member.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => handleEdit(member.id)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                      >
                        <Pencil className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TeamListPage
