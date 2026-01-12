export type EventNotifierMessage = {
    type: string,
    data: EventNotifierEvent[],
}

export type EventNotifierEvent = {
    address: string,
    identifier: string,
    topics: string[],
    data: string,
    txHash: string,
}

export type EventNotifierSubscription = {
    address?: string,
    identifier?: string,
    topics?: string[],
}
