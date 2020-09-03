declare module 'timexe' {

    interface TimexeAddResult {
        result: 'ok' | null
        error: unknown
        id: number
    }

    interface TimexeRemoveResult {
        result: 'ok' | null
        error: unknown
    }

    function timexe(rule: string, callback: () => unknown, parameterToCallback?: unknown): TimexeAddResult;

    namespace timexe {

        export function timeResolution(integer: number): void;

        export function maxTimerDelay(integer: number): void;

        export function remove(id: number): TimexeRemoveResult;

    }

    export = timexe;

}