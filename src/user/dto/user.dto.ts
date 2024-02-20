import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { PomodoroSettingsDto } from './pomodor-settings.dto';

export class UserDto extends PomodoroSettingsDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at 6 characters long   ' })
  @IsString()
  password?: string;
}
