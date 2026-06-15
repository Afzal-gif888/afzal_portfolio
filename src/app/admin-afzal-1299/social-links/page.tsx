"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Edit, ExternalLink } from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export default function SocialLinksAdmin() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    icon: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    try {
      const q = query(collection(db, "socialLinks"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedLinks: SocialLink[] = [];
      querySnapshot.forEach((doc) => {
        fetchedLinks.push({ id: doc.id, ...doc.data() } as SocialLink);
      });
      setLinks(fetchedLinks);
    } catch (error) {
      console.error("Error fetching social links:", error);
      toast.error("Failed to load social links");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ platform: "", url: "", icon: "", order: links.length, isActive: true });
  };

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon: link.icon,
      order: link.order,
      isActive: link.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await deleteDoc(doc(db, "socialLinks", id));
      toast.success("Link deleted successfully");
      fetchLinks();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
    }
  };

  const handleToggleActive = async (link: SocialLink) => {
    try {
      const linkRef = doc(db, "socialLinks", link.id);
      await updateDoc(linkRef, { isActive: !link.isActive });
      toast.success(`Link ${link.isActive ? 'disabled' : 'enabled'}`);
      fetchLinks();
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const linkRef = doc(db, "socialLinks", editingId);
        await updateDoc(linkRef, formData);
        toast.success("Link updated successfully");
      } else {
        await addDoc(collection(db, "socialLinks"), formData);
        toast.success("Link added successfully");
      }
      resetForm();
      fetchLinks();
    } catch (error) {
      console.error("Error saving link:", error);
      toast.error("Failed to save link");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Links</h1>
        <p className="text-muted-foreground mt-2">
          Manage your social media profiles and custom links across the portfolio.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Form Section */}
        <Card className="md:col-span-5 h-fit sticky top-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Link" : "Add New Link"}</CardTitle>
            <CardDescription>Configure a social media platform or custom URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform Name</Label>
                <Input 
                  id="platform" 
                  value={formData.platform} 
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })} 
                  placeholder="e.g. LinkedIn, GitHub"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  type="url"
                  value={formData.url} 
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })} 
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon Name (lucide-react)</Label>
                <Input 
                  id="icon" 
                  value={formData.icon} 
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })} 
                  placeholder="e.g. Linkedin, Github, Link"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center space-x-2 pb-2">
                    <Switch 
                      id="isActive" 
                      checked={formData.isActive}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Visible</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : editingId ? "Update Link" : "Add Link"}
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
              <CardTitle>Current Links</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading links...</div>
              ) : links.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No social links configured. Add your first one!
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => (
                    <div key={link.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${link.isActive ? 'bg-card' : 'bg-muted/50 border-dashed'}`}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{link.platform}</span>
                          {!link.isActive && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Hidden</span>}
                        </div>
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 truncate max-w-[200px] md:max-w-[300px]">
                          {link.url}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={link.isActive}
                          onCheckedChange={() => handleToggleActive(link)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(link)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(link.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
