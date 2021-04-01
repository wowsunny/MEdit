import React from 'react';
import { pick } from 'lodash';
import { DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import * as markdown from './simple-markdown';

const { defaultRules } = markdown;
const rules: markdown.ParserRules = {
  ...pick(defaultRules,
    [
      'Array', 'del', 'em', 'inlineCode', 'paragraph', 'strong', 'text', 'wbr', 'highlight', 'whiteSpace'
    ]),
  whiteSpace: {
    order: 14,
    match: markdown.inlineRegex(/^(&nbsp;)/g) as any,
    parse(capture: any, parse: any, state: any) {
      return {
        content: parse(capture[1])
      };
    },
    react(node: any, output, state) {
      return node.content;
    },
    html(node: any, output, state) {
      return ' ';
    }
  },
  wbr: {
    order: 4 as any,
    match: markdown.inlineRegex(/^(<wbr>)/g) as any,
    quality(capture: any) {
      // precedence by length, wins ties vs `u`:
      return capture[0].length + 0.1;
    },
    parse(capture: any, parse: any, state: any) {
      return {
        content: parse(capture[1], state)
      };
    },
    react(node, output, state) {
      return React.createElement('wbr');
    },
    html(node, output, state) {
      return '<wbr>';
    }
  },
  highlight: {
    order: 4 as any,
    match: markdown.inlineRegex(/==(.+)==/) as any,
    parse(capture: any, parse: any, state: any) {
      return {
        content: parse(capture[1])
      };
    },
    react(node, output, state) {
      return React.createElement('mark');
    },
    html(node, output, state) {
      return `<mark>${output}</mark>`;
    }
  }
};

const parser = markdown.parserFor(rules);
function getASTNode(content: string): markdown.ASTNode {
  const escapeMap: any = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    // '&nbsp;': ' '
  };
  return markdown.parseBlock(parser, content.replace(/&lt;|&gt;|&amp;/g, (chr: string) => escapeMap[chr] as string), {});
}
export function getDataList(content: string) {
  let ast: markdown.ASTNode = getASTNode(content);
  if (ast instanceof Array && ast[0].type === 'paragraph') ast = ast[0];
  else throw new Error(`unexpected case: ${ast}`);
  const astToDataList = (_ast: markdown.SingleASTNode) => {
    const result: DefaultDataItem[] = [];
    const push = (data: DefaultDataItem) => {
      const pre = result[result.length - 1];
      if (pre?.type === data.type && pre.type === InlineStyleTypes.plainText) {
        pre.content = `${pre.content}${data.content}`;
      } else {
        result.push(data);
      }
    };
    _ast.content instanceof Array && _ast.content.forEach((item: markdown.SingleASTNode) => {
      const childList = astToDataList(item);
      switch (item.type) {
        case 'del':
          push({ type: InlineStyleTypes.del, childList });
          break;
        case 'em':
          push({ type: InlineStyleTypes.em, childList });
          break;
        case 'inlineCode':
          push({ type: InlineStyleTypes.inlineCode, childList });
          break;
        case 'strong':
          push({ type: InlineStyleTypes.strong, childList });
          break;
        case 'text':
          push({ type: InlineStyleTypes.plainText, childList: [], content: item.content });
          break;
        case 'wbr':
          push({ type: InlineStyleTypes.wbr, childList: [] });
          break;
        case 'highlight':
          push({ type: InlineStyleTypes.highlight, childList });
          break;
        case 'whiteSpace':
          push({ type: InlineStyleTypes.plainText, childList: [], content: '\u00A0' });
          break;

        default:
          throw new Error(`unexpected case: ${item.type}`);
      }
    });

    return result;
  };
  return astToDataList(ast);
}
export function getHTML(content: string): string {
  return markdown.defaultHtmlOutput(getASTNode(content));
}
