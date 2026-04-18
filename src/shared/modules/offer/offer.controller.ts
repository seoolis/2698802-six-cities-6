import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BaseController, HttpError, HttpMethod } from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { OfferService } from './offer-service.interface.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { TokenService } from '../../libs/token/token-service.interface.js';
import { fillDTO } from '../../helpers/index.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { OfferPreviewRdo } from './rdo/offer-preview.rdo.js';

type AuthRequest = Request & { headers: { authorization?: string } };

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.TokenService) private readonly tokenService: TokenService,
  ) {
    super(logger);
    this.logger.info('Register routes for OfferController…');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/premium', method: HttpMethod.Get, handler: this.premium });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Get, handler: this.show });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Patch, handler: this.update });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Delete, handler: this.delete });
  }

  private getUserIdOrThrow(req: AuthRequest): string {
    const raw = req.headers.authorization ?? '';
    const match = raw.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];

    if (!token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authorization required', 'OfferController');
    }

    const userId = this.tokenService.getUserId(token);
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid token', 'OfferController');
    }

    return userId;
  }

  public async index(req: Request, res: Response): Promise<void> {
    const limitRaw = req.query.limit;
    const limit = typeof limitRaw === 'string' ? Number.parseInt(limitRaw, 10) : undefined;
    const offers = await this.offerService.find(limit);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async premium(req: Request, res: Response): Promise<void> {
    const city = typeof req.query.city === 'string' ? req.query.city : '';
    if (!city) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Query param "city" is required', 'OfferController');
    }

    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async show(req: Request, res: Response): Promise<void> {
    const offerId = req.params.offerId;
    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer ${offerId} not found`, 'OfferController');
    }

    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async create(req: AuthRequest, res: Response): Promise<void> {
    const userId = this.getUserIdOrThrow(req);
    const dto = req.body as CreateOfferDto;

    dto.author = userId;
    dto.publishedDate = dto.publishedDate ? new Date(dto.publishedDate) : new Date();

    const offer = await this.offerService.create(dto);
    this.created(res, fillDTO(OfferRdo, offer));
  }

  public async update(req: AuthRequest, res: Response): Promise<void> {
    const userId = this.getUserIdOrThrow(req);
    const offerId = req.params.offerId;
    const dto = req.body as UpdateOfferDto;

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer ${offerId} not found`, 'OfferController');
    }

    if (offer.author.toString() !== userId) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden', 'OfferController');
    }

    const updated = await this.offerService.updateById(offerId, dto, userId);
    if (!updated) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer ${offerId} not found`, 'OfferController');
    }

    this.ok(res, fillDTO(OfferRdo, updated));
  }

  public async delete(req: AuthRequest, res: Response): Promise<void> {
    const userId = this.getUserIdOrThrow(req);
    const offerId = req.params.offerId;

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer ${offerId} not found`, 'OfferController');
    }

    if (offer.author.toString() !== userId) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden', 'OfferController');
    }

    const deleted = await this.offerService.deleteById(offerId, userId);
    if (!deleted) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer ${offerId} not found`, 'OfferController');
    }

    res.status(StatusCodes.NO_CONTENT).send();
  }
}

