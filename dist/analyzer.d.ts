import { StaticCodeAnalyzer, Transformers } from '@moneyforward/sca-action-core';
export interface Result {
    [path: string]: {
        rule: string;
        lineNumber: number;
        level: 'error' | 'warn';
        message: string;
        context: string;
    }[];
}
export default class Analyzer extends StaticCodeAnalyzer {
    constructor(options?: string[]);
    protected prepare(): Promise<unknown>;
    protected createTransformStreams(): Transformers;
}
