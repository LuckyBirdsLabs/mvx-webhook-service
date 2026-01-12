import { HttpClient } from '@/classes/HttpClient';
import { Signature } from '@/classes/Signature';
import { webhooks } from '@/config/config';
import { EventNotifierEvent, EventNotifierMessage } from '@/types/eventNotifier';
import { Webhook } from '@/types/webhook';
import { env } from '@/utils/env';
import { log } from '@/utils/log';
import axiosRetry from 'axios-retry';
import moment from 'moment';
import { ClientOptions, WebSocket } from 'ws';

export class EventNotifierClient {
    private ws!: WebSocket;
    private inactivityTimeout = 120; // seconds
    private inactivityIntervalId!: NodeJS.Timeout;
    private lastActivityTimestamp = 0;
    private isShuttingDown = false;
    private wallet: Signature;
    private httpClient: HttpClient;
    private webhookTimeout = 10000;
    private webhookBodyLimit = 102_400;

    constructor(wallet: Signature) {
        this.wallet = wallet;
        this.httpClient = new HttpClient();
        this.httpClient.setupRetry({
            retries: 3,
            retryDelay: (retryCount) => {
                return retryCount * 5000;
            },
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                    (error.response?.status ? this.isErrorCode(error.response.status) : true);
            },
        });
        this.connect();
    }

    public connect() {
        this.updateLastActivity();
        clearInterval(this.inactivityIntervalId);
        const options: ClientOptions = {};
        options.headers = {};

        if (env.EVENT_NOTIFIER_API_KEY) {
            options.headers[env.EVENT_NOTIFIER_API_KEY_HEADER] = env.EVENT_NOTIFIER_API_KEY;
        }

        this.ws = new WebSocket(env.EVENT_NOTIFIER_BASE_URL, options);

        this.ws.on('error', (error) => {
            log.error(`[Event Notifier] ${error.name}: ${error.message}`);
        });

        this.ws.on('open', () => {
            log.info(`[Event Notifier] Connected to ${env.EVENT_NOTIFIER_BASE_URL}`);
            this.ws.send('{}', (error) => {
                if (error) {
                    log.error(`[Event Notifier] Send error ${error.name}: ${error.message}`);
                }
            });

            this.inactivityIntervalId = setInterval(() => this.checkInactivity(), 1000);
        });

        this.ws.on('message', async (data) => {
            this.updateLastActivity();
            const message: EventNotifierMessage = JSON.parse(data.toString());

            await Promise.all(message.data.map(async (event) => {
                await this.processEvent(event);
            }));
        });

        this.ws.on('close', () => {
            log.warn(`[Event Notifier] Disconnected from ${env.EVENT_NOTIFIER_BASE_URL}`);
            this.updateLastActivity();

            if (!this.isShuttingDown) {
                setTimeout(() => this.connect(), 1000);
            }
        });
    }

    public async close(): Promise<void> {
        this.isShuttingDown = true;

        if (this.inactivityIntervalId) {
            clearInterval(this.inactivityIntervalId);
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return new Promise((resolve) => {
                this.ws.once('close', () => {
                    log.info(`[Event Notifier] WebSocket closed`);
                    resolve();
                });
                this.ws.close();

                setTimeout(() => {
                    log.warn(`[Event Notifier] WebSocket close timeout, forcing cleanup`);
                    resolve();
                }, 3000);
            });
        }
    }

    private updateLastActivity() {
        this.lastActivityTimestamp = moment().unix();
    }

    private checkInactivity() {
        const now = moment().unix();
        const diff = now - this.lastActivityTimestamp;

        if (diff >= this.inactivityTimeout) {
            log.warn(`[Event Notifier] Inactivity detected, reconnecting`);
            this.ws.close();
        }
    }

    private isSuccessCode(code: number) {
        return code >= 200 && code <= 299;
    }

    private isErrorCode(code: number) {
        return !this.isSuccessCode(code);
    }

    private async processEvent(event: EventNotifierEvent) {
        const firstTopic = event.topics.length > 0 && event.topics[0] !== null
            ? Buffer.from(event.topics[0], 'base64').toString()
            : null;

        const matchingWebhooks = webhooks.filter(webhook => {
            if (webhook.enabled === false) {
                return false;
            }

            if (webhook.address && (
                (typeof webhook.address === 'string' && webhook.address !== event.address)
                || (Array.isArray(webhook.address) && !webhook.address.includes(event.address))
            )) {
                return false;
            }

            if (webhook.identifier && webhook.identifier !== event.identifier) {
                return false;
            }

            // noinspection RedundantIfStatementJS
            if (webhook.topic && (firstTopic === null || webhook.topic !== firstTopic)) {
                return false;
            }

            return true;
        });

        await Promise.all(matchingWebhooks.map(webhook => {
            const timestamp = moment().unix();
            this.sendWebhook(webhook, event, timestamp);
        }));
    }

    private async sendWebhook(webhook: Webhook, event: EventNotifierEvent, timestamp: number) {
        const payload = {
            name: webhook.name,
            event: event,
            timestamp: timestamp,
        };
        const signature = await this.wallet.sign(JSON.stringify(payload));

        try {
            await this.httpClient.post(webhook.url, payload, {
                timeout: this.webhookTimeout,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Signature': signature,
                },
                responseType: 'text',
                maxContentLength: this.webhookBodyLimit,
                maxBodyLength: this.webhookBodyLimit,
                maxRedirects: 0,
                validateStatus: (status) => this.isSuccessCode(status),
            });
            log.info(`[Webhook] ${webhook.name} | ${event.txHash} | OK`);
        } catch (error: any) {
            const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
            const statusCode = error.response?.status || 0;
            let message;

            if (statusCode > 0) {
                message = `Status: ${statusCode}`;
            } else {
                message = error.message;
            }

            log.error(`[Webhook] ${webhook.name} | ${event.txHash} | Failed to call ${webhook.url} | ${message} | Timeout: ${isTimeout}`);
        }
    }
}
