import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  BaseController,
  DocumentExistsMiddleware,
  HttpError,
  HttpMethod,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware
} from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { CommentService } from './comment-service.interface.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { fillDTO } from '../../helpers/index.js';
import { CommentRdo } from './rdo/comment.rdo.js';
import { TokenService } from '../../libs/token/token-service.interface.js';

type AuthRequest = Request & { headers: { authorization?: string } };

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.TokenService) private readonly tokenService: TokenService,
  ) {
    super(logger);
    this.logger.info('Register routes for CommentController...');

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });
  }

  private getUserIdOrThrow(req: AuthRequest): string {
    const raw = req.headers.authorization ?? '';
    const match = raw.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];

    if (!token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authorization required', 'CommentController');
    }

    const userId = this.tokenService.getUserId(token);
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid token', 'CommentController');
    }

    return userId;
  }

  public async index(req: Request, res: Response): Promise<void> {
    const offerId = req.params.offerId;
    const comments = await this.commentService.findByOfferId(offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async create(req: AuthRequest, res: Response): Promise<void> {
    const offerId = req.params.offerId;
    const authorId = this.getUserIdOrThrow(req);
    const dto = req.body as CreateCommentDto;

    const created = await this.commentService.create(dto, offerId, authorId);
    this.created(res, fillDTO(CommentRdo, created));
  }
}
