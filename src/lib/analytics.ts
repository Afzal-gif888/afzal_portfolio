"use client";

import { doc, setDoc, increment } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

// Basic device categorization
function getDeviceType() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
  return "desktop";
}

export async function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window === "undefined") return;

  try {
    // 1. Admin & Dashboard Exclusions
    const isAdminStorage = localStorage.getItem("isAdmin") === "true";
    const isDashboardRoute = window.location.pathname.startsWith("/admin");
    
    if (isAdminStorage || isDashboardRoute) {
      console.log("Analytics: Tracking disabled for admin/dashboard");
      return;
    }

    // Secondary fallback: check Firebase auth directly if initialized
    if (auth.currentUser) {
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const globalRef = doc(db, "analytics", "global");
    const dailyRef = doc(db, "analytics", `daily_${today}`);
    
    // Base tracking object
    const updateData: Record<string, any> = { [eventName]: increment(1) };
    const dailyUpdateData: Record<string, any> = { [eventName]: increment(1), date: today };

    // Unique Visitors & Sessions tracking
    if (eventName === EVENTS.PAGE_VIEW) {
      const deviceType = getDeviceType();
      
      // Track Unique Visitors (once per browser)
      if (!localStorage.getItem("has_visited_unique")) {
        localStorage.setItem("has_visited_unique", "true");
        updateData.unique_visitors = increment(1);
        dailyUpdateData.unique_visitors = increment(1);
        
        // Track device types for unique visitors
        updateData[`device_${deviceType}`] = increment(1);
        dailyUpdateData[`device_${deviceType}`] = increment(1);
      }

      // Track Total Visits/Sessions (once per browsing session)
      if (!sessionStorage.getItem("has_visited_session")) {
        sessionStorage.setItem("has_visited_session", "true");
        updateData.total_visits = increment(1);
        dailyUpdateData.total_visits = increment(1);
      }
    }

    // Increment global counter
    await setDoc(globalRef, updateData, { merge: true });

    // Increment daily counter
    await setDoc(dailyRef, dailyUpdateData, { merge: true });
    
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
}

// Predefined event names
export const EVENTS = {
  PAGE_VIEW: "page_views",
  RESUME_DOWNLOAD: "resume_downloads",
  LINKEDIN_CLICK: "linkedin_clicks",
  GITHUB_CLICK: "github_clicks",
  LEETCODE_CLICK: "leetcode_clicks",
  SOCIAL_CLICK: "social_clicks",
  PROJECT_VIEW: "project_views",
  CONTACT_SUBMIT: "contact_submissions",
} as const;
