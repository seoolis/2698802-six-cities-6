import {inject, injectable} from 'inversify';
import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {
  BaseController, DocumentExistsMiddleware,
  HttpError,
  HttpMethod,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
  PrivateRouteMiddleware,
} from '../../libs/rest/index.js';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {OfferService} from './offer-service.interface.js';
import {CreateOfferDto} from './dto/create-offer.dto.js';
import {UpdateOfferDto} from './dto/update-offer.dto.js';
import {fillDTO} from '../../helpers/index.js';
import {OfferRdo} from './rdo/offer.rdo.js';
import {OfferPreviewRdo} from './rdo/offer-preview.rdo.js';
import {
  DEFAULT_DISCUSSED_OFFER_COUNT,
  DEFAULT_NEW_OFFER_COUNT
} from './offer.constant.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);
    this.logger.info('Register routes for OfferController...');
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });

    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.index});
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });
    this.addRoute({
      path: '/premium',
      method: HttpMethod.Get,
      handler: this.premium
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });

    this.addRoute({
      path: '/bundles/new',
      method: HttpMethod.Get,
      handler: this.getNew
    });
    this.addRoute({
      path: '/bundles/discussed',
      method: HttpMethod.Get,
      handler: this.getDiscussed
    });
  }

  public async index(req: Request, res: Response): Promise<void> {
    const limitRaw = req.query.limit;
    const limit = typeof limitRaw === 'string' ? Number.parseInt(limitRaw, 10) : undefined;
    const offers = await this.offerService.find(limit, req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async premium(req: Request, res: Response): Promise<void> {
    const city = typeof req.query.city === 'string' ? req.query.city : '';
    if (!city) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Query param "city" is required', 'OfferController');
    }

    const offers = await this.offerService.findPremiumByCity(city, undefined, req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async show(req: Request, res: Response): Promise<void> {
    const offerId = req.params.offerId;
    const offer = await this.offerService.findById(offerId, req.tokenPayload?.id);

    this.ok(res, fillDTO(OfferRdo, offer));
  }

  //public async create({ body, tokenPayload }: CreateOfferRequest, res: Response): Promise<void> {
  //     const result = await this.offerService.create({ ...body, userId: tokenPayload.id });

  public async create(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }
    const dto = req.body as CreateOfferDto;

    dto.author = userId;
    dto.publishedDate = dto.publishedDate ? new Date(dto.publishedDate) : new Date();

    const offer = await this.offerService.create(dto);
    this.created(res, fillDTO(OfferRdo, offer));
  }

  public async update(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }
    const offerId = req.params.offerId;
    const dto = req.body as UpdateOfferDto;

    const updated = await this.offerService.updateById(offerId, dto, userId);
    if (!updated) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden', 'OfferController');
    }

    this.ok(res, fillDTO(OfferRdo, updated));
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }
    const offerId = req.params.offerId;

    const deleted = await this.offerService.deleteById(offerId, userId);
    if (!deleted) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden', 'OfferController');
    }

    res.status(StatusCodes.NO_CONTENT).send();
  }

  public async getNew(_req: Request, res: Response) {
    const newOffers = await this.offerService.findNew(DEFAULT_NEW_OFFER_COUNT, _req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferRdo, newOffers));
  }

  public async getDiscussed(_req: Request, res: Response) {
    const discussedOffers = await this.offerService.findDiscussed(DEFAULT_DISCUSSED_OFFER_COUNT, _req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferRdo, discussedOffers));
  }
}
