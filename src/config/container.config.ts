import 'reflect-metadata';
import { Container } from 'typedi';
import { CognitoUserClient, CognitoAdminClient } from 'cognito-client';
import { ConfigService } from '@core/services/config.service';
import {
  CognitoAdminClientToken,
  CognitoUserClientToken,
} from '@core/constants/di-tokens.constant';
import { ErrorConfig } from '@sentientarts/errors';

const configService = Container.get(ConfigService);

ErrorConfig.setDevelopmentMode(configService.isDevelopment());

const clientConfig = {
  region: configService.get('AWS_REGION'),
  userPoolId: configService.get('AWS_USER_POOL_ID'),
  clientId: configService.get('COGNITO_CLIENT_ID'),
};

Container.set(CognitoUserClientToken, new CognitoUserClient(clientConfig));

Container.set(
  CognitoAdminClientToken,
  new CognitoAdminClient({
    ...clientConfig,
    credentials: {
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  }),
);
