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
import { Trash2, Edit } from "lucide-react";

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  technologies: string;
  order: number;
}

export default function ExperienceAdmin() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    duration: "",
    description: "",
    technologies: "",
    order: 0,
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  async function fetchExperiences() {
    setLoading(true);
    try {
      const q = query(collection(db, "experience"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedData: Experience[] = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as Experience);
      });
      setExperiences(fetchedData);
    } catch (error) {
      console.error("Error fetching experience:", error);
      toast.error("Failed to load experience history");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ company: "", role: "", duration: "", description: "", technologies: "", order: experiences.length });
  };

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setFormData({
      company: exp.company,
      role: exp.role,
      duration: exp.duration,
      description: exp.description,
      technologies: exp.technologies,
      order: exp.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience entry?")) return;
    try {
      await deleteDoc(doc(db, "experience", id));
      toast.success("Experience deleted successfully");
      fetchExperiences();
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("Failed to delete experience");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const docRef = doc(db, "experience", editingId);
        await updateDoc(docRef, formData);
        toast.success("Experience updated successfully");
      } else {
        await addDoc(collection(db, "experience"), formData);
        toast.success("Experience added successfully");
      }
      resetForm();
      fetchExperiences();
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("Failed to save experience");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
        <p className="text-muted-foreground mt-2">
          Manage your work history, internships, and professional roles.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Form Section */}
        <Card className="md:col-span-5 h-fit sticky top-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Experience" : "Add Experience"}</CardTitle>
            <CardDescription>Add a new role to your timeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Google" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role / Job Title</Label>
                <Input id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Software Engineer Intern" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. May 2024 - Aug 2024" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What did you do?" className="h-24" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies (comma separated)</Label>
                <Input id="technologies" value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} placeholder="e.g. React, Node.js, Firebase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order (Timeline)</Label>
                <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} required />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : editingId ? "Update Entry" : "Add Entry"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List Section */}
        <div className="md:col-span-7 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experience Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading experience...</div>
              ) : experiences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No experience entries found. Add your first role!
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-foreground">{exp.role}</div>
                          <div className="text-xs text-muted-foreground">{exp.duration}</div>
                        </div>
                        <div className="text-sm font-medium text-primary mb-2">{exp.company}</div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{exp.description}</p>
                        
                        <div className="flex items-center justify-end gap-2 border-t pt-3 mt-3">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(exp)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(exp.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
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
