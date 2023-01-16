import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const getRabbitMQConnString = (): string => {
  return `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
};

export const databaseConnection = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  password: process.env.MYSQL_PASSWORD,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
};
