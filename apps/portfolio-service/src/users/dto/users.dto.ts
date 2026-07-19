export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: 'user' | 'owner' | 'admin';
}

export class UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'user' | 'owner' | 'admin';
}
