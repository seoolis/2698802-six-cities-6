import { FileReader } from './file-reader.interface.js';
import { readFileSync } from 'node:fs';
import chalk from 'chalk';
import {
  OfferType,
  HouseType,
  AmenitiesType,
  UserType,
  City,
  CoordinatesType,
  User
} from '../../types';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string
  ) { }

  public read(): void {
    try {
      this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
      console.log(chalk.green(`Success with reading: ${this.filename}`));
    } catch (err) {
      console.error(chalk.red(`Failed to read file: ${this.filename}`));
      throw err;
    }
  }

  public toArray(): OfferType[] {
    if (!this.rawData) {
      throw new Error(chalk.red('File was not read'));
    }

    const lines = this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .slice(1);

    console.log(chalk.blue(`Records found: ${lines.length}`));

    return lines.map((line) => this.parsing(line));
  }

  private parsing(line: string): OfferType {
    const fields = line.split('\t');

    const [latitude, longitude] = fields[20].split(',').map((coord) => Number.parseFloat(coord));

    const author: User = {
      name: fields[14]?.trim(),
      email: fields[15]?.trim(),
      avatar: fields[16]?.trim() || undefined,
      password: fields[17]?.trim(),
      type: fields[18]?.trim() as UserType
    };

    return {
      title: fields[0]?.trim(),
      description: fields[1]?.trim(),
      publishedDate: new Date(fields[2]),
      city: {
        name: fields[3]?.trim(),
        latitude,
        longitude
      } satisfies City,
      previewImage: fields[4]?.trim(),
      photos: fields[5]?.split(';').map((photo) => photo.trim()),
      isPremium: fields[6]?.trim().toLowerCase() === 'true',
      isFavorite: fields[7]?.trim().toLowerCase() === 'true',
      rating: Number.parseFloat(fields[8]),
      type: fields[9]?.trim() as HouseType,
      rooms: Number.parseInt(fields[10], 10),
      guests: Number.parseInt(fields[11], 10),
      price: Number.parseInt(fields[12], 10),
      amenities: fields[13]?.split(';').map((amenity) => amenity.trim() as AmenitiesType),
      author,
      commentsCount: Number.parseInt(fields[19], 10),
      coordinates: {
        latitude,
        longitude
      } satisfies CoordinatesType
    };
  }
}
