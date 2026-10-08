import { z } from "zod";

export const RoadmapInputSchema = z.object({
  dreamJob: z.string().trim().min(3, "Describe your dream job (min 3 characters).").max(200),
  industry: z.string().trim().max(120).optional().default(""),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  existingSkills: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  weeklyHours: z.number().min(1, "Weekly hours must be at least 1.").max(80),
  timeline: z.string().trim().min(1, "Target timeline is required.").max(40),
  timelineMonths: z.number().min(1).max(36).default(6),
  learningStyle: z.enum(["projects", "courses", "certifications", "hands-on", "mixed"]).optional().default("mixed"),
});

export type RoadmapInputValidated = z.infer<typeof RoadmapInputSchema>;

export const RoadmapResourceSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().max(500).optional().default(""),
  kind: z.string().max(50).optional().default(""),
});

export const RoadmapNodeSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  type: z.enum(["skill", "project", "certification", "milestone", "interview"]),
  description: z.string().min(1).max(1200),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedHours: z.number().min(0).max(500),
  prerequisites: z.array(z.string().max(120)).max(20).default([]),
  skills: z.array(z.string().max(120)).max(20).default([]),
  projects: z.array(z.string().max(300)).max(10).default([]),
  certifications: z.array(z.string().max(200)).max(10).default([]),
  resources: z.array(RoadmapResourceSchema).max(10).default([]),
  interviewTopics: z.array(z.string().max(200)).max(15).default([]),
  status: z.enum(["locked", "available", "in-progress", "completed"]).default("locked"),
});

export const RoadmapPhaseSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(800),
  estimatedDuration: z.string().min(1).max(80),
  nodes: z.array(RoadmapNodeSchema).min(1).max(12),
});

export const RoadmapSchema = z.object({
  careerGoal: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(800),
    industry: z.string().max(160).default(""),
    estimatedTimeline: z.string().min(1).max(80),
  }),
  phases: z.array(RoadmapPhaseSchema).min(2).max(8),
  intermediateRoles: z.array(z.string().max(160)).max(10).default([]),
  finalRole: z.string().min(1).max(200),
  weeklyPlan: z
    .array(
      z.object({
        week: z.number().min(1).max(200),
        focus: z.string().min(1).max(200),
        hours: z.number().min(0).max(100),
        tasks: z.array(z.string().max(300)).max(10).default([]),
      })
    )
    .max(60)
    .default([]),
  successMetrics: z.array(z.string().max(300)).max(15).default([]),
});

export const NodeAdviceSchema = z.object({
  whatToLearn: z.array(z.string().max(400)).min(1).max(10),
  howToPractice: z.array(z.string().max(400)).min(1).max(10),
  concreteProject: z.string().min(1).max(1000),
  commonMistakes: z.array(z.string().max(400)).min(1).max(10),
  interviewQuestions: z.array(z.string().max(400)).min(1).max(10),
  nextStep: z.string().min(1).max(500),
});

export const NodeAdviceRequestSchema = z.object({
  careerGoal: z.string().trim().min(3).max(300),
  nodeId: z.string().trim().min(1).max(120),
  nodeTitle: z.string().trim().min(1).max(200),
  nodeDescription: z.string().trim().max(1500).default(""),
  currentSkills: z.array(z.string().max(100)).max(40).default([]),
  weeklyHours: z.number().min(1).max(80).default(10),
  timeline: z.string().max(60).default("6 months"),
});
