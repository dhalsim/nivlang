import { ReturnExpression } from '../ast';
import { ParserContext, createLocation, previous } from '../context';

import { parseExpression } from '../expressions/expression';

export const parseReturnExpression = (context: ParserContext): ReturnExpression => {
  const previousToken = previous(context);

  const expression = parseExpression(context);

  return {
    type: 'ReturnExpression',
    expression,
    location: createLocation(context, previousToken.start, expression.location.end),
  };
};
