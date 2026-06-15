"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function useCollection(collectionName: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const q = query(collection(db, collectionName), orderBy("order", "asc"));
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(`Failed to load ${collectionName}`, err);
        toast.error(`Failed to load ${collectionName}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [collectionName]);

  return { items, loading, setItems };
}

export default function AboutAdmin() {
  const { items: services, loading: loadingServices, setItems: setServices } = useCollection("aboutServices");
  const { items: timelineItems, loading: loadingTimeline, setItems: setTimelineItems } = useCollection("aboutTimeline");

  const [header, setHeader] = useState<any>({ subtitle: "" });
  const [profile, setProfile] = useState<any>({ fullName: "", title: "", specialization: "", status: "", location: "" });
  const [summary, setSummary] = useState<any>({ summary: "" });
  const [careerObjective, setCareerObjective] = useState<any>({ description: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const headerSnap = await getDoc(doc(db, "aboutHeader", "main"));
        if (headerSnap.exists()) setHeader({ subtitle: (headerSnap.data() as any)?.subtitle || "" });

        const profileSnap = await getDoc(doc(db, "aboutProfile", "main"));
        if (profileSnap.exists()) setProfile(profileSnap.data());

        const summarySnap = await getDoc(doc(db, "aboutSummary", "main"));
        if (summarySnap.exists()) setSummary({ summary: (summarySnap.data() as any)?.summary || "" });

        const careerSnap = await getDoc(doc(db, "aboutCareerObjective", "main"));
        if (careerSnap.exists()) setCareerObjective({ description: (careerSnap.data() as any)?.description || "" });



      } catch (err) {
        console.error("Failed to load About admin data", err);
        toast.error("Failed to load About admin data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const saveHeader = async () => {
    try {
      await setDoc(doc(db, "aboutHeader", "main"), header);
      toast.success("About header saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save About header");
    }
  };

  const saveProfile = async () => {
    try {
      await setDoc(doc(db, "aboutProfile", "main"), profile);
      toast.success("Profile saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    }
  };

  const saveSummary = async () => {
    try {
      await setDoc(doc(db, "aboutSummary", "main"), summary);
      toast.success("Professional summary saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save professional summary");
    }
  };

  const saveCareerObjective = async () => {
    try {
      await setDoc(doc(db, "aboutCareerObjective", "main"), careerObjective);
      toast.success("Career objective saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save career objective");
    }
  };


  const moveItem = async (collectionName: string, items: any[], index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const current = items[index];
    const adjacent = items[nextIndex];
    if (!current || !adjacent) return;
    try {
      await updateDoc(doc(db, collectionName, current.id), { order: adjacent.order });
      await updateDoc(doc(db, collectionName, adjacent.id), { order: current.order });
      const copy = [...items];
      copy[index] = adjacent;
      copy[nextIndex] = current;
      if (collectionName === "aboutServices") setServices(copy);
      if (collectionName === "aboutTimeline") setTimelineItems(copy);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reorder items");
    }
  };



  const addService = async () => {
    try {
      const newDoc = await addDoc(collection(db, "aboutServices"), { icon: "star", title: "New Service", description: "", order: services.length });
      setServices([...services, { id: newDoc.id, icon: "star", title: "New Service", description: "", order: services.length }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add service");
    }
  };

  const updateService = async (id: string, patch: any) => {
    try {
      await updateDoc(doc(db, "aboutServices", id), patch);
      setServices(services.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update service");
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, "aboutServices", id));
      setServices(services.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service");
    }
  };



  const addTimelineItem = async () => {
    try {
      const newDoc = await addDoc(collection(db, "aboutTimeline"), { year: new Date().getFullYear().toString(), title: "New event", description: "", order: timelineItems.length });
      setTimelineItems([...timelineItems, { id: newDoc.id, year: new Date().getFullYear().toString(), title: "New event", description: "", order: timelineItems.length }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add timeline item");
    }
  };

  const updateTimelineItem = async (id: string, patch: any) => {
    try {
      await updateDoc(doc(db, "aboutTimeline", id), patch);
      setTimelineItems(timelineItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update timeline item");
    }
  };

  const deleteTimelineItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "aboutTimeline", id));
      setTimelineItems(timelineItems.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete timeline item");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">About Section Management</h1>
        <p className="text-muted-foreground mt-2">Manage the About section with a one-to-one content structure for frontend and Firestore.</p>
      </div>

      <div className="space-y-4">
        <details className="group rounded-3xl border border-border bg-card p-4" open>
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-lg font-semibold">
            About Header
            <span className="transition-transform duration-200 group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Headline</Label>
              <Textarea value={header.subtitle || ""} onChange={(e) => setHeader({ ...header, subtitle: e.target.value })} className="h-24" />
            </div>
            <Button onClick={saveHeader}>Save Header</Button>
          </div>
        </details>

        <details className="group rounded-3xl border border-border bg-card p-4" open>
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-lg font-semibold">
            Profile Card
            <span className="transition-transform duration-200 group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input value={profile.fullName || ""} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
              </div>
              <div>
                <Label>Professional Title</Label>
                <Input value={profile.title || ""} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input value={profile.specialization || ""} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Input value={profile.status || ""} onChange={(e) => setProfile({ ...profile, status: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
            </div>
            <Button onClick={saveProfile}>Save Profile</Button>
          </div>
        </details>

        <details className="group rounded-3xl border border-border bg-card p-4" open>
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-lg font-semibold">
            Who am I
            <span className="transition-transform duration-200 group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Who am I</Label>
              <Textarea value={summary.summary || ""} onChange={(e) => setSummary({ ...summary, summary: e.target.value })} className="h-28" />
            </div>
            <Button onClick={saveSummary}>Save Who am I</Button>
          </div>
        </details>

        <details className="group rounded-3xl border border-border bg-card p-4" open>
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-lg font-semibold">
            What I Do Cards
            <span className="transition-transform duration-200 group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 space-y-4">
            <Button onClick={addService}>Add Service</Button>
            {loadingServices ? <div>Loading services...</div> : services.map((item, index) => (
              <div key={item.id} className="rounded-3xl border border-border bg-background p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Icon</Label>
                    <Input value={item.icon || ""} onChange={(e) => updateService(item.id, { icon: e.target.value })} />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input value={item.title || ""} onChange={(e) => updateService(item.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={item.description || ""} onChange={(e) => updateService(item.id, { description: e.target.value })} className="h-24" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => moveItem("aboutServices", services, index, "up")}>Up</Button>
                  <Button onClick={() => moveItem("aboutServices", services, index, "down")}>Down</Button>
                  <Button variant="destructive" onClick={() => deleteService(item.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </details>

        <details className="group rounded-3xl border border-border bg-card p-4" open>
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-lg font-semibold">
            Career Vision
            <span className="transition-transform duration-200 group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Vision</Label>
              <Textarea value={careerObjective.description || ""} onChange={(e) => setCareerObjective({ ...careerObjective, description: e.target.value })} className="h-28" />
            </div>
            <Button onClick={saveCareerObjective}>Save Career Vision</Button>
          </div>
        </details>

        <details className="group rounded-3xl border border-border bg-card p-4" open>
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-lg font-semibold">
            Journey Timeline
            <span className="transition-transform duration-200 group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 space-y-4">
            <Button onClick={addTimelineItem}>Add Timeline Item</Button>
            {loadingTimeline ? <div>Loading timeline...</div> : timelineItems.map((item, index) => (
              <div key={item.id} className="rounded-3xl border border-border bg-background p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Year</Label>
                    <Input value={item.year || ""} onChange={(e) => updateTimelineItem(item.id, { year: e.target.value })} />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input value={item.title || ""} onChange={(e) => updateTimelineItem(item.id, { title: e.target.value })} />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={() => moveItem("aboutTimeline", timelineItems, index, "up")}>Up</Button>
                    <Button onClick={() => moveItem("aboutTimeline", timelineItems, index, "down")}>Down</Button>
                    <Button variant="destructive" onClick={() => deleteTimelineItem(item.id)}>Delete</Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Description</Label>
                  <Textarea value={item.description || ""} onChange={(e) => updateTimelineItem(item.id, { description: e.target.value })} className="h-24" />
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
