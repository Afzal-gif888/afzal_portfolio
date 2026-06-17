import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "afzal97016458@gmail.com").toLowerCase();

export async function POST(request: NextRequest) {
  try {
    // Simple validation - in production, verify the request is from an authenticated admin
    const authHeader = request.headers.get("authorization");
    const { adminEmail, password } = await request.json();

    // Basic credential check (Note: In production, use proper authentication)
    if (adminEmail !== ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid credentials" },
        { status: 401 }
      );
    }

    // Perform analytics reset: delete all analytics related collections and reset counters
    // Import Firestore utilities lazily to avoid circular dependencies
    const { collection, getDocs, deleteDoc, doc, setDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");

    // Helper to delete all documents in a collection
    const clearCollection = async (colName: string) => {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      const batch = [] as Promise<void>[];
      snapshot.forEach((d) => {
        batch.push(deleteDoc(doc(db, colName, d.id)));
      });
      await Promise.all(batch);
    };

    // List of analytics collections to clear
    const collectionsToClear = [
      "analytics",
      "analyticsVisitors",
      "analyticsEvents",
      "projectAnalytics",
      "analyticsSummary",
    ];

    await Promise.all(collectionsToClear.map(clearCollection));

    // Re-initialize global counters to zero
    const globalRef = doc(db, "analytics", "global");
    const zeroData = {
      total_visits: 0,
      unique_visitors: 0,
      returning_visitors: 0,
      page_views: 0,
      resume_downloads: 0,
      linkedin_clicks: 0,
      github_clicks: 0,
      leetcode_clicks: 0,
      social_clicks: 0,
      project_views: 0,
    };
    await setDoc(globalRef, zeroData, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Analytics have been reset successfully.",
      instructions: "Analytics data cleared. Future analytics will only reflect non-admin visitors.",
    });
  } catch (error) {
    console.error("Analytics reset error:", error);
    return NextResponse.json(
      {
        error: "Failed to process analytics reset",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

