import { env } from '@/utils/env';
import { log } from '@/utils/log';
import { Account, Message } from '@multiversx/sdk-core/out';

export class Signature {
    private static instance: Signature;
    public account: Account;

    private constructor() {
        this.account = Account.newFromMnemonic(env.SIGNATURE_WALLET_MNEMONIC);
        log.info(`[Signature] Loaded wallet ${this.account.address.toBech32()}`);
    }

    public static getInstance(): Signature {
        if (!Signature.instance) {
            Signature.instance = new Signature();
        }

        return Signature.instance;
    }

    public async sign(content: string) {
        const message = new Message({
            data: new Uint8Array(Buffer.from(content)),
            address: this.account.address,
        });
        const signedMessage = await this.account.signMessage(message);

        return Array.from(signedMessage)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}
