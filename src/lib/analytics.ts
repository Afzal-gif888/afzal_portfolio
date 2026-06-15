"use client";

import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function trackEvent(eventName: string) {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Increment global counter
    const globalRef = doc(db, "analytics", "global");
    await setDoc(globalRef, { [eventName]: increment(1) }, { merge: true });

    // Increment daily counter
    const dailyRef = doc(db, "analytics", `daily_${today}`);
    await setDoc(dailyRef, { [eventName]: increment(1), date: today }, { merge: true });
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
