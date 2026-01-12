import { ILogObj, Logger } from 'tslog';

export const log: Logger<ILogObj> = new Logger({
    minLevel: 0,
    prettyLogTemplate: '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t',
});
