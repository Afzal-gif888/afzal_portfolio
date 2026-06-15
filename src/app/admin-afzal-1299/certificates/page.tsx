"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Edit, UploadCloud, ExternalLink, Award } from "lucide-react";
import Image from "next/image";

interface Certificate {
  id: string;
  name: string;
  organization: string;
  date: string;
  credentialId: string;
  verificationUrl: string;
  imageUrl: string;
  order: number;
}

export default function CertificatesAdmin() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    date: "",
    credentialId: "",
    verificationUrl: "",
    imageUrl: "",
    order: 0,
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    setLoading(true);
    try {
      const q = query(collection(db, "certificates"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedData: Certificate[] = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as Certificate);
      });
      setCertificates(fetchedData);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
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
    setFormData({ name: "", organization: "", date: "", credentialId: "", verificationUrl: "", imageUrl: "", order: certificates.length });
  };

  const handleEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setFormData({
      name: cert.name,
      organization: cert.organization,
      date: cert.date,
      credentialId: cert.credentialId,
      verificationUrl: cert.verificationUrl,
      imageUrl: cert.imageUrl,
      order: cert.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      await deleteDoc(doc(db, "certificates", id));
      toast.success("Certificate deleted successfully");
      fetchCertificates();
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Failed to delete certificate");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const docRef = doc(db, "certificates", editingId);
        await updateDoc(docRef, formData);
        toast.success("Certificate updated successfully");
      } else {
        await addDoc(collection(db, "certificates"), formData);
        toast.success("Certificate added successfully");
      }
      resetForm();
      fetchCertificates();
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast.error("Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
        <p className="text-muted-foreground mt-2">
          Manage your certifications and credentials.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Form Section */}
        <Card className="xl:col-span-5 h-fit sticky top-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Certificate" : "Add Certificate"}</CardTitle>
            <CardDescription>Upload proof of your accomplishments.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Image Upload Area */}
              <div className="space-y-2">
                <Label>Certificate Image</Label>
                {formData.imageUrl ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                    <Image src={formData.imageUrl} alt="Certificate Preview" fill className="object-cover" />
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
                <Label htmlFor="name">Certificate Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. AWS Certified Developer" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} required placeholder="e.g. Amazon Web Services" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date Earned</Label>
                  <Input id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required placeholder="e.g. Aug 2024" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credentialId">Credential ID</Label>
                <Input id="credentialId" value={formData.credentialId} onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })} placeholder="e.g. AWS-12345678" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationUrl">Verification URL</Label>
                <Input id="verificationUrl" type="url" value={formData.verificationUrl} onChange={(e) => setFormData({ ...formData, verificationUrl: e.target.value })} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} required />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving || uploadingImage} className="flex-1">
                  {saving ? "Saving..." : editingId ? "Update Certificate" : "Add Certificate"}
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
              <CardTitle>Your Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading certificates...</div>
              ) : certificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No certificates added yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex flex-col border rounded-lg overflow-hidden bg-card transition-shadow hover:shadow-md">
                      {cert.imageUrl ? (
                        <div className="relative w-full h-40 bg-muted">
                          <Image src={cert.imageUrl} alt={cert.name} fill className="object-contain p-2" />
                        </div>
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-muted/50 border-b">
                          <Award className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                      )}
                      
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-lg leading-tight mb-1">{cert.name}</h3>
                        <p className="text-sm font-medium text-primary mb-1">{cert.organization}</p>
                        <p className="text-xs text-muted-foreground mb-3">{cert.date}</p>
                        
                        <div className="flex-1"></div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex gap-2">
                            {cert.verificationUrl && (
                              <a href={cert.verificationUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center text-muted-foreground hover:text-primary">
                                <ExternalLink className="h-3 w-3 mr-1" /> Verify
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cert)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cert.id)}>
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
