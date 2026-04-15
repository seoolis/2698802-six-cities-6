import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { FavoriteEntity } from './favorite.entity.js';
import { FavoriteService } from './favorite-service.interface.js';

@injectable()
export class DefaultFavoriteService implements FavoriteService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.FavoriteModel) private readonly favoriteModel: types.ModelType<FavoriteEntity>,
  ) {}

  public async add(userId: string, offerId: string): Promise<DocumentType<FavoriteEntity>> {
    const result = await this.favoriteModel.create({ userId, offerId });
    this.logger.info(`Offer ${offerId} added to favorites for user ${userId}`);
    return result;
  }

  public async remove(userId: string, offerId: string): Promise<boolean> {
    const result = await this.favoriteModel.deleteOne({ userId, offerId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }

  public async toggle(userId: string, offerId: string, makeFavorite: boolean): Promise<boolean> {
    if (makeFavorite) {
      await this.favoriteModel.updateOne(
        { userId, offerId },
        { $setOnInsert: { userId, offerId } },
        { upsert: true }
      ).exec();
      return true;
    }

    return this.remove(userId, offerId);
  }

  public async exists(userId: string, offerId: string): Promise<boolean> {
    const count = await this.favoriteModel.countDocuments({ userId, offerId }).exec();
    return count > 0;
  }

  public async findOfferIdsByUserId(userId: string): Promise<string[]> {
    const rows = await this.favoriteModel.find({ userId }).select({ offerId: 1 }).lean().exec();
    return rows.map((r) => r.offerId.toString());
  }

  public async deleteByOfferId(offerId: string): Promise<number> {
    const result = await this.favoriteModel.deleteMany({ offerId }).exec();
    return result.deletedCount ?? 0;
  }
}

