import { getRedis } from "@/lib/redis";

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  expirationTime?: number | null;
  keys: PushSubscriptionKeys;
}

export interface StoredPushSubscription {
  id: string;
  userEmail: string;
  firstName?: string;
  subscription: PushSubscriptionPayload;
  sessionCookie: string;
  timezone: string;
  savedAt: number;
}

const SUBSCRIPTION_IDS_KEY = "push:subscription-ids";

function subscriptionKey(id: string): string {
  return `push:sub:${id}`;
}

export function getSubscriptionId(endpoint: string): string {
  return Buffer.from(endpoint).toString("base64url");
}

export async function savePushSubscription(
  record: StoredPushSubscription
): Promise<void> {
  const redis = getRedis();

  await redis.sadd(SUBSCRIPTION_IDS_KEY, record.id);
  await redis.set(subscriptionKey(record.id), record);
}

export async function getAllPushSubscriptions(): Promise<
  StoredPushSubscription[]
> {
  const redis = getRedis();
  const ids = await redis.smembers<string[]>(SUBSCRIPTION_IDS_KEY);

  if (!ids?.length) {
    return [];
  }

  const records = await Promise.all(
    ids.map(async (id) => redis.get<StoredPushSubscription>(subscriptionKey(id)))
  );

  return records.filter(
    (record): record is StoredPushSubscription => record !== null
  );
}

export async function removePushSubscription(id: string): Promise<void> {
  const redis = getRedis();
  await redis.srem(SUBSCRIPTION_IDS_KEY, id);
  await redis.del(subscriptionKey(id));
}
