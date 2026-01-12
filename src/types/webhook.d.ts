export type Webhook = {
    name: string;
    url: string;
    address?: string | readonly string[];
    identifier?: string;
    topic?: string;
    enabled?: boolean;
};
