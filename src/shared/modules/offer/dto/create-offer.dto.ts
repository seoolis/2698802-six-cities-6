import { HouseType } from '../../../types/enums/house.type.enum.js';
import { AmenitiesType } from '../../../types/enums/amenities.type.enum.js';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested
} from 'class-validator';
import { CreateOfferValidationMessage } from './create-offer.messages.js';
import { CITIES } from '../const/city.const.js';

class CoordinatesDto {
  @IsNumber({}, { message: 'latitude must be a number' })
  public latitude!: number;

  @IsNumber({}, { message: 'longitude must be a number' })
  public longitude!: number;
}

export class CreateOfferDto {
  @MinLength(10, { message: CreateOfferValidationMessage.title.minLength })
  @MaxLength(100, { message: CreateOfferValidationMessage.title.maxLength })
  public title!: string;

  @MinLength(20, { message: CreateOfferValidationMessage.description.minLength })
  @MaxLength(1024, { message: CreateOfferValidationMessage.description.maxLength })
  public description!: string;

  @IsDateString({}, { message: CreateOfferValidationMessage.postDate.invalidFormat })
  public publishedDate!: Date;

  @IsIn(Object.keys(CITIES), { message: 'city must be one of supported cities' })
  public city!: string;

  @IsString({ message: 'previewImage must be a string' })
  public previewImage!: string;

  @IsArray({ message: 'photos must be an array' })
  @ArrayMinSize(6, { message: 'photos must contain exactly 6 items' })
  @ArrayMaxSize(6, { message: 'photos must contain exactly 6 items' })
  public photos!: string[];

  @IsBoolean({ message: 'isPremium must be boolean' })
  public isPremium!: boolean;

  @IsNumber({}, { message: 'rating must be a number' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating must be at most 5' })
  public rating!: number;

  @IsEnum(HouseType, { message: 'type must be a valid house type' })
  public type!: HouseType;

  @IsInt({ message: 'rooms must be an integer' })
  @Min(1, { message: 'rooms must be at least 1' })
  @Max(8, { message: 'rooms must be at most 8' })
  public rooms!: number;

  @IsInt({ message: 'guests must be an integer' })
  @Min(1, { message: 'guests must be at least 1' })
  @Max(10, { message: 'guests must be at most 10' })
  public guests!: number;

  @IsInt({ message: CreateOfferValidationMessage.price.invalidFormat })
  @Min(100, { message: CreateOfferValidationMessage.price.minValue })
  @Max(100000, { message: CreateOfferValidationMessage.price.maxValue })
  public price!: number;

  @IsArray({ message: 'amenities must be an array' })
  @ArrayMinSize(1, { message: 'amenities must contain at least 1 item' })
  @IsEnum(AmenitiesType, { each: true, message: 'amenities must contain valid items' })
  public amenities!: AmenitiesType[];

  @IsOptional()
  @IsMongoId({ message: CreateOfferValidationMessage.userId.invalidId })
  public author?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  public coordinates!: CoordinatesDto;
}
