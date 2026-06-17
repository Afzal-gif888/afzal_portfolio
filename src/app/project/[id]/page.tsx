"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { trackProjectView } from "@/lib/analytics";
import OptimizedImage from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Code } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProject() {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(projectData);
          
          // Track the project view
          await trackProjectView(projectData.id, projectData.name);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground font-sans pt-[80px] flex items-center justify-center">
        <Navbar />
        <div className="animate-pulse text-lg text-muted-foreground">Loading project...</div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-background text-foreground font-sans pt-[80px] flex flex-col items-center justify-center">
        <Navbar />
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Button onClick={() => router.push("/")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans pt-[80px] flex flex-col">
      <Navbar />
      
      <article className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-12">
        <Button onClick={() => router.push("/#projects")} variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
              {project.category}
            </span>
            <span className="text-sm font-medium border border-border px-3 py-1 rounded-full text-muted-foreground">
              {project.status}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies.split(',').map((tech, i) => (
              <span key={i} className="text-sm bg-muted px-3 py-1 rounded-full font-medium border border-border/50">
                {tech.trim()}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-12">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer">
                <Button size="lg" className="shadow-lg shadow-primary/20">
                  <ExternalLink className="mr-2 h-5 w-5" /> Live Demo
                </Button>
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="border-2">
                  <Code className="mr-2 h-5 w-5" /> Source Code
                </Button>
              </a>
            )}
          </div>

          {project.imageUrl && (
            <div className="relative w-full aspect-video bg-muted rounded-2xl overflow-hidden mb-12 border border-border/50 shadow-2xl">
              <OptimizedImage 
                src={project.imageUrl} 
                alt={project.name} 
                fill 
                className="object-cover"
                sizes="(max-width: 1000px) 100vw, 1000px" 
                priority
              />
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">About the Project</h2>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </motion.div>
      </article>

      <Footer />
    </main>
  );
}
