"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Download, MousePointer, Send } from "lucide-react";

interface AnalyticsData {
  page_views?: number;
  resume_downloads?: number;
  social_clicks?: number;
  linkedin_clicks?: number;
  github_clicks?: number;
  project_views?: number;
  contact_submissions?: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const globalRef = doc(db, "analytics", "global");
        const docSnap = await getDoc(globalRef);
        if (docSnap.exists()) {
          setData(docSnap.data() as AnalyticsData);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const stats = [
    { label: "Page Views", value: data.page_views || 0, icon: Eye, color: "text-blue-600" },
    { label: "Resume Downloads", value: data.resume_downloads || 0, icon: Download, color: "text-green-600" },
    { label: "Social Clicks", value: data.social_clicks || 0, icon: MousePointer, color: "text-purple-600" },
    { label: "LinkedIn Clicks", value: data.linkedin_clicks || 0, icon: MousePointer, color: "text-sky-600" },
    { label: "GitHub Clicks", value: data.github_clicks || 0, icon: MousePointer, color: "text-orange-600" },
    { label: "Project Views", value: data.project_views || 0, icon: Eye, color: "text-indigo-600" },
    { label: "Contact Submissions", value: data.contact_submissions || 0, icon: Send, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track how visitors interact with your portfolio.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
