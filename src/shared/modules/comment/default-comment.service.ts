import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { CommentEntity } from './comment.entity.js';
import { CommentService } from './comment-service.interface.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { OfferEntity } from '../offer/offer.entity.js';
import { OfferStats, buildOfferStatsPipeline } from '../offer/offer-utils.js';

const DEFAULT_COMMENTS_LIMIT = 50;

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
  ) {}

  public async create(dto: CreateCommentDto, offerId: string, authorId: string): Promise<DocumentType<CommentEntity>> {
    const result = await this.commentModel.create({
      text: dto.text,
      rating: dto.rating,
      authorId,
      offerId,
    });

    await this.recalculateOfferStats(offerId);

    this.logger.info(`New comment created for offer: ${offerId}`);
    return result;
  }

  public async findByOfferId(offerId: string, limit = DEFAULT_COMMENTS_LIMIT): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel
      .find({ offerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('authorId')
      .exec();
  }

  public async deleteByOfferId(offerId: string): Promise<number> {
    const result = await this.commentModel.deleteMany({ offerId }).exec();
    return result.deletedCount ?? 0;
  }

  private async recalculateOfferStats(offerId: string): Promise<void> {
    const [stats] = await this.commentModel.aggregate<OfferStats>(buildOfferStatsPipeline(offerId)).exec();

    if (!stats) {
      await this.offerModel.updateOne(
        { _id: offerId },
        { $set: { commentsCount: 0, rating: 0 } }
      ).exec();
      return;
    }

    await this.offerModel.updateOne(
      { _id: offerId },
      { $set: { commentsCount: stats.commentsCount, rating: stats.rating } }
    ).exec();
  }
}

