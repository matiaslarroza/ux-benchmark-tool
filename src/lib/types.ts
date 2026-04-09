export type BenchmarkStatus = 'draft' | 'in_progress' | 'completed';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

export interface Benchmark {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  status: BenchmarkStatus;
  template_id: string | null;
  // Joined
  user?: User;
  competitors?: Competitor[];
}

export interface Competitor {
  id: string;
  benchmark_id: string;
  name: string;
  url: string;
  notes: string;
  created_at: string;
  // Joined
  screenshots?: Screenshot[];
}

export interface Screenshot {
  id: string;
  competitor_id: string;
  image_url: string;
  caption: string;
  section: string;
  tags: string[];
  figma_node_id: string | null;
  figma_file_key: string | null;
  figma_url: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
  suggested_tags: string[];
  created_by: string;
  created_at: string;
  // Joined
  user?: User;
}

export interface TemplateSection {
  name: string;
  description: string;
}

// Form types
export interface BenchmarkFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: BenchmarkStatus;
  template_id: string | null;
}

export interface CompetitorFormData {
  name: string;
  url: string;
  notes: string;
}

export interface TemplateFormData {
  name: string;
  description: string;
  sections: TemplateSection[];
  suggested_tags: string[];
}
