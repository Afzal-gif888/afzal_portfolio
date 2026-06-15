"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Edit, Trophy } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  order: number;
}

export default function AchievementsAdmin() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    description: "",
    order: 0,
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    setLoading(true);
    try {
      const q = query(collection(db, "achievements"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedData: Achievement[] = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as Achievement);
      });
      setAchievements(fetchedData);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", category: "", date: "", description: "", order: achievements.length });
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setFormData({
      title: achievement.title,
      category: achievement.category,
      date: achievement.date,
      description: achievement.description,
      order: achievement.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    try {
      await deleteDoc(doc(db, "achievements", id));
      toast.success("Achievement deleted successfully");
      fetchAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const docRef = doc(db, "achievements", editingId);
        await updateDoc(docRef, formData);
        toast.success("Achievement updated successfully");
      } else {
        await addDoc(collection(db, "achievements"), formData);
        toast.success("Achievement added successfully");
      }
      resetForm();
      fetchAchievements();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast.error("Failed to save achievement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground mt-2">
          Manage your awards, hackathons, and special recognitions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Form Section */}
        <Card className="md:col-span-5 h-fit sticky top-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Achievement" : "Add Achievement"}</CardTitle>
            <CardDescription>Add a new milestone or award.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. 1st Place Hackathon" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Award, Hackathon" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} placeholder="e.g. Sep 2024" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Briefly describe what you achieved..." className="h-24" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} required />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : editingId ? "Update Achievement" : "Add Achievement"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List Section */}
        <div className="md:col-span-7 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading achievements...</div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No achievements added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card transition-colors hover:bg-muted/30">
                      <div className="mt-1 bg-primary/10 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{achievement.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{achievement.category}</span>
                              <span className="text-xs text-muted-foreground">{achievement.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(achievement)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(achievement.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
