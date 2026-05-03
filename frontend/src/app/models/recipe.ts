export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  _id?: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  author?: {
    _id: string;
    username: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
