export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type LearningStyle = "projects" | "courses" | "certifications" | "hands-on" | "mixed";
export type NodeType = "skill" | "project" | "certification" | "milestone" | "interview";
export type NodeDifficulty = "beginner" | "intermediate" | "advanced";
export type NodeStatus = "locked" | "available" | "in-progress" | "completed";

export interface RoadmapInput {
  dreamJob: string;
  industry?: string;
  experience: ExperienceLevel;
  existingSkills: string[];
  weeklyHours: number;
  timeline: string;
  timelineMonths: number;
  learningStyle?: LearningStyle;
}

export interface RoadmapResource {
  title: string;
  url?: string;
  kind?: string;
}

export interface RoadmapNodeData {
  id: string;
  title: string;
  type: NodeType;
  description: string;
  difficulty: NodeDifficulty;
  estimatedHours: number;
  prerequisites: string[];
  skills: string[];
  projects: string[];
  certifications: string[];
  resources: RoadmapResource[];
  interviewTopics: string[];
  status: NodeStatus;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  nodes: RoadmapNodeData[];
}

export interface WeeklyPlanItem {
  week: number;
  focus: string;
  hours: number;
  tasks: string[];
}

export interface Roadmap {
  careerGoal: {
    title: string;
    description: string;
    industry: string;
    estimatedTimeline: string;
  };
  phases: RoadmapPhase[];
  intermediateRoles: string[];
  finalRole: string;
  weeklyPlan: WeeklyPlanItem[];
  successMetrics: string[];
  generatedAt: string;
  source: "ai" | "fallback";
}

export interface NodeAdvice {
  whatToLearn: string[];
  howToPractice: string[];
  concreteProject: string;
  commonMistakes: string[];
  interviewQuestions: string[];
  nextStep: string;
}
