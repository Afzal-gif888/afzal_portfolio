"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Eye, Download, MousePointer, Activity, Briefcase, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface AnalyticsVisitor {
  visitorId: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  deviceType: string;
  browser: string;
  lastActivePage: string;
}

interface AnalyticsEvent {
  visitorId: string;
  action: string;
  page: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ProjectAnalytics {
  projectId: string;
  projectTitle: string;
  views: number;
}

export default function AnalyticsDashboard() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [visitors, setVisitors] = useState<AnalyticsVisitor[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [projects, setProjects] = useState<ProjectAnalytics[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Verify admin access on mount and when auth state changes
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push("/admin-afzal-1299/login");
        return;
      }
      
      if (!isAdmin) {
        // Authenticated but not admin
        setAccessError("You do not have permission to view analytics. Only the portfolio owner can access this data.");
        setDataLoading(false);
        return;
      }
      
      // User is authenticated and is admin, load analytics
      fetchAdvancedAnalytics();
    }
  }, [loading, user, isAdmin, router]);

  async function fetchAdvancedAnalytics() {
    try {
      // Fetch Visitors
      const visitorsSnap = await getDocs(query(collection(db, "analyticsVisitors"), orderBy("lastVisit", "desc")));
      const vData: AnalyticsVisitor[] = [];
      visitorsSnap.forEach(doc => vData.push(doc.data() as AnalyticsVisitor));
      setVisitors(vData);

      // Fetch Events
      const eventsSnap = await getDocs(query(collection(db, "analyticsEvents"), orderBy("timestamp", "desc")));
      const eData: AnalyticsEvent[] = [];
      eventsSnap.forEach(doc => eData.push(doc.data() as AnalyticsEvent));
      setEvents(eData);

      // Fetch Projects
      const projectsSnap = await getDocs(query(collection(db, "projectAnalytics"), orderBy("views", "desc")));
      const pData: ProjectAnalytics[] = [];
      projectsSnap.forEach(doc => pData.push(doc.data() as ProjectAnalytics));
      setProjects(pData);

      setAccessError(null);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAccessError("Failed to load analytics data. Please check your permissions.");
    } finally {
      setDataLoading(false);
    }
  }

  // Show loading state
  if (loading || dataLoading) {
    return <div className="text-center py-12 text-muted-foreground animate-pulse">Loading...</div>;
  }

  // Show access error
  if (accessError) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-destructive">Analytics Access Restricted</h3>
                <p className="text-sm text-muted-foreground mt-1">{accessError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate top level metrics
  const totalVisitors = visitors.length;
  const uniqueVisitors = totalVisitors; // each document is a unique visitor
  const returningVisitors = visitors.filter(v => v.visitCount > 1).length;
  const totalPortfolioVisits = events.filter(e => e.action === "portfolio_visit").length;
  const linkedinClicks = events.filter(e => e.action === "linkedin_click").length;
  const githubClicks = events.filter(e => e.action === "github_click").length;
  const resumeDownloads = events.filter(e => e.action === "resume_download").length;
  const projectViews = events.filter(e => e.action === "project_view").length;
  const mostViewedProject = projects.length > 0 ? projects[0].projectTitle : "N/A";

  const topLevelStats = [
    { label: "Total Visitors", value: totalVisitors, icon: Users, color: "text-blue-600" },
    { label: "Unique Visitors", value: uniqueVisitors, icon: Users, color: "text-cyan-600" },
    { label: "Returning Visitors", value: returningVisitors, icon: UserCheck, color: "text-indigo-600" },
    { label: "Total Portfolio Visits", value: totalPortfolioVisits, icon: Activity, color: "text-purple-600" },
    { label: "Project Views", value: projectViews, icon: Eye, color: "text-emerald-600" },
    { label: "LinkedIn Clicks", value: linkedinClicks, icon: MousePointer, color: "text-sky-600" },
    { label: "GitHub Clicks", value: githubClicks, icon: MousePointer, color: "text-orange-600" },
    { label: "Resume Downloads", value: resumeDownloads, icon: Download, color: "text-green-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your portfolio's traffic and visitor engagement.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {topLevelStats.map((stat) => {
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-indigo-500" /> Top Performing Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostViewedProject}</div>
            <p className="text-sm text-muted-foreground">{projects.length > 0 ? projects[0].views : 0} views</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-rose-500" /> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {events.slice(0, 15).map((ev, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium capitalize">{ev.action.replace('_', ' ')}</span>
                    <span className="text-xs text-muted-foreground">{ev.page}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
              {events.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor History */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Visitor ID</th>
                  <th className="px-4 py-3">First Visit</th>
                  <th className="px-4 py-3">Total Visits</th>
                  <th className="px-4 py-3">Pages Viewed</th>
                  <th className="px-4 py-3">LinkedIn Clicks</th>
                  <th className="px-4 py-3">GitHub Clicks</th>
                  <th className="px-4 py-3">Project Views</th>
                  <th className="px-4 py-3">Resume DLs</th>
                  <th className="px-4 py-3 rounded-tr-lg">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => {
                  const visitorEvents = events.filter(e => e.visitorId === visitor.visitorId);
                  const pagesViewed = visitorEvents.filter(e => e.action === "page_view").length;
                  const liClicks = visitorEvents.filter(e => e.action === "linkedin_click").length;
                  const ghClicks = visitorEvents.filter(e => e.action === "github_click").length;
                  const projViews = visitorEvents.filter(e => e.action === "project_view").length;
                  const resumeDls = visitorEvents.filter(e => e.action === "resume_download").length;

                  return (
                    <tr key={visitor.visitorId} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground" title={visitor.visitorId}>
                        {visitor.visitorId.split('-')[0]}...
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(visitor.firstVisit).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{visitor.visitCount}</span>
                      </td>
                      <td className="px-4 py-3">{pagesViewed}</td>
                      <td className="px-4 py-3">{liClicks}</td>
                      <td className="px-4 py-3">{ghClicks}</td>
                      <td className="px-4 py-3">{projViews}</td>
                      <td className="px-4 py-3">{resumeDls}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(visitor.lastVisit).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
                {visitors.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No visitors tracked yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
