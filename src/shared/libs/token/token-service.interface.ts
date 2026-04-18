export interface TokenService {
  sign(userId: string): string;
  getUserId(token: string): string | null;
}

