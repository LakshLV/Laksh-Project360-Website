import soundsenseImg from "@/assets/project-soundsense.jpg";
import slamImg from "@/assets/project-slam.jpg";
import meditationImg from "@/assets/project-meditation.jpg";
import horrorImg from "@/assets/project-horror.jpg";
import blackholeImg from "@/assets/project-blackhole.jpg";

const staticImages: Record<number, string> = {
  1: soundsenseImg,
  2: slamImg,
  3: meditationImg,
  4: horrorImg,
  5: blackholeImg,
};

export function getProjectImage(projectNumber: number, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  return staticImages[projectNumber] || "/placeholder.svg";
}
