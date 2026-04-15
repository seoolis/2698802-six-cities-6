import { DocumentType } from '@typegoose/typegoose';
import { FavoriteEntity } from './favorite.entity.js';

export interface FavoriteService {
  add(userId: string, offerId: string): Promise<DocumentType<FavoriteEntity>>;
  remove(userId: string, offerId: string): Promise<boolean>;
  toggle(userId: string, offerId: string, makeFavorite: boolean): Promise<boolean>;
  exists(userId: string, offerId: string): Promise<boolean>;
  findOfferIdsByUserId(userId: string): Promise<string[]>;
  deleteByOfferId(offerId: string): Promise<number>;
}

