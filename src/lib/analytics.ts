"use client";

import { doc, setDoc, addDoc, collection, increment, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

// Basic device categorization
function getDeviceType() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
  return "desktop";
}

function getBrowser() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  return "Other";
}

function getVisitorId() {
  if (typeof window === "undefined") return null;
  let vid = localStorage.getItem("visitorId");
  if (!vid) {
    vid = crypto.randomUUID();
    localStorage.setItem("visitorId", vid);
  }
  return vid;
}

function isAdmin() {
  if (typeof window === "undefined") return true; // prevent tracking during SSR
  const isAdminStorage = localStorage.getItem("isAdmin") === "true";
  const isDashboardRoute = window.location.pathname.startsWith("/admin");
  return isAdminStorage || isDashboardRoute || !!auth.currentUser;
}

async function updateVisitorRecord(visitorId: string, pageName: string) {
  if (isAdmin()) return;

  const visitorRef = doc(db, "analyticsVisitors", visitorId);
  const now = new Date().toISOString();
  
  try {
    const visitorSnap = await getDoc(visitorRef);
    if (!visitorSnap.exists()) {
      await setDoc(visitorRef, {
        visitorId,
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        deviceType: getDeviceType(),
        browser: getBrowser(),
        lastActivePage: pageName
      });
    } else {
      const isNewSession = !sessionStorage.getItem("has_visited_session");
      await setDoc(visitorRef, {
        lastVisit: now,
        visitCount: isNewSession ? increment(1) : visitorSnap.data().visitCount,
        lastActivePage: pageName
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error updating visitor record:", error);
  }
}

async function trackAdvancedEvent(action: string, page: string, metadata: Record<string, any> = {}) {
  if (isAdmin()) return;
  const visitorId = getVisitorId();
  if (!visitorId) return;

  try {
    const eventsRef = collection(db, "analyticsEvents");
    await addDoc(eventsRef, {
      visitorId,
      action,
      page,
      timestamp: new Date().toISOString(),
      metadata
    });
  } catch (error) {
    console.error("Error tracking advanced event:", error);
  }
}

export async function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window === "undefined") return;

  if (isAdmin()) {
    console.log(`Analytics: Tracking disabled for admin (${eventName})`);
    return;
  }

  try {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    const today = new Date().toISOString().split("T")[0];
    const globalRef = doc(db, "analytics", "global");
    const dailyRef = doc(db, "analytics", `daily_${today}`);
    
    const updateData: Record<string, any> = { [eventName]: increment(1) };
    const dailyUpdateData: Record<string, any> = { [eventName]: increment(1), date: today };

    if (eventName === EVENTS.PAGE_VIEW) {
      const isNewSession = !sessionStorage.getItem("has_visited_session");
      if (isNewSession) {
        sessionStorage.setItem("has_visited_session", "true");
        await trackAdvancedEvent("portfolio_visit", "Home");
        await updateVisitorRecord(visitorId, "Home");
      }
      
      initScrollObserver(); // start observer
      
      const deviceType = getDeviceType();
      if (!localStorage.getItem("has_visited_unique")) {
        localStorage.setItem("has_visited_unique", "true");
        updateData.unique_visitors = increment(1);
        dailyUpdateData.unique_visitors = increment(1);
        updateData[`device_${deviceType}`] = increment(1);
        dailyUpdateData[`device_${deviceType}`] = increment(1);
      }
      if (isNewSession) {
        updateData.total_visits = increment(1);
        dailyUpdateData.total_visits = increment(1);
      }
    } else {
      // Map existing events to advanced events
      let action = eventName;
      if (eventName === EVENTS.LINKEDIN_CLICK) action = "linkedin_click";
      if (eventName === EVENTS.GITHUB_CLICK) action = "github_click";
      if (eventName === EVENTS.RESUME_DOWNLOAD) action = "resume_download";
      await trackAdvancedEvent(action, window.location.pathname, eventParams);
    }

    await setDoc(globalRef, updateData, { merge: true });
    await setDoc(dailyRef, dailyUpdateData, { merge: true });
    
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
}

export async function trackProjectView(projectId: string, projectTitle: string) {
  if (isAdmin()) return;

  try {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    // Trigger advanced event
    await trackAdvancedEvent("project_view", `/project/${projectId}`, { projectId, projectTitle });

    // Update specific project stats in projectAnalytics collection
    const projectRef = doc(db, "projectAnalytics", projectId);
    await setDoc(projectRef, {
      projectId,
      projectTitle,
      views: increment(1),
      lastViewedAt: new Date().toISOString()
    }, { merge: true });

    // Ensure session tracking is running
    if (!sessionStorage.getItem("has_visited_session")) {
      sessionStorage.setItem("has_visited_session", "true");
      await trackAdvancedEvent("portfolio_visit", `/project/${projectId}`);
      await updateVisitorRecord(visitorId, `/project/${projectId}`);
    } else {
      await updateVisitorRecord(visitorId, `/project/${projectId}`);
    }

    console.log(`Analytics: Logged view for project - ${projectTitle}`);

  } catch (error) {
    console.error("Analytics tracking error for project:", error);
  }
}

let observerInitialized = false;
function initScrollObserver() {
  if (observerInitialized || typeof window === "undefined" || isAdmin()) return;
  observerInitialized = true;

  const visitorId = getVisitorId();
  if (!visitorId) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pageName = entry.target.id;
        if (pageName && pageName !== "hero") { 
          // Check session storage to avoid spamming the same page in one session
          const viewedPages = JSON.parse(sessionStorage.getItem("viewed_pages") || "{}");
          if (!viewedPages[pageName]) {
            viewedPages[pageName] = true;
            sessionStorage.setItem("viewed_pages", JSON.stringify(viewedPages));
            
            trackAdvancedEvent("page_view", pageName);
            updateVisitorRecord(visitorId, pageName);
          }
        }
      }
    });
  }, { threshold: 0.5 });

  setTimeout(() => {
    document.querySelectorAll('section[id]').forEach(el => observer.observe(el));
  }, 1000);
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
