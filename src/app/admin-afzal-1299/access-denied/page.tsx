"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AccessDeniedPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-destructive" size={28} />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              You are not authorized to access the admin panel.
            </p>
            <p className="text-sm text-muted-foreground">
              Only the portfolio owner can view analytics and manage content.
            </p>
            {user && (
              <p className="text-sm text-muted-foreground">
                Signed in as: <strong>{user.email}</strong>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push("/")}
              className="flex-1"
            >
              Go Home
            </Button>
            <Button 
              variant="destructive" 
              onClick={signOut}
              className="flex-1"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
