import { expect } from 'chai';
import stream from 'stream';
import Analyzer, { Result } from '../src'
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
      public createTransformStreams(): stream.Transform[] {
        return super.createTransformStreams();
      }
    })();
    const transform = analyzer.createTransformStreams()
      .reduce((previous, current) => previous.pipe(current), stream.Readable.from(text));
    for await (const problem of transform) return expect(problem).to.deep.equal(expected);
    throw new AssertionError({ message: 'There was no problem to expect.', expected });
  });
});
