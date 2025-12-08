export interface Stack {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Template {
  id: string;
  name: string;
  stackId: string;
  imageUrl: string;
  prompt: string;
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
