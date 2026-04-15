import { inject, injectable } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CommentService } from '../comment/comment-service.interface.js';
import { FavoriteService } from '../favorite/favorite-service.interface.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.FavoriteService) private readonly favoriteService: FavoriteService,
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create({
      ...dto,
      // isFavorite is per-user, but schema requires a field. Keep false in DB.
      isFavorite: false,
      commentsCount: 0,
    });
    this.logger.info(`New offer created: ${dto.title}`);
    return result;
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(offerId).populate('author').exec();
  }

  public async find(limit = 60): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .sort({ publishedDate: -1 })
      .limit(limit)
      .populate('author')
      .exec();
  }

  public async findPremiumByCity(city: string, limit = 3): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .populate('author')
      .exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto, userId: string): Promise<DocumentType<OfferEntity> | null> {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      return null;
    }

    if (offer.author.toString() !== userId) {
      return null;
    }

    return this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true })
      .populate('author')
      .exec();
  }

  public async deleteById(offerId: string, userId: string): Promise<boolean> {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      return false;
    }

    if (offer.author.toString() !== userId) {
      return false;
    }

    await this.commentService.deleteByOfferId(offerId);
    await this.favoriteService.deleteByOfferId(offerId);

    const result = await this.offerModel.deleteOne({ _id: offerId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }

  public async findFavorites(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const offerIds = await this.favoriteService.findOfferIdsByUserId(userId);
    if (offerIds.length === 0) {
      return [];
    }

    return this.offerModel
      .find({ _id: { $in: offerIds } })
      .sort({ publishedDate: -1 })
      .populate('author')
      .exec();
  }

  public async setFavorite(userId: string, offerId: string, isFavorite: boolean): Promise<boolean> {
    return this.favoriteService.toggle(userId, offerId, isFavorite);
  }
}
