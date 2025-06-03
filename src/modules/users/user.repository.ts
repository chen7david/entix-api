import { DbService } from '@core/services/db.service';
import { Injectable } from '@core/utils/di.util';

@Injectable()
export class UserRepository {
  constructor(private readonly dbService: DbService) {}

  async find() {
    return [];
  }
}
