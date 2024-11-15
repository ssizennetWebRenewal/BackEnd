import { Request } from 'express';

export interface CustomRequest extends Request {
  user: {
    id: string;
    username: string;
    authority: '사용자' | '영상관리자';
  };
}