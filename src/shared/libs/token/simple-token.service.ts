import { injectable } from 'inversify';
import crypto from 'node:crypto';
import { TokenService } from './token-service.interface.js';

@injectable()
export class SimpleTokenService implements TokenService {
  private readonly tokens = new Map<string, string>();

  public sign(userId: string): string {
    const token = crypto.randomUUID();
    this.tokens.set(token, userId);
    return token;
  }

  public getUserId(token: string): string | null {
    return this.tokens.get(token) ?? null;
  }
}

