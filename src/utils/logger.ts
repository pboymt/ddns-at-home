import { Logger as L } from '@kocal/logger';
import { format } from 'date-fns';

export class Logger {

    #logger = L.getLogger(this.name, {
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    });

    constructor(
        private name?: string
    ) {
        this.#logger.format = (ctx, vars) => {
            const date_str = format(ctx.date, 'yyyy-MM-dd HH:mm:ss');
            if (ctx.message === '%') {
                const pre_str = `[${ctx.level.padEnd(5, ' ')}][${date_str}][${ctx.name}]|`;
                const obj_strs = JSON.stringify(vars, null, 2).split('\n');
                const pre_space = '\n'.padEnd(pre_str.length, ' ') + '|';
                const fin_str = pre_str + obj_strs.join(pre_space);
                return ctx.levelColor(fin_str);
            } else {
                return ctx.levelColor(`[${ctx.level.padEnd(5, ' ')}][${date_str}][${ctx.name}]·${ctx.message}`);
            }
        };

    }

    log(message: unknown): void {
        if (typeof message === 'object') {
            this.#logger.log('%', message as Record<string, unknown>);
        } else {
            this.#logger.log(String(message));
        }
    }

    info(message: unknown): void {
        if (typeof message === 'object') {
            this.#logger.info('%', message as Record<string, unknown>);
        } else {
            this.#logger.info(String(message));
        }
    }

    debug(message: unknown): void {
        if (message !== null && typeof message === 'object') {
            this.#logger.debug('%', message as Record<string, unknown>);
        } else {
            this.#logger.debug(String(message));
        }
    }

    warn(message: unknown): void {
        if (message !== null && typeof message === 'object') {
            this.#logger.warn('%', message as Record<string, unknown>);
        } else {
            this.#logger.warn(String(message));
        }
    }

    error(message: unknown): void {
        if (message !== null && typeof message === 'object') {
            this.#logger.error('%', message as Record<string, unknown>);
        } else {
            this.#logger.error(String(message));
        }
    }

}

export const logger = new Logger('DDNS');