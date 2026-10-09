import { Worker } from 'bullmq';
import redisClient, { isRedisAvailable } from '../utils/redisClient.js';
import { processNotificationJob } from '../utils/notificationQueue.js';

const QUEUE_NAME = 'treatment-notifications';
let worker = null;

export const startNotificationWorker = () => {
  try {
    if (process.env.REDIS_URL || isRedisAvailable()) {
      const connection = redisClient || { host: '127.0.0.1', port: 6379 };

      worker = new Worker(
        QUEUE_NAME,
        async (job) => {
          console.log(`👷 [BullMQ Worker] Processing queued job #${job.id} (${job.name})...`);
          await processNotificationJob(job.name, job.data);
          return { status: 'success', processedAt: new Date() };
        },
        { connection, concurrency: 5 }
      );

      worker.on('completed', (job) => {
        console.log(`✅ [BullMQ Worker] Job #${job.id} completed successfully!`);
      });

      worker.on('failed', (job, err) => {
        console.error(`❌ [BullMQ Worker] Job #${job?.id} failed with error: ${err.message}`);
      });

      console.log(`👷 [BullMQ Worker] Notification Worker active and listening on queue "${QUEUE_NAME}".`);
    } else {
      console.log('ℹ️ [BullMQ Worker] Worker setup deferred (Redis connection inactive, fallback direct mode active).');
    }
  } catch (err) {
    console.warn('⚠️ [BullMQ Worker] Worker start skipped:', err.message);
  }
};

export default startNotificationWorker;
