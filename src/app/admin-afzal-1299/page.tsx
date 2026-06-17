"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Code, Briefcase, FileText, Info } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {

  const summaryCards = [
    { title: "Profile", icon: User, href: "/admin-afzal-1299/profile", description: "Manage your hero section and basic info" },
    { title: "About", icon: Info, href: "/admin-afzal-1299/about", description: "Manage the About section and its frontend content" },
    { title: "Skills", icon: Code, href: "/admin-afzal-1299/skills", description: "Update your technical skills" },
    { title: "Projects", icon: Briefcase, href: "/admin-afzal-1299/projects", description: "Add or edit portfolio projects" },
    { title: "Experience", icon: FileText, href: "/admin-afzal-1299/experience", description: "Manage your work history" },
  ];



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your portfolio admin panel. Select a section to start editing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="h-full cursor-pointer hover:border-primary hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon size={24} className="text-primary" />
                    <CardTitle>{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
