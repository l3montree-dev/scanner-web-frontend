import amqp from "amqplib";
import { randomUUID } from "crypto";
import EventEmitter from "events";
import { getRabbitMQConnString } from "../server-config";
import { getLogger } from "./logger";

const logger = getLogger(__filename);

export class RabbitMQClient {
  protected instanceId = randomUUID();
  private connection: Promise<amqp.Connection> | null = null;
  private publishChannel: amqp.Channel | null = null;
  private subscribeChannel: amqp.Channel | null = null;
  constructor(protected rabbitmqConnString: string) {}

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
    listener: (msg: amqp.Message) => Promise<void> | void,
    queueOptions?: amqp.Options.AssertQueue
  ) {
    const channel = await this.getSubscribeChannel();
    channel.assertQueue(queue, queueOptions);
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
          logger.error(e);
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
    channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify({ pattern: queue, data: message })),
      {
        messageId: randomUUID(),
        ...options,
      }
    );
  }
}

export class RabbitMQRPCClient extends RabbitMQClient {
  private eventEmitter = new EventEmitter();

  constructor(rabbitmqConnString: string) {
    super(rabbitmqConnString);
    this.listenToReplyQueue();
  }
  async listenToReplyQueue() {
    logger.info("listening to reply queue", this.instanceId);
    this.subscribe(
      this.instanceId,
      (msg) => {
        if (msg) {
          const listenerWasRegistered = this.eventEmitter.emit(
            msg.properties.messageId,
            msg.content
          );
          if (!listenerWasRegistered) {
            logger.warn(
              `no listener was registered for ${msg.properties.messageId}`
            );
          }
        }
      },
      {
        exclusive: true,
      }
    );
  }

  call<T extends Record<string, any>>(
    queue: string,
    message: Record<string, any>,
    options: amqp.Options.Publish & { messageId: string }
  ): Promise<T> {
    return new Promise(async (resolve) => {
      // resolve the promise after receiving an event - might block forever.
      this.eventEmitter.once(options.messageId, (buffer) => {
        resolve(JSON.parse(buffer.toString()).data);
      });
      this.publish(
        queue,
        message,
        { durable: true, maxPriority: 10 },
        {
          replyTo: this.instanceId,
          // an rpc should always have a higher priority than a regular message
          priority: 5,
          ...options,
        }
      );
    });
  }
}

export const rabbitMQRPCClient = new RabbitMQRPCClient(getRabbitMQConnString());
export const rabbitMQClient = new RabbitMQClient(getRabbitMQConnString());
