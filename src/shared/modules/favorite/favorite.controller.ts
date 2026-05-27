import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BaseController, DocumentExistsMiddleware, HttpError, HttpMethod, PrivateRouteMiddleware, ValidateObjectIdMiddleware } from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { fillDTO } from '../../helpers/index.js';
import { OfferPreviewRdo } from '../offer/rdo/offer-preview.rdo.js';

@injectable()
export class FavoriteController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);
    this.logger.info('Register routes for FavoriteController…');

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [new PrivateRouteMiddleware()],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Post,
      handler: this.add,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.remove,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });
  }

  public async index(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'FavoriteController');
    }
    const offers = await this.offerService.findFavorites(userId);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async add(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'FavoriteController');
    }
    const offerId = req.params.offerId;
    await this.offerService.setFavorite(userId, offerId, true);
    this.ok(res, { offerId, isFavorite: true });
  }

  public async remove(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'FavoriteController');
    }
    const offerId = req.params.offerId;
    await this.offerService.setFavorite(userId, offerId, false);
    res.status(StatusCodes.NO_CONTENT).send();
  }
}

