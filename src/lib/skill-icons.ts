import { IconType } from "react-icons";
import { SiCss, SiDocker, SiFirebase, SiGit, SiGithub, SiHtml5, SiJavascript, SiLinux, SiMysql, SiPython, SiReact, SiTailwindcss, SiTensorflow, SiTypescript } from "react-icons/si";
import { FaAws, FaChartBar, FaFileExcel, FaJava, FaGithub, FaGit } from "react-icons/fa";
import { MdCode } from "react-icons/md";

export const skillIconMap: Record<string, IconType> = {
  python: SiPython,
  java: FaJava,
  react: SiReact,
  typescript: SiTypescript,
  javascript: SiJavascript,
  firebase: SiFirebase,
  aws: FaAws,
  "amazon web services": FaAws,
  "tailwind css": SiTailwindcss,
  tailwind: SiTailwindcss,
  git: SiGit,
  github: SiGithub,
  docker: SiDocker,
  linux: SiLinux,
  sql: SiMysql,
  mysql: SiMysql,
  "power bi": FaChartBar,
  powerbi: FaChartBar,
  excel: FaFileExcel,
  "machine learning": SiTensorflow,
  "deep learning": SiTensorflow,
  css: SiCss,
  html: SiHtml5,
  cloud: FaAws,
  awscloud: FaAws,
  githubs: FaGithub,
  gitlab: FaGit,
  gitkraken: FaGit,
};

export const getSkillIcon = (skillName: string): IconType => {
  const normalized = skillName.trim().toLowerCase();
  return skillIconMap[normalized] ?? MdCode;
};
