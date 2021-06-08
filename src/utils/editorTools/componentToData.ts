import DefaultComponent from 'component/DefaultComponent';
import { DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';

export function componentToData(component: DefaultComponent, childList: DefaultDataItem[]) {
  switch (component.type) {
    case InlineStyleTypes.strong:
      return { type: InlineStyleTypes.strong, childList };
    case InlineStyleTypes.em:
      return { type: InlineStyleTypes.em, childList };
    case InlineStyleTypes.highlight:
      return { type: InlineStyleTypes.highlight, childList };
    case InlineStyleTypes.del:
      return { type: InlineStyleTypes.del, childList };
    case InlineStyleTypes.plainText:
      return { type: InlineStyleTypes.plainText, childList: [], content: (component as any).content };
    case InlineStyleTypes.wbr:
      return { type: InlineStyleTypes.wbr, childList };
    default:
      throw new Error('unexpected case');
  }
}

export function componentsToDataList(components: DefaultComponent[]): DefaultDataItem[] {
  const result: DefaultDataItem[] = [];
  components.forEach(component => {
    const childList = componentsToDataList(component.childList as any);
    result.push(componentToData(component, childList));
  });
  return result;
}