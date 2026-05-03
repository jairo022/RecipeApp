export interface Comment {
  _id?: string;
  content: string;
  recipe: string;
  author?: {
    _id: string;
    username: string;
  };
  createdAt?: Date;
}
