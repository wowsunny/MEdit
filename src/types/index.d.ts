enum BlockComponentTypes {
  codeBlock = 'CODEBLOCK',
  paragragh = 'PARAGRAPH',
  table = 'TABLE'
}

enum fontColor {
  fontRed = 'FONTRED',
  fontGreen = 'FONTGREEN',
  fontOrigin = 'FONTORIGIN',
  fontBlack = 'FONTBLACK',
  fontBlue = 'FONTBLUE'
}

namespace componentStyle {
  interface inlineStyle {
    styleType: string;
    startPosition: number;
    endPosition: number;
  }
  type inlineStyleList = inlineStyle[];
  export interface inlineRenderer {
    content: string;
    startPosition: number;
    endPosition: number;
    styleTypes: string[];
  }

}