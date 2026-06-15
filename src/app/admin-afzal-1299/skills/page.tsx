"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
  order: number;
}

const CATEGORIES = [
  "Programming Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Cloud",
  "DevOps",
  "AI/ML",
  "Tools"
];

export default function SkillsAdmin() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    order: 0,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    setLoading(true);
    try {
      const q = query(collection(db, "skills"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedData: Skill[] = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as Skill);
      });
      setSkills(fetchedData);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", category: "", order: skills.length });
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setFormData({
      name: skill.name,
      category: skill.category,
      order: skill.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      await deleteDoc(doc(db, "skills", id));
      toast.success("Skill deleted successfully");
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to delete skill");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const docRef = doc(db, "skills", editingId);
        await updateDoc(docRef, formData);
        toast.success("Skill updated successfully");
      } else {
        await addDoc(collection(db, "skills"), formData);
        toast.success("Skill added successfully");
      }
      resetForm();
      fetchSkills();
    } catch (error) {
      console.error("Error saving skill:", error);
      toast.error("Failed to save skill");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
        <p className="text-muted-foreground mt-2">
          Manage your technical skills across different categories.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Form Section */}
        <Card className="md:col-span-5 h-fit sticky top-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Skill" : "Add New Skill"}</CardTitle>
            <CardDescription>Add a technology or tool to your skill set.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Skill Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. React, Python, Docker"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val ?? "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input 
                  id="order" 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} 
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : editingId ? "Update Skill" : "Add Skill"}
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
        <div className="md:col-span-7 space-y-6">
          {loading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Loading skills...</CardContent></Card>
          ) : skills.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground border-dashed">No skills added yet.</CardContent></Card>
          ) : (
            CATEGORIES.map(category => {
              const categorySkills = skills.filter(s => s.category === category);
              if (categorySkills.length === 0) return null;
              
              return (
                <Card key={category}>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categorySkills.map(skill => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div>
                          <span className="font-medium">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(skill)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(skill.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
