"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, User, Code, FileText, Award, Briefcase, LogOut, BarChart3, Link2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin-afzal-1299/login") {
      router.push("/admin-afzal-1299/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in and not on the login page, render nothing while redirecting
  if (!user && pathname !== "/admin-afzal-1299/login") {
    return null;
  }

  // If on the login page, just render the content without the sidebar
  if (pathname === "/admin-afzal-1299/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin-afzal-1299", icon: LayoutDashboard },
    { name: "Profile & Hero", href: "/admin-afzal-1299/profile", icon: User },
    { name: "About", href: "/admin-afzal-1299/about", icon: Info },
    { name: "Social Links", href: "/admin-afzal-1299/social-links", icon: Link2 },
    { name: "Skills", href: "/admin-afzal-1299/skills", icon: Code },
    { name: "Projects", href: "/admin-afzal-1299/projects", icon: Briefcase },
    { name: "Experience", href: "/admin-afzal-1299/experience", icon: FileText },
    { name: "Certificates", href: "/admin-afzal-1299/certificates", icon: Award },
    { name: "Achievements", href: "/admin-afzal-1299/achievements", icon: Award },
    { name: "Analytics", href: "/admin-afzal-1299/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-col h-screen sticky top-0 hidden md:flex">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={signOut}>
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
