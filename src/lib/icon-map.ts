import { FaLinkedin, FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { Link as LinkIcon } from "lucide-react"; // fallback

export const IconMap: Record<string, React.ElementType> = {
  "LinkedIn": FaLinkedin,
  "GitHub": FaGithub,
  "LeetCode": SiLeetcode,
  "Github": FaGithub, 
  "Linkedin": FaLinkedin,
  "Leetcode": SiLeetcode,
  "linkedin": FaLinkedin,
  "github": FaGithub,
  "leetcode": SiLeetcode
};

export function getIcon(name: string): React.ElementType {
  if (!name) return LinkIcon;
  const normalizedName = name.toLowerCase();
  const foundKey = Object.keys(IconMap).find(key => key.toLowerCase() === normalizedName);
  return foundKey ? IconMap[foundKey] : LinkIcon;
}
