import { defaultClasses, getModelForClass, prop, modelOptions } from '@typegoose/typegoose';
import { User, UserType } from '../../types/index.js';
import { createSHA256 } from '../../helpers/index.js';

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
  },
})
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({ unique: true, required: true, trim: true })
  public email!: string;

  @prop({ required: true, trim: true, minlength: 2 })
  public name!: string;

  @prop()
  public avatar?: string;

  @prop({
    required: true,
    enum: Object.values(UserType),
  })
  public type!: UserType;

  @prop({ required: true })
  private password!: string;

  constructor(userData?: User) {
    super();

    if (userData) {
      this.email = userData.email;
      this.name = userData.name;
      this.avatar = userData.avatar;
      this.type = userData.type;
    }
  }

  public setPassword(password: string, salt: string) {
    this.password = createSHA256(password, salt);
  }

  public getPassword(): string {
    return this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
