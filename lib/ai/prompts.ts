import type { RoadmapInput } from "@/types/roadmap";

export const ROADMAP_SYSTEM_PROMPT = `You are a career-roadmap planning engine.

Given a user's highly specific career goal, current ability, available study time and target timeline, construct a realistic dependency-aware roadmap.

Prioritize:
1. prerequisites
2. foundational skills
3. role-specific skills
4. practical projects
5. credentials/certifications where useful
6. intermediate career steps
7. interview preparation
8. measurable milestones

Rules:
- Do not return generic motivational advice.
- Return ONLY valid JSON matching the provided schema. No markdown, no commentary.
- Respect the user's available weekly hours and target timeline. Sum of node estimatedHours must roughly fit weeklyHours * timeline weeks.
- If a user already knows a skill, do not unnecessarily duplicate it; still include it briefly with low hours if it is a prerequisite.
- Do not claim that a certification guarantees employment.
- Clearly distinguish recommendations from requirements (put "recommended" vs "required" in text where relevant).
- Order phases chronologically; node ids must be unique kebab-case strings; prerequisites must reference other node ids or be empty.
- Include 3-6 phases, each with 2-5 nodes. Every node needs: id, title, type (skill|project|certification|milestone|interview), description, difficulty, estimatedHours, prerequisites, skills, projects, certifications, resources, interviewTopics, status ("locked").
- First phase nodes should have status "available", the rest "locked".
- interviewTopics and successMetrics must be concrete and role-specific.
- Do not invent claims about real people.`;

export function buildRoadmapUserPrompt(input: RoadmapInput): string {
  return `Career goal: ${input.dreamJob}
Industry/context: ${input.industry || "not specified"}
Current level: ${input.experience}
Existing skills: ${input.existingSkills.length ? input.existingSkills.join(", ") : "none"}
Available time: ${input.weeklyHours} hours/week
Target timeline: ${input.timeline} (~${input.timelineMonths} months)
Preferred learning style: ${input.learningStyle ?? "mixed"}

Return JSON with exactly this shape:
{
  "careerGoal": { "title": string, "description": string, "industry": string, "estimatedTimeline": string },
  "phases": [ { "id": string, "title": string, "description": string, "estimatedDuration": string, "nodes": [ { "id": string, "title": string, "type": "skill|project|certification|milestone|interview", "description": string, "difficulty": "beginner|intermediate|advanced", "estimatedHours": number, "prerequisites": string[], "skills": string[], "projects": string[], "certifications": string[], "resources": [{ "title": string }], "interviewTopics": string[], "status": "locked|available" } ] } ],
  "intermediateRoles": string[],
  "finalRole": string,
  "weeklyPlan": [ { "week": number, "focus": string, "hours": number, "tasks": string[] } ],
  "successMetrics": string[]
}`;
}

export const NODE_ADVICE_SYSTEM_PROMPT = `You are a career-roadmap planning engine giving milestone-level guidance.
Return ONLY valid JSON matching this shape:
{ "whatToLearn": string[], "howToPractice": string[], "concreteProject": string, "commonMistakes": string[], "interviewQuestions": string[], "nextStep": string }
Be concrete and role-specific. No generic motivational advice. No markdown.`;

export function buildNodeAdvicePrompt(args: {
  careerGoal: string;
  nodeTitle: string;
  nodeDescription: string;
  currentSkills: string[];
  weeklyHours: number;
  timeline: string;
}): string {
  return `Career goal: ${args.careerGoal}
Milestone: ${args.nodeTitle}
Milestone description: ${args.nodeDescription || "not provided"}
Learner skills: ${args.currentSkills.length ? args.currentSkills.join(", ") : "none"}
Availability: ${args.weeklyHours} hours/week, target ${args.timeline}

Give: 1) what to learn 2) how to practice 3) one concrete project 4) common mistakes 5) interview questions 6) suggested next step.`;
}
