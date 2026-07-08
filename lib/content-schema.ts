export type CollectionName = "articles" | "recipes" | "projects";

export type BaseMetadata = {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  featured?: boolean;
  coverImage?: string;
};

export type ArticleMetadata = BaseMetadata & {
  subtitle?: string;
  category: string;
};

export type RecipeMetadata = BaseMetadata & {
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients?: string[];
  images?: string[];
  notes?: string[];
  nutrition?: string[];
};

export type ProjectMetadata = BaseMetadata & {
  status: "Planned" | "In Progress" | "Completed";
  technologies: string[];
  github?: string;
  demo?: string;
  startDate?: string;
  completionDate?: string;
  images?: string[];
  lessons?: string[];
  improvements?: string[];
};

export type CollectionMetadataMap = {
  articles: ArticleMetadata;
  recipes: RecipeMetadata;
  projects: ProjectMetadata;
};
