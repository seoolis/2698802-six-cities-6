import { HouseType } from '../../../types/enums/house.type.enum.js';
import { AmenitiesType } from '../../../types/enums/amenities.type.enum.js';

export class CreateOfferDto {
  public title!: string;
  public description!: string;
  public publishedDate!: Date;
  public city!: string;
  public previewImage!: string;
  public photos!: string[];
  public isPremium!: boolean;
  public rating!: number;
  public type!: HouseType;
  public rooms!: number;
  public guests!: number;
  public price!: number;
  public amenities!: AmenitiesType[];
  public author!: string;
  public coordinates!: {
    latitude: number;
    longitude: number;
  };
}
