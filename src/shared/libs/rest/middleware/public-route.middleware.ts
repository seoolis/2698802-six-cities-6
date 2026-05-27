import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/index.js';
import { Middleware } from './middleware.interface.js';

export class PublicRouteMiddleware implements Middleware {
  public async execute({ tokenPayload }: Request, _res: Response, next: NextFunction): Promise<void> {
    if (tokenPayload) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Action available only for anonymous clients',
        'PublicRouteMiddleware'
      );
    }

    return next();
  }
}
