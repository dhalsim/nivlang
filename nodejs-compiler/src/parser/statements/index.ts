import { TokenKind } from '../../lexer/types';
import { Statement } from '../ast';

import { ParserContext, check, advance } from '../context';

import { parseIfStatement } from './if';
import { parseWhileStatement } from './while';
import { parseAssignment } from './assignment';
import { parseForStatement } from './for';

export const parseStatement = (context: ParserContext): Statement => {
  if (check(context)(TokenKind.If)) {
    advance(context);

    return parseIfStatement(context);
  }

  if (check(context)(TokenKind.While)) {
    advance(context);

    return parseWhileStatement(context);
  }

  if (check(context)(TokenKind.For)) {
    advance(context);

    return parseForStatement(context);
  }

  return parseAssignment(context);
};
