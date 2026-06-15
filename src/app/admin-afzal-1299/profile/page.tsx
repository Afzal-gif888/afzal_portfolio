"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, FileText as FileTextIcon } from "lucide-react";

interface ProfileData {
  name: string;
  title: string;
  intro: string;
  about: string;
  location: string;
  email: string;
  phone: string;
  resumeUrl: string;
  resumeName?: string;
}

export default function ProfileAdmin() {
  const [data, setData] = useState<ProfileData>({
    name: "",
    title: "",
    intro: "",
    about: "",
    location: "",
    email: "",
    phone: "",
    resumeUrl: "",
    resumeName: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, "profile", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data() as ProfileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "profile", "main"), data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCloudinaryUpload = async (file: File, type: "image" | "raw") => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary credentials are not configured in .env");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        return result.secure_url;
      } else {
        throw new Error(result.error.message || "Upload failed");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      toast.error("Failed to upload to Cloudinary");
      return null;
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    const url = await handleCloudinaryUpload(file, "image");
    if (url) {
      setData((prev) => ({ ...prev, resumeUrl: url }));
      toast.success("Resume uploaded. Remember to save changes!");
    }
    setUploadingResume(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information, hero content, and media.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>Upload your resume PDF (Cloudinary)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.resumeUrl ? (
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                  <FileTextIcon className="h-8 w-8 text-primary" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">Resume Uploaded</p>
                    <a href={data.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                      View Document
                    </a>
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => setData(prev => ({...prev, resumeUrl: ""}))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground bg-muted/20">
                  No resume uploaded
                </div>
              )}
              
              <div>
                <Input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume} className="max-w-[250px]" />
                {uploadingResume && <p className="text-sm text-muted-foreground mt-2">Uploading to Cloudinary...</p>}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="resumeName">Custom Download Filename</Label>
                <Input 
                  id="resumeName" 
                  value={data.resumeName || ""} 
                  onChange={(e) => setData({ ...data, resumeName: e.target.value })} 
                  placeholder="e.g. Afzal_Resume" 
                />
                <p className="text-xs text-muted-foreground">The filename users will see when downloading. Falls back to "Resume" if empty.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>This information will be displayed prominently on your site.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={data.name || ""} onChange={(e) => setData({ ...data, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input id="title" value={data.title || ""} onChange={(e) => setData({ ...data, title: e.target.value })} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intro">Short Introduction (Hero)</Label>
                <Textarea id="intro" value={data.intro || ""} onChange={(e) => setData({ ...data, intro: e.target.value })} className="h-24" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={data.email || ""} onChange={(e) => setData({ ...data, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={data.phone || ""} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={data.location || ""} onChange={(e) => setData({ ...data, location: e.target.value })} placeholder="e.g. San Francisco, CA" />
              </div>

              <Button type="submit" disabled={saving} className="w-full mt-6">
                {saving ? "Saving..." : "Save All Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
