import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BaseController, HttpError, HttpMethod } from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { TokenService } from '../../libs/token/token-service.interface.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { fillDTO } from '../../helpers/index.js';
import { OfferPreviewRdo } from '../offer/rdo/offer-preview.rdo.js';

type AuthRequest = Request & { headers: { authorization?: string } };

@injectable()
export class FavoriteController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.TokenService) private readonly tokenService: TokenService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);
    this.logger.info('Register routes for FavoriteController…');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Post, handler: this.add });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Delete, handler: this.remove });
  }

  private getUserIdOrThrow(req: AuthRequest): string {
    const raw = req.headers.authorization ?? '';
    const match = raw.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];

    if (!token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authorization required', 'FavoriteController');
    }

    const userId = this.tokenService.getUserId(token);
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid token', 'FavoriteController');
    }

    return userId;
  }

  public async index(req: AuthRequest, res: Response): Promise<void> {
    const userId = this.getUserIdOrThrow(req);
    const offers = await this.offerService.findFavorites(userId);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async add(req: AuthRequest, res: Response): Promise<void> {
    const userId = this.getUserIdOrThrow(req);
    const offerId = req.params.offerId;
    await this.offerService.setFavorite(userId, offerId, true);
    this.ok(res, { offerId, isFavorite: true });
  }

  public async remove(req: AuthRequest, res: Response): Promise<void> {
    const userId = this.getUserIdOrThrow(req);
    const offerId = req.params.offerId;
    await this.offerService.setFavorite(userId, offerId, false);
    res.status(StatusCodes.NO_CONTENT).send();
  }
}

