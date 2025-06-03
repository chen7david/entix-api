import { Injectable } from '@core/utils/di.util';
import { UserRepository } from '@modules/users/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUsers() {
    return this.userRepository.find();
  }
}
