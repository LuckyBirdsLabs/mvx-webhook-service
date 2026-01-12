import { env } from '@/utils/env';
import { Account, Address, Message, MessageComputer, UserVerifier } from '@multiversx/sdk-core/out';

const signature = ''; // From the X-Signature HTTP header
const body = ''; // The webhook payload

(async () => {
    const account = Account.newFromMnemonic(env.SIGNATURE_WALLET_MNEMONIC);

    const kepler = Address.newFromBech32(account.address.toBech32());
    const verifier = UserVerifier.fromAddress(kepler);

    const message = new Message({
        data: new Uint8Array(Buffer.from(body)),
    });
    const messageComputer = new MessageComputer();
    const serializedMessage = messageComputer.computeBytesForVerifying(message);
    const isValid = await verifier.verify(serializedMessage, Buffer.from(signature, 'hex'));

    console.log(`Message is ${isValid ? 'valid' : 'invalid'}`);
})();
