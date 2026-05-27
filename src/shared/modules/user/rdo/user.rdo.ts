import { Expose, Transform } from 'class-transformer';
import { DEFAULT_AVATAR_FILE_NAME } from '../user.constant.js';

export class UserRdo {
  @Expose({ name: '_id' })
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose()
  @Transform(({ value }) => value || DEFAULT_AVATAR_FILE_NAME)
  public avatarPath!: string;

  @Expose()
  public type!: string;
}
