export enum InlineStyleTypes {
  strong = 'strong',
  em = 'em',
  highlight = 'highlight',
  inlineCode = 'inlineCode',
  del = 'del',
  plainText = 'plainText',
  wbr = 'wbr'
}

export enum BlockStyleTypes {
  header = 'header',
  paragragh = 'paragraph',
  quote = 'quote',
  list = 'list',
  li = 'li',
  indentation = 'indentation',
  table = 'table'
}

export type HeaderLevelType = 1 | 2 | 3 | 4 | 5 | 6;

export interface DefaultDataItem {
  key?: string;
  type: BlockStyleTypes | InlineStyleTypes;
  childList: DefaultDataItem[];
  content?: string;
  tableData?: Array<DefaultDataItem[]>;
  listData?: Array<DefaultDataItem[]>;
  imgData?: string;
  headerLevel?: HeaderLevelType;

}
