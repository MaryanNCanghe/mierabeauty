export type Category = {
  id: number;
  slug: string;
  name: string | null;
  parent_id: number | null;
  image_url?: string | null;
};

export type CategoryNode = Category & { children: Category[] };

export function topLevelCategories(categories: Category[]): Category[] {
  return categories.filter((c) => !c.parent_id);
}

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  return topLevelCategories(categories).map((parent) => ({
    ...parent,
    children: categories.filter((c) => c.parent_id === parent.id),
  }));
}
