export type View = 'home' | 'document' | 'visuals' | 'export'
export type Theme = 'light' | 'dark'
export type DiagramTab = 'flow' | 'fishbone' | 'dependencies'
export type DomainKey =
  | 'productivity'
  | 'finance'
  | 'commerce'
  | 'ai'
  | 'education'
  | 'health'
  | 'crm'
  | 'travel'
  | 'social'
  | 'generic'
export type Priority = 'P0' | 'P1' | 'P2'
export type Complexity = 'Rendah' | 'Sedang' | 'Tinggi'

export interface Persona {
  id: string
  name: string
  role: string
  quote: string
  pain: string
  goal: string
}

export interface Feature {
  id: string
  name: string
  description: string
  priority: Priority
  complexity: Complexity
  phase: string
  dependencies: string[]
  acceptance: string[]
}

export interface UserStory {
  id: string
  persona: string
  role: string
  action: string
  outcome: string
  priority: Priority
}

export interface FunctionalRequirement {
  id: string
  title: string
  detail: string
  priority: Priority
}

export interface NonFunctionalRequirement {
  id: string
  category: string
  target: string
  detail: string
}

export interface Risk {
  id: string
  category: string
  cause: string
  impact: string
  mitigation: string
}

export interface Milestone {
  phase: string
  duration: string
  focus: string
  deliverables: string[]
}

export interface Metric {
  name: string
  target: string
  description: string
}

export interface DataEntity {
  name: string
  fields: string
}

export interface Endpoint {
  method: string
  path: string
  purpose: string
}

export interface TechSpec {
  architecture: string
  stack: string[]
  integrations: string[]
  entities: DataEntity[]
  endpoints: Endpoint[]
}

export interface CustomSection {
  id: string
  title: string
  content: string
}

export interface PRD {
  id: string
  createdAt: string
  updatedAt: string
  prompt: string
  title: string
  tagline: string
  status: 'Draft' | 'Review' | 'Final'
  productType: string
  audience: string
  platform: string
  timeline: string
  team: string
  executiveSummary: string
  problem: string
  solution: string
  goals: string[]
  metrics: Metric[]
  personas: Persona[]
  features: Feature[]
  userStories: UserStory[]
  functional: FunctionalRequirement[]
  nonFunctional: NonFunctionalRequirement[]
  tech: TechSpec
  risks: Risk[]
  milestones: Milestone[]
  openQuestions: string[]
  customSections: CustomSection[]
  sectionTitles: Record<string, string>
  fishboneProblem: string
}

export interface ModelSettings {
  provider: 'local' | 'openai'
  apiKey: string
  baseUrl: string
  model: string
}

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  kind: ToastKind
}

export interface FlowNode {
  id: string
  type: 'start' | 'process' | 'decision' | 'end'
  label: string
  x: number
  y: number
  width: number
  height: number
  featureId?: string
}

export interface FlowEdge {
  id: string
  from: string
  to: string
  label?: string
  kind?: 'default' | 'yes' | 'no'
}

export interface FishboneGroup {
  id: string
  category: string
  causes: string[]
  side: 'top' | 'bottom'
  index: number
}
