"use client";
import React from 'react';
import Chat from '@/components/managerDashboard/Chat';

export default function UserChatPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = React.use(params);
    return (
        <div>
            <Chat userId={userId} />
        </div>
    )
}