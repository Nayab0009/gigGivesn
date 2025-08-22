"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// Routes that don't require authentication (minimal set)
const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/call',
  '/contractordashboard'
];

// Function to check if current route is public
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};

export default function ConditionalProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    const currentIsPublic = isPublicRoute(pathname);

    if (!isAuthenticated && !currentIsPublic) {
      // User is not authenticated and trying to access protected route
      console.log('Redirecting to signin - not authenticated');
      router.push("/signin");
    } else if (isAuthenticated && (pathname === '/signin' || pathname === '/signup')) {
      // User is authenticated but on signin/signup page, redirect to dashboard
      console.log('Redirecting authenticated user to dashboard');
      const dashboardPath = user ? getDashboardPath(user.role) : '/dashboard';
      router.push(dashboardPath);
    } else if (isAuthenticated && pathname === '/') {
      // Redirect authenticated users from root to their dashboard
      console.log('Redirecting authenticated user from root to dashboard');
      const dashboardPath = user ? getDashboardPath(user.role) : '/dashboard';
      router.push(dashboardPath);
    }
  }, [isLoading, isAuthenticated, pathname, router, user]);

  // Helper function to get dashboard path based on role
  const getDashboardPath = (role: string): string => {
    const ROLE_DASHBOARD_PATHS: Record<string, string> = {
      admin: "/dashboard/admin",
      manager: "/dashboard/manager", 
      employee: "/dashboard/teammember",
      superadmin: "/dashboard/superadmin",
    };
    
    return ROLE_DASHBOARD_PATHS[role.toLowerCase()] || "/dashboard";
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }
  if (!isAuthenticated) {
    return null; 
  }

  return <>{children}</>;
}