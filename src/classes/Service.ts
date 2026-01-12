import { EventNotifierClient } from '@/classes/EventNotifierClient';
import { Signature } from '@/classes/Signature';
import { log } from '@/utils/log';

export class Service {
    private readonly client: EventNotifierClient;
    private readonly wallet: Signature;
    private isShuttingDown = false;

    constructor() {
        this.wallet = Signature.getInstance();
        this.client = new EventNotifierClient(this.wallet);
        this.setupSignalHandlers();
        log.info('[Server] Started successfully');
    }

    public async cleanup(): Promise<void> {
        if (this.isShuttingDown) {
            return;
        }

        this.isShuttingDown = true;
        log.info('[Server] Starting graceful shutdown');

        try {
            await this.client.close();
            log.info('[Server] Graceful shutdown completed');
        } catch (error) {
            log.error('[Server] Error during server cleanup:', error);
        } finally {
            process.exit(0);
        }
    }

    private setupSignalHandlers(): void {
        const onProcessTermination = async () => {
            log.info('[Server] Received termination signal, starting graceful shutdown...');
            await this.cleanup();
        };

        process.once('SIGINT', onProcessTermination);
        process.once('SIGTERM', onProcessTermination);
    }
}
