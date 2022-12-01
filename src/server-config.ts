import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const getRabbitMQConnString = (): string => {
  return `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
};
