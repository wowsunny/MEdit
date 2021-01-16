import * as React from 'react';
import { InlineStyleManager } from './inlineStyleManager';

export interface ParagraphProps {
  content?: string;
  styleList?: componentStyle.inlineStyleList;
}

const Paragraph: React.FC<ParagraphProps> = (props) => {
  const { content: propContent = '', styleList = [] as componentStyle.inlineStyleList } = props;
  const [content, setContent] = React.useState(propContent);
  const [inlineStyleList, setInlineStyleList] = React.useState(styleList);
  let styleManager;
  // TODO 确认是否需要inlineStyleList.toString()
  React.useEffect(() => {
    styleManager = new InlineStyleManager(content, styleList);
  }, [content, inlineStyleList]);
  return (
    <div></div>
  );
}

export default Paragraph;