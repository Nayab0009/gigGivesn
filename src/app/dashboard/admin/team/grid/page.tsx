"use client"
import React from 'react'
import Image from 'next/image'
import { Mail, Phone, Users } from 'lucide-react'

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

const TeamGridPage = () => {
	return (
		<div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row justify-between items-center mb-10">
				<h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">
					Team Members
				</h1>
				<div className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-md">
					<Users className="w-6 h-6 text-blue-600" />
					<span className="text-xl font-semibold text-gray-700">
						Total Members: {teamMembers.length}
					</span>
				</div>
			</div>

			{/* Grid Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{teamMembers.map((member) => (
					<div
						key={member.id}
						className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
					>
						{/* Image Container */}
						<div className="relative h-64 w-full">
							<Image
								src={member.image}
								alt={member.name}
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								priority={member.id <= 4} // Prioritize loading first 4 images
								quality={90}
								className="object-cover"
								placeholder="blur"
								blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJyEwPENFQzY1NDNDSFE9Rjs9QTNBNkZQSVFMMkxWYWE9XndYQ1FzTk3/2wBDARUXFyAeIR4aHTMmIzNNTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
							<div className="absolute bottom-0 left-0 right-0 p-6">
								<h3 className="text-2xl font-bold text-white mb-1">
									{member.name}
								</h3>
								<p className="text-lg text-gray-200">
									{member.role}
								</p>
							</div>
						</div>

						{/* Contact Info */}
						<div className="p-6 space-y-4">
							<div className="flex items-center space-x-3 text-gray-700">
								<Mail className="w-5 h-5 text-blue-600" />
								<span className="text-lg">{member.email}</span>
							</div>
							<div className="flex items-center space-x-3 text-gray-700">
								<Phone className="w-5 h-5 text-blue-600" />
								<span className="text-lg">{member.phone}</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default TeamGridPage
