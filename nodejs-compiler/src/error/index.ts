import { Location } from '../lexer/types';
import { CompilerError } from './types';

export const createError = (message: string, location?: Location): CompilerError => {
  return new CompilerError(message, location);
};

export { CompilerError };
