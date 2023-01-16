import amqp from "amqplib";
import { randomUUID } from "crypto";
import EventEmitter from "events";
import { getRabbitMQConnString } from "../server-config";
import { GlobalRef } from "./globalRef";
import { getLogger } from "./logger";

const logger = getLogger(__filename);

export class RabbitMQClient {
  protected instanceId = randomUUID();
  private connection: Promise<amqp.Connection> | null = null;
  private publishChannel: Promise<amqp.Channel> | null = null;
  private subscribeChannel: Promise<amqp.Channel> | null = null;
  constructor(protected rabbitmqConnString: string) {}

  public getInstanceId() {
    return this.instanceId;
  }

  private connect() {
    if (!this.connection) {
      this.connection = amqp.connect(this.rabbitmqConnString);
    }
    return this.connection;
  }

  protected async getPublishChannel() {
    if (!this.publishChannel) {
      this.publishChannel = this.connect().then((connection) => {
        return connection.createChannel();
      });
    }
    return this.publishChannel;
  }

  protected async getSubscribeChannel() {
    if (!this.subscribeChannel) {
      this.subscribeChannel = this.connect().then((connection) =>
        connection.createChannel()
      );
    }
    return this.subscribeChannel;
  }

  async subscribe(
    queue: string,
    listener: (msg: amqp.Message) => Promise<void> | void,
    queueOptions?: amqp.Options.AssertQueue
  ) {
    const channel = await this.getSubscribeChannel();
    await channel.assertQueue(queue, queueOptions);
    await channel.prefetch(1);
    await channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const start = Date.now();
          await listener(msg);
          // manual acknowledge
          logger.info(
            {
              duration: Date.now() - start,
              messageId: msg.properties.messageId,
              queue,
            },
            `acknowledging message: ${msg.properties.messageId.toString()}`
          );
          channel.ack(msg);
        } catch (e: any) {
          if (e) {
            logger.error({ err: e.message }, "error while processing message");
            channel.ack(msg);
          }
        }
        return;
      }
    });
  }

  async assertQueue(queue: string, queueOptions?: amqp.Options.AssertQueue) {
    const channel = await this.getPublishChannel();
    return channel.assertQueue(queue, queueOptions);
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
      `rpc-response-${this.instanceId}`,
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

  stream<T extends Record<string, any>>(
    queue: string,
    message: Record<string, any>,
    options: amqp.Options.Publish & { messageId: string },
    // the first argument provided is a function that can be called to stop the stream
    onMessage: (cancelFn: () => void, msg: T) => void
  ) {
    // resolve the promise after receiving an event - might block forever.
    this.eventEmitter.addListener(options.messageId, (buffer) => {
      onMessage(
        () => this.eventEmitter.removeAllListeners(options.messageId),
        JSON.parse(buffer.toString()).data
      );
    });
    this.publish(
      queue,
      message,
      { durable: true, maxPriority: 10 },
      {
        replyTo: `rpc-response-${this.instanceId}`,
        // an rpc should always have a higher priority than a regular message
        priority: 5,
        ...options,
      }
    );
    return () => this.eventEmitter.removeAllListeners(options.messageId);
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
          replyTo: `rpc-response-${this.instanceId}`,
          // an rpc should always have a higher priority than a regular message
          priority: 5,
          ...options,
        }
      );
    });
  }
}

const rabbitmqRPCClientRef = new GlobalRef<RabbitMQRPCClient>(
  "rabbitmqRPCClient"
);
const rabbitmqClientRef = new GlobalRef<RabbitMQClient>("rabbitmqClient");
if (!rabbitmqRPCClientRef.value) {
  rabbitmqRPCClientRef.value = new RabbitMQRPCClient(getRabbitMQConnString());
}

if (!rabbitmqClientRef.value) {
  rabbitmqClientRef.value = new RabbitMQClient(getRabbitMQConnString());
}

export const rabbitMQRPCClient = rabbitmqRPCClientRef.value;
export const rabbitMQClient = rabbitmqClientRef.value;
