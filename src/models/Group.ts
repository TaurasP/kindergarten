import { Child } from './Child';

export interface Group {
    id: number;
    name: string;
    children: Child[];
  }