"use client";

import { doc, setDoc, addDoc, collection, increment } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

// Admin email configured for analytics access
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "afzal97016458@gmail.com").toLowerCase();

// Cache visitor ID in a module-level variable to avoid redundant localStorage accesses
let cachedVisitorId: string | null = null;

/**
 * Centralized helper to determine if current user is the admin.
 * Admin activity must be completely excluded from all analytics.
 * @returns true if user is admin, false otherwise
 */
/**
 * Determine whether the current user should be treated as an admin.
 * Admin activity must be completely excluded from analytics.
 *
 * The previous implementation returned `true` during server‑side rendering
 * (when `window` is undefined). That caused the analytics code to think *every*
 * request was an admin request, preventing any data from being recorded.
 *
 * The updated logic:
 *   • Return `false` during SSR – analytics are client‑side only, so we simply
 *     skip the admin check.
 *   • Exclude any route under `/admin`.
 *   • If the Firebase auth user is available, compare their email to the
 *     configured admin email.
 *   • Do **not** rely on a legacy `localStorage` flag, which could incorrectly
 *     mark regular visitors as admins.
 */
function isAdminUser(): boolean {
  // Server‑side rendering: no window, no client analytics – treat as non‑admin.
  if (typeof window === "undefined") return false;

  // Admin dashboard routes should never be tracked. The project uses a custom
  // admin prefix (e.g., "/admin-afzal-1299"). Checking for any path that
  // contains "/admin" ensures all admin sections are excluded.
  if (window.location.pathname.includes("/admin")) return true;

  // Direct email check against the configured admin email.
  if (auth.currentUser?.email) {
    const userEmail = auth.currentUser.email.toLowerCase();
    if (userEmail === ADMIN_EMAIL) {
      console.debug("[Analytics] Admin detected (email verified):", userEmail);
      return true;
    }
  }

  // No admin indicators found – treat as regular visitor.
  return false;
}

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
  if (cachedVisitorId) return cachedVisitorId;
  
  let vid = localStorage.getItem("visitorId");
  if (!vid) {
    vid = crypto.randomUUID();
    localStorage.setItem("visitorId", vid);
  }
  cachedVisitorId = vid;
  return vid;
}

async function updateVisitorRecord(visitorId: string, pageName: string) {
  // CRITICAL: Exclude admin from all analytics tracking
  if (isAdminUser()) return;

  const visitorRef = doc(db, "analyticsVisitors", visitorId);
  const now = new Date().toISOString();
  
  try {
    const hasRecord = localStorage.getItem("visitor_record_created") === "true";
    
    if (!hasRecord) {
      // First time on this device: Create the full visitor record
      await setDoc(visitorRef, {
        visitorId,
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        deviceType: getDeviceType(),
        browser: getBrowser(),
        lastActivePage: pageName
      });
      localStorage.setItem("visitor_record_created", "true");
    } else {
      // Subsequent actions: Update lastVisit and lastActivePage, and visitCount if a new session starts
      const isNewSession = !sessionStorage.getItem("has_visited_session");
      const updateData: Record<string, any> = {
        lastVisit: now,
        lastActivePage: pageName
      };
      if (isNewSession) {
        updateData.visitCount = increment(1);
      }
      await setDoc(visitorRef, updateData, { merge: true });
    }
  } catch (error) {
    console.error("Error updating visitor record:", error);
  }
}

async function trackAdvancedEvent(action: string, page: string, metadata: Record<string, any> = {}) {
  // CRITICAL: Exclude admin from all analytics tracking
  if (isAdminUser()) return;
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

  // CRITICAL: Exclude admin from all analytics tracking
  if (isAdminUser()) {
    console.log(`[Analytics] Tracking disabled for admin (${eventName})`);
    return;
  }

  // Fire-and-forget: execute tracking in background so as not to block UI or page render
  (async () => {
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

      // Batch global + daily updates to run concurrently
      await Promise.all([
        setDoc(globalRef, updateData, { merge: true }),
        setDoc(dailyRef, dailyUpdateData, { merge: true })
      ]);
      
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  })();
}

export async function trackProjectView(projectId: string, projectTitle: string) {
  // CRITICAL: Exclude admin from all analytics tracking
  if (isAdminUser()) return;

  // Fire-and-forget pattern
  (async () => {
    try {
      const visitorId = getVisitorId();
      if (!visitorId) return;

      // Trigger advanced event
      await trackAdvancedEvent("project_view", `/project/${projectId}`, { projectId, projectTitle });

      // Update specific project stats in projectAnalytics collection
      const projectRef = doc(db, "projectAnalytics", projectId);
      
      const updateProjectPromise = setDoc(projectRef, {
        projectId,
        projectTitle,
        views: increment(1),
        lastViewedAt: new Date().toISOString()
      }, { merge: true });

      // Ensure session tracking is running
      let updateVisitorPromise;
      if (!sessionStorage.getItem("has_visited_session")) {
        sessionStorage.setItem("has_visited_session", "true");
        await trackAdvancedEvent("portfolio_visit", `/project/${projectId}`);
        updateVisitorPromise = updateVisitorRecord(visitorId, `/project/${projectId}`);
      } else {
        updateVisitorPromise = updateVisitorRecord(visitorId, `/project/${projectId}`);
      }

      await Promise.all([updateProjectPromise, updateVisitorPromise]);
      console.log(`Analytics: Logged view for project - ${projectTitle}`);

    } catch (error) {
      console.error("Analytics tracking error for project:", error);
    }
  })();
}

let observerInitialized = false;
function initScrollObserver() {
  // CRITICAL: Exclude admin from all analytics tracking
  if (observerInitialized || typeof window === "undefined" || isAdminUser()) return;
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

/**
 * Export centralized admin check for use in components or other modules
 * Admin activity is completely excluded from all analytics tracking
 */
export { isAdminUser };
