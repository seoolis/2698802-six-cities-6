import { defaultClasses, getModelForClass, prop, modelOptions } from '@typegoose/typegoose';
import { createSHA256 } from '../../helpers/hash.js';

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true,
  },
})
export class UserEntity extends defaultClasses.TimeStamps {
  @prop({ unique: true, required: true })
  public email!: string;

  @prop({ required: false, default: '' })
  public avatarPath!: string;

  @prop({ required: true, default: '' })
  public firstname!: string;

  @prop({ required: true, default: '' })
  public lastname!: string;

  @prop({ required: true, default: '' })
  private password?: string;

  public setPassword(password: string, salt: string) {
    this.password = createSHA256(password, salt);
  }

  public getPassword(): string | undefined {
    return this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
