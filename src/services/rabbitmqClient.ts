import amqp from "amqplib";
import { randomUUID } from "crypto";
import EventEmitter from "events";
import { getLogger } from "./logger";

const getRabbitMQConnString = (): string => {
  return `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
};

const logger = getLogger(__filename);

class RabbitMQClient {
  private connection: Promise<amqp.Connection> | null = null;
  private publishChannel: amqp.Channel | null = null;
  private subscribeChannel: amqp.Channel | null = null;
  constructor(
    protected rabbitmqConnString: string,
    protected replyToQueue: string
  ) {}

  private connect() {
    if (!this.connection) {
      this.connection = amqp.connect(this.rabbitmqConnString);
    }
    return this.connection;
  }

  protected async getPublishChannel() {
    if (!this.publishChannel) {
      this.publishChannel = await (await this.connect()).createChannel();
    }
    return this.publishChannel;
  }

  protected async getSubscribeChannel() {
    if (!this.subscribeChannel) {
      this.subscribeChannel = await (await this.connect()).createChannel();
    }
    return this.subscribeChannel;
  }

  async subscribe(
    queue: string,
    listener: (msg: amqp.Message) => Promise<void> | void
  ) {
    const channel = await this.getSubscribeChannel();
    channel.assertQueue(queue);
    channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const start = Date.now();
          await listener(msg);
          // manual acknowledge
          logger.info(
            {
              duration: Date.now() - start,
              messageId: msg.properties.messageId,
            },
            `acknowledging message: ${msg.properties.messageId.toString()}`
          );
          channel.ack(msg);
        } catch (e: any) {
          logger.error(
            {
              msg: msg.content.toString(),
            },
            e
          );
        }

        return;
      }
    });
  }

  async publish(
    queue: string,
    message: Record<string, any>,
    queueOptions?: amqp.Options.AssertQueue,
    options?: amqp.Options.Publish
  ): Promise<void> {
    const channel = await this.getPublishChannel();
    channel.assertQueue(queue, queueOptions);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      messageId: randomUUID(),
      ...options,
    });
  }
}

class RabbitMQRPCClient extends RabbitMQClient {
  private eventEmitter = new EventEmitter();

  constructor(rabbitmqConnString: string, replyToQueue: string) {
    super(rabbitmqConnString, replyToQueue);
    this.listenToReplyQueue();
  }
  private async listenToReplyQueue() {
    this.subscribe(this.replyToQueue, (msg) => {
      if (msg) {
        this.eventEmitter.emit(msg.properties.correlationId, msg.content);
      }
    });
  }

  call<T extends Record<string, any>>(
    queue: string,
    message: Record<string, any>
  ): Promise<T> {
    return new Promise(async (resolve) => {
      const correlationId = randomUUID();
      // resolve the promise after receiving an event - might block forever.
      this.eventEmitter.once(correlationId, (buffer) => {
        resolve(JSON.parse(buffer.toString()));
      });
      this.publish(
        queue,
        message,
        { durable: true, maxPriority: 10 },
        {
          correlationId,
          replyTo: this.replyToQueue,
          // an rpc should always have a higher priority than a regular message
          priority: 5,
        }
      );
    });
  }
}
