"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Edit, UploadCloud, ExternalLink, Code } from "lucide-react";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  category: string;
  status: string;
  order: number;
}

const CATEGORIES = ["Web Development", "Mobile App", "AI/Machine Learning", "Backend/API", "Other"];
const STATUSES = ["Completed", "In Progress", "Planned"];

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    imageUrl: "",
    category: "",
    status: "Completed",
    order: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const q = query(collection(db, "projects"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedData: Project[] = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(fetchedData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary credentials are not configured in .env");
      return;
    }

    setUploadingImage(true);
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (response.ok) {
        setFormData({ ...formData, imageUrl: result.secure_url });
        toast.success("Image uploaded to Cloudinary");
      } else {
        throw new Error(result.error.message || "Upload failed");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", technologies: "", githubUrl: "", liveUrl: "", imageUrl: "", category: "", status: "Completed", order: projects.length });
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      technologies: project.technologies,
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      imageUrl: project.imageUrl,
      category: project.category,
      status: project.status,
      order: project.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
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
        const docRef = doc(db, "projects", editingId);
        await updateDoc(docRef, formData);
        toast.success("Project updated successfully");
      } else {
        await addDoc(collection(db, "projects"), formData);
        toast.success("Project added successfully");
      }
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-2">
          Manage your portfolio projects and showcase your work.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Form Section */}
        <Card className="xl:col-span-5 h-fit sticky top-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Project" : "Add New Project"}</CardTitle>
            <CardDescription>Enter details about your software project.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Image Upload Area */}
              <div className="space-y-2">
                <Label>Project Image</Label>
                {formData.imageUrl ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                    <Image src={formData.imageUrl} alt="Project Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="icon" onClick={() => setFormData({...formData, imageUrl: ""})}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                    <UploadCloud className="h-6 w-6 mb-2" />
                    <span className="text-sm">No image uploaded</span>
                  </div>
                )}
                <div>
                  <Input type="file" accept="image/*" onChange={handleCloudinaryUpload} disabled={uploadingImage} />
                  {uploadingImage && <p className="text-sm text-muted-foreground mt-2">Uploading to Cloudinary...</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-24" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies (comma separated)</Label>
                <Input id="technologies" value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} placeholder="e.g. Next.js, Tailwind, Firebase" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val ?? "" })}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val ?? "Completed" })}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input id="githubUrl" type="url" value={formData.githubUrl} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live Demo URL</Label>
                  <Input id="liveUrl" type="url" value={formData.liveUrl} onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} required />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving || uploadingImage} className="flex-1">
                  {saving ? "Saving..." : editingId ? "Update Project" : "Add Project"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List Section */}
        <div className="xl:col-span-7 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No projects added yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((project) => (
                    <div key={project.id} className="flex flex-col border rounded-lg overflow-hidden bg-card transition-shadow hover:shadow-md">
                      <div className="relative w-full h-32 bg-muted">
                        {project.imageUrl ? (
                          <Image src={project.imageUrl} alt={project.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border">
                          {project.status}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
                        <p className="text-xs text-primary mb-2">{project.category}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-3">{project.description}</p>
                        
                        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 hide-scrollbar">
                          {project.technologies.split(',').slice(0, 3).map((tech, i) => (
                            <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex gap-2">
                            {project.githubUrl && (
                              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                                <Code className="h-4 w-4" />
                              </a>
                            )}
                            {project.liveUrl && (
                              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(project)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(project.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
