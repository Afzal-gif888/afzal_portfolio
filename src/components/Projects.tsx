"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OptimizedImage from "@/components/OptimizedImage";
import { ExternalLink, Code, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const q = query(collection(db, "projects"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Project;
          // Log the raw image URL from Firestore for debugging malformed values
          if (process.env.NODE_ENV === "production") {
            console.log("[Projects] Firestore imageUrl for", docSnap.id, ":", data.imageUrl);
          }
          // Remove any existing `id` field from the document data to avoid duplicate property errors.
          const { id: _ignored, ...rest } = data as { id?: string };
          fetchedProjects.push({ id: docSnap.id, ...rest } as Project);
        });
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading || projects.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="projects" className="w-full max-w-[1200px] mx-auto px-6 py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-2">Projects</motion.h2>
        <motion.div 
          variants={{
            hidden: { width: 0, opacity: 0 },
            visible: { width: 48, opacity: 1, transition: { duration: 0.6 } }
          }}
          className="h-1 bg-primary rounded-full mb-8"
        ></motion.div>

        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group flex flex-col border rounded-xl overflow-hidden bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <Link href={`/project/${project.id}`} className="relative w-full h-48 bg-muted overflow-hidden block">
                {project.imageUrl ? (
                  <OptimizedImage src={project.imageUrl} alt={project.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No Preview
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium border">
                  {project.status}
                </div>
              </Link>

              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{project.category}</p>
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.split(',').map((tech, i) => (
                    <span key={i} className="text-[11px] bg-muted px-2 py-0.5 rounded-full font-medium">
                      {tech.trim()}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t mt-auto">
                  <Link href={`/project/${project.id}`}>
                    <Button variant="secondary" size="sm">
                      Details <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Button>
                  </Link>
                  {project.githubUrl && (
                    <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={project.githubUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <Code className="h-4 w-4 mr-1.5" /> Code
                      </Button>
                    </motion.a>
                  )}
                  {project.liveUrl && (
                    <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={project.liveUrl} target="_blank" rel="noreferrer">
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-1.5" /> Demo
                      </Button>
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
