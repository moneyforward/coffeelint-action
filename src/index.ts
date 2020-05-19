import stream from 'stream';
import util from 'util';
import StaticCodeAnalyzer, { AnalyzerConstructorParameter } from '@moneyforward/sca-action-core';
import { transform } from '@moneyforward/stream-util';

const debug = util.debuglog('@moneyforward/code-review-action-coffeelint-plugin');

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
  constructor(...args: AnalyzerConstructorParameter[]) {
    super('npx', ['-p', '@coffeelint/cli', 'coffeelint'].concat(args.map(String)).concat(['--reporter', 'raw']), undefined, 2, undefined, 'CoffeeLint');
  }

  protected prepare(): Promise<void> {
    return Promise.resolve();
  }

  protected createTransformStreams(): stream.Transform[] {
    return [
      new transform.JSON(),
      new stream.Transform({
        objectMode: true,
        transform: function (result: Result, encoding, done): void {
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
        }
      })
    ];
  }
}
