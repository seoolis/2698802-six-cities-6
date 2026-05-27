import { Expose, Type } from 'class-transformer';
import { UserRdo } from '../../user/rdo/user.rdo.js';

export class CommentRdo {
  @Expose()
  public text!: string;

  @Expose({ name: 'createdAt' })
  public publishDate!: Date;

  @Expose()
  public rating!: number;

  @Expose({ name: 'authorId' })
  @Type(() => UserRdo)
  public author!: UserRdo;
}

