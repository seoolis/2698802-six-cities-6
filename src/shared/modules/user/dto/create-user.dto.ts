import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { CreateUserMessages } from './create-user.messages.js';

enum UserType {
  Default = 'default',
  Pro = 'pro',
}

export class CreateUserDto {
  @IsString({ message: CreateUserMessages.name.invalidFormat })
  @Length(1, 15, { message: CreateUserMessages.name.lengthField })
  public name!: string;

  @IsEmail({}, { message: CreateUserMessages.email.invalidFormat })
  public email!: string;

  @IsOptional()
  @IsString({ message: CreateUserMessages.avatarPath.invalidFormat })
  @Matches(/\.(jpg|jpeg|png)$/i, { message: CreateUserMessages.avatarPath.invalidFormat })
  public avatarPath?: string;

  @IsEnum(UserType, { message: CreateUserMessages.type.invalidFormat })
  public type!: UserType;

  @IsString({ message: CreateUserMessages.password.invalidFormat })
  @Length(6, 12, { message: CreateUserMessages.password.lengthField })
  public password!: string;
}
