import { Location } from '../lexer/types';

export class CompilerError extends Error {
  constructor(
    message: string,
    public location?: Location
  ) {
    super(message);
    this.name = 'CompilerError';
  }
}
