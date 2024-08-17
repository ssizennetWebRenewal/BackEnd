import { Handler, Context, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';

const expressApp = express();
let server: Server;

const bootstrapServer = async (): Promise<Server> => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors();
  await app.init();
  return createServer(expressApp);
};

export const handler: Handler = async (event, context) => {
  if (!server) {
    server = await bootstrapServer();
  }
  return proxy(server, event, context, 'PROMISE').promise;
};
