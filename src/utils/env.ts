import { load } from 'ts-dotenv';

export const env = load({
    EVENT_NOTIFIER_BASE_URL: String,
    EVENT_NOTIFIER_API_KEY: {
        type: String,
        optional: true,
    },
    EVENT_NOTIFIER_API_KEY_HEADER: {
        type: String,
        optional: true,
        default: 'Api-Key',
    },
    SIGNATURE_WALLET_MNEMONIC: String,
});
