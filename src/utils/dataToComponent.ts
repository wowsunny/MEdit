import Del from 'component/Inline/Del';
import Em from 'component/Inline/Em';
import PlainText from 'component/Inline/PlainText';
import Highlight from 'component/Inline/Highlight';
import Strong from 'component/Inline/Strong';
import Wbr from 'component/Inline/Wbr';
import { DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import DefaultComponent from 'component/DefaultComponent';

export function dataToComponent(data: DefaultDataItem, childList: DefaultComponent[] = []) {
  switch (data.type) {
    case InlineStyleTypes.strong:
      return new Strong({ type: InlineStyleTypes.strong, childList });

    case InlineStyleTypes.em:
      return new Em({ type: InlineStyleTypes.em, childList });

    case InlineStyleTypes.highlight:
      return new Highlight({ type: InlineStyleTypes.highlight, childList });

    case InlineStyleTypes.del:
      return new Del({ type: InlineStyleTypes.del, childList });

    case InlineStyleTypes.plainText:
      return new PlainText({ type: InlineStyleTypes.plainText, childList, content: data.content || '' });

    case InlineStyleTypes.wbr:
      return new Wbr({ type: InlineStyleTypes.wbr, childList });

    default:
      throw new Error('unexpected case');
  }
}

export function dataListToComponents(dataList: DefaultDataItem[]) {
  const result: any[] = [];
  dataList.forEach(data => {
    const childList = dataListToComponents(data.childList);
    result.push(dataToComponent(data, childList));
  });
  return result;
}