import { expect } from 'chai';
import stream from 'stream';
import { Transformers } from '@moneyforward/sca-action-core';
import Analyzer, { Result } from '../src/analyzer'
import { AssertionError } from 'assert';

describe('Transform', () => {
  it('should return the problem object', async () => {
    const expected = {
      file: 'foo/bar.coffee',
      line: 3,
      column: undefined,
      severity: 'error',
      message: 'Line exceeds maximum allowed length. Length is 104, max is 80',
      code: 'max_line_length'
    };
    const result: Result = {
      'foo/bar.coffee': [{
        rule: 'max_line_length',
        lineNumber: 3,
        level: 'error',
        message: 'Line exceeds maximum allowed length',
        context: 'Length is 104, max is 80'
      }]
    }
    const text = JSON.stringify(result);
    const analyzer = new (class extends Analyzer {
      public constructor() {
        super();
      }
      public createTransformStreams(): Transformers {
        return super.createTransformStreams();
      }
    })();
    const [prev, next = prev] = analyzer.createTransformStreams();
    stream.Readable.from(text).pipe(prev).pipe(next);
    for await (const problem of next) {
      expect(problem).to.deep.equal(expected);
      return;
    }
    throw new AssertionError({ message: 'There was no problem to expect.', expected });
  });
});
