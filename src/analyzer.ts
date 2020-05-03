import stream from 'stream';
import util from 'util';
import { StaticCodeAnalyzer, Transformers } from '@moneyforward/sca-action-core';

const debug = util.debuglog('coffeelint-action');

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
  constructor(options: string[] = []) {
    super('npx', ['-p', '@coffeelint/cli', 'coffeelint'].concat(options).concat(['--reporter', 'raw']), undefined, 2, undefined, 'CoffeeLint');
  }

  protected async prepare(): Promise<unknown> {
    console.log('::group::Installing packages...');
    try {
      return Promise.resolve();
    } finally {
      console.log('::endgroup::');
    }
  }

  protected createTransformStreams(): Transformers {
    const buffers: Buffer[] = [];
    return [new stream.Transform({
      readableObjectMode: true,
      transform: function (buffer, _encoding, done): void {
        buffers.push(buffer);
        done();
      },
      flush: function (done): void {
        const text = Buffer.concat(buffers).toString();
        try {
          const result: Result = JSON.parse(text);
          Object.entries(result)
          debug(`Detected %d problem(s).`, Object.keys(result).length);
          for (const [filename, errors] of Object.entries(result)) for (const error of errors) this.push({
            file: filename,
            line: error.lineNumber,
            column: undefined,
            severity: error.level === 'warn' ? 'warning' : 'error',
            message: `${error.message}. ${error.context}`,
            code: error.rule
          });
          this.push(null);
          done();
        } catch (error) {
          done(new Error(text));
        }
      }
    })];
  }
}
