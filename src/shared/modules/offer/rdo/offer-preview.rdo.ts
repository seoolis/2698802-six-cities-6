import { Expose, Transform } from 'class-transformer';
import { CITIES } from '../const/city.const.js';

export class OfferPreviewRdo {
  @Expose({ name: '_id' })
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public price!: number;

  @Expose()
  @Transform(({ obj }) => CITIES[obj.city] ?? { name: obj.city, latitude: 0, longitude: 0 })
  public city!: { name: string; latitude: number; longitude: number };

  @Expose()
  public previewImage!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public commentsCount!: number;
}
