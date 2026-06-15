"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Code, Briefcase, FileText, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [seeding, setSeeding] = useState(false);

  const summaryCards = [
    { title: "Profile", icon: User, href: "/admin-afzal-1299/profile", description: "Manage your hero section and basic info" },
    { title: "About", icon: Info, href: "/admin-afzal-1299/about", description: "Manage the About section and its frontend content" },
    { title: "Skills", icon: Code, href: "/admin-afzal-1299/skills", description: "Update your technical skills" },
    { title: "Projects", icon: Briefcase, href: "/admin-afzal-1299/projects", description: "Add or edit portfolio projects" },
    { title: "Experience", icon: FileText, href: "/admin-afzal-1299/experience", description: "Manage your work history" },
  ];

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const projects = [
        { name: "Portfolio Website V1", description: "First iteration of my personal portfolio built with React.", technologies: "React, CSS", githubUrl: "https://github.com", liveUrl: "https://example.com", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", category: "Web Development", status: "Completed", order: 1 },
        { name: "Expense Tracker App", description: "A mobile application to track daily expenses.", technologies: "React Native, Firebase", githubUrl: "https://github.com", liveUrl: "https://example.com", imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c", category: "Mobile App", status: "Completed", order: 2 }
      ];
      const experiences = [
        { company: "TechNova Solutions", role: "Software Engineer", duration: "Jan 2022 - Present", description: "Leading the frontend development team in building a highly scalable SaaS platform.", technologies: "React, TypeScript, GraphQL", order: 1 },
        { company: "Creative Minds Agency", role: "Frontend Developer", duration: "Jun 2020 - Dec 2021", description: "Developed and maintained multiple client websites.", technologies: "Vue.js, Tailwind CSS", order: 2 }
      ];
      const certificates = [
        { name: "AWS Certified Solutions Architect", organization: "Amazon Web Services", date: "August 2023", credentialId: "AWS-SAA-12345", verificationUrl: "https://aws.amazon.com", imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644", order: 1 },
        { name: "Google Data Analytics Professional", organization: "Google / Coursera", date: "March 2022", credentialId: "GOOG-DA-9876", verificationUrl: "https://coursera.org", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4", order: 2 }
      ];
      const skills = [
        { name: "JavaScript", category: "Frontend", order: 1 },
        { name: "TypeScript", category: "Frontend", order: 2 },
        { name: "React", category: "Frontend", order: 3 },
        { name: "Node.js", category: "Backend", order: 4 }
      ];
      const achievements = [
        { title: "Employee of the Year", category: "Award", description: "Awarded Employee of the Year 2023.", date: "Dec 2023", order: 1 },
        { title: "Hackathon 1st Place", category: "Hackathon", description: "Won 1st place at Global Hack Week.", date: "Oct 2022", order: 2 }
      ];

      for (const p of projects) await addDoc(collection(db, "projects"), p);
      for (const e of experiences) await addDoc(collection(db, "experience"), e);
      for (const c of certificates) await addDoc(collection(db, "certificates"), c);
      for (const s of skills) await addDoc(collection(db, "skills"), s);
      for (const a of achievements) await addDoc(collection(db, "achievements"), a);

      toast.success("Database successfully seeded with duplicate dummy data!");
    } catch (error) {
      console.error(error);
      toast.error("Error seeding database.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your portfolio admin panel. Select a section to start editing.
          </p>
        </div>
        <Button onClick={handleSeed} disabled={seeding} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          {seeding ? "Seeding..." : "Seed Dummy Data"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="h-full cursor-pointer hover:border-primary hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon size={24} className="text-primary" />
                    <CardTitle>{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
