"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  technologies: string;
  order: number;
}

export default function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const q = query(collection(db, "experience"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const fetched: Experience[] = [];
        querySnapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Experience);
        });
        setExperiences(fetched);
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, []);

  if (loading || experiences.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="experience" className="w-full max-w-[1200px] mx-auto px-6 py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-2">Experience</motion.h2>
        <motion.div 
          variants={{
            hidden: { width: 0, opacity: 0 },
            visible: { width: 48, opacity: 1, transition: { duration: 0.6 } }
          }}
          className="h-1 bg-primary rounded-full mb-8"
        ></motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <motion.div 
            variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1, transition: { duration: 1.5 } } }}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-px origin-top" 
          />

          <div className="space-y-8">
            {experiences.map((exp, idx) => (
              <motion.div
                key={exp.id}
                variants={itemVariants}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1.5 mt-2 md:mt-0 z-10 ring-4 ring-background" />

                {/* Content Card */}
                <div className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] ${idx % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                  <motion.div whileHover={{ y: -5, scale: 1.02 }} className="p-5 border rounded-xl bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    <span className="text-xs text-muted-foreground font-medium">{exp.duration}</span>
                    <h3 className="text-lg font-bold mt-1">{exp.role}</h3>
                    <p className="text-sm font-semibold text-primary">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                    
                    {exp.technologies && (
                      <div className={`flex flex-wrap gap-1.5 mt-3 ${idx % 2 === 0 ? "md:justify-end" : ""}`}>
                        {exp.technologies.split(',').map((tech, i) => (
                          <span key={i} className="text-[11px] bg-muted px-2 py-0.5 rounded-full font-medium">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
