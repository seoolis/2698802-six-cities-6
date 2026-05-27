import { HouseType } from '../../../types/enums/house.type.enum.js';
import { AmenitiesType } from '../../../types/enums/amenities.type.enum.js';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsIn,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateUpdateOfferMessage } from './update-offer.messages.js';
import { Type } from 'class-transformer';
import { CITIES } from '../const/city.const.js';

class CoordinatesDto {
  @IsNumber({}, { message: 'latitude must be a number' })
  public latitude!: number;

  @IsNumber({}, { message: 'longitude must be a number' })
  public longitude!: number;
}


export class UpdateOfferDto {
  @IsOptional()
  @MinLength(10,{ message: CreateUpdateOfferMessage.title.minLength })
  @MaxLength(100, { message: CreateUpdateOfferMessage.title.maxLength })
  public title?: string;

  @IsOptional()
  @MinLength(20, { message: CreateUpdateOfferMessage.description.minLength })
  @MaxLength(1024, { message: CreateUpdateOfferMessage.description.maxLength })
  public description?: string;

  @IsOptional()
  @IsDateString({}, { message: CreateUpdateOfferMessage.publishedDate.invalidFormat })
  public publishedDate?: Date;

  @IsOptional()
  @IsIn(Object.keys(CITIES), { message: 'city must be one of supported cities' })
  public city?: string;

  @IsOptional()
  @IsString({ message: CreateUpdateOfferMessage.image.invalidFormat })
  public previewImage?: string;

  @IsOptional()
  @IsArray({ message: 'photos must be an array' })
  @ArrayMinSize(6, { message: 'photos must contain exactly 6 items' })
  @ArrayMaxSize(6, { message: 'photos must contain exactly 6 items' })
  public photos?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isPremium must be boolean' })
  public isPremium?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isFavorite must be boolean' })
  public isFavorite?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'rating must be a number' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating must be at most 5' })
  public rating?: number;

  @IsOptional()
  @IsEnum(HouseType, { message: 'type must be a valid house type' })
  public type?: HouseType;

  @IsOptional()
  @IsInt({ message: 'rooms must be an integer' })
  @Min(1, { message: 'rooms must be at least 1' })
  @Max(8, { message: 'rooms must be at most 8' })
  public rooms?: number;

  @IsOptional()
  @IsInt({ message: 'guests must be an integer' })
  @Min(1, { message: 'guests must be at least 1' })
  @Max(10, { message: 'guests must be at most 10' })
  public guests?: number;

  @IsOptional()
  @IsInt({ message: CreateUpdateOfferMessage.price.invalidFormat })
  @Min(100, { message: CreateUpdateOfferMessage.price.min })
  @Max(100000, { message: CreateUpdateOfferMessage.price.max })
  public price?: number;

  @IsOptional()
  @IsArray({ message: 'amenities must be an array' })
  @ArrayMinSize(1, { message: 'amenities must contain at least 1 item' })
  @IsEnum(AmenitiesType, { each: true, message: 'amenities must contain valid items' })
  public amenities?: AmenitiesType[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  public coordinates?: CoordinatesDto;
}

