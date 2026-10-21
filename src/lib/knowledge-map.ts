export interface KnowledgeNode {
  name: string;
  description?: string;
  detail?: string;
  command?: string;
  children?: KnowledgeNode[];
}
