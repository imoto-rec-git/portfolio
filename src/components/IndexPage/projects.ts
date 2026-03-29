export interface ProjectDetail {
  title: string;
  content: string;
}

export interface Project {
  name: string;
  image: string;
  alt: string;
  width: number;
  height: number;
  link: string;
  description: string;
  details: ProjectDetail[];
  github: string;
  mockup: string;
}
