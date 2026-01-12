import { Webhook } from '@/types/webhook';

export const webhooks: Webhook[] = [
    {
        name: 'xExchange WEGLD/USDC swap',
        url: 'http://localhost/webhook',
        address: 'erd1qqqqqqqqqqqqqpgqeel2kumf0r8ffyhth7pqdujjat9nx0862jpsg2pqaq',
        topic: 'swap',
    },
    {
        name: 'xPortal Daily Claims',
        url: 'http://localhost/webhook',
        address: [
            'erd1qqqqqqqqqqqqqpgq8pdxqhhnp38qkezf7lcx5qww85zmph708juq48geul', // xPortal: Social Module 1
            'erd1qqqqqqqqqqqqqpgqr7een4m5z44frr3k35yjdjcrfe6703cwdl3s3wkddz', // xPortal: Social Module 2
            'erd1qqqqqqqqqqqqqpgqycdpxfmvxqm3cxylsyff3tkw6yhc6gwga6mqhhv6wn', // xPortal: Social Module 3
            'erd1qqqqqqqqqqqqqpgq0dsmyccxtlkrjvv0czyv2p4kcy72xvt3nzgq8j2q3y', // xPortal: Boost Module 1
            'erd1qqqqqqqqqqqqqpgqeu0tkupaqr64h95jtnk7pnhjnjs4sn9l7y9smjl4n9', // xPortal: Boost Module 2
            'erd1qqqqqqqqqqqqqpgqmksd4gl3xau5eja42sp6qmrxewxgj0ny4d3qfksmrq', // xPortal: Boost Module 3
        ],
        identifier: 'claim',
    },
];
