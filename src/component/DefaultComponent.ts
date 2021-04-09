import { BlockStyleTypes, InlineStyleTypes } from 'types/ComponentTypes';
import getKey from 'utils/getKey';

export interface DefaultComponentProps {
  type: InlineStyleTypes | BlockStyleTypes;
  childList?: DefaultComponent[];
}
// 行内组件、块状组件、mounted、unmounted通用模板
export default abstract class DefaultComponent {
  public key: string;

  public type: InlineStyleTypes | BlockStyleTypes;

  childList: DefaultComponent[];

  displayMarkdown: boolean = false;

  public mounted: boolean;

  constructor(props: DefaultComponentProps) {
    const { type, childList = [] } = props;
    this.type = type;
    this.key = getKey(this.type);
    this.childList = childList;
    this.displayMarkdown = false;
    this.mounted = false;
  }

  findChildIndex(key: string): number {
    if (!this.childList.length)
      throw new Error(`this ${this.type} has no child, but use findChildIndex`);
    const index = this.childList.findIndex(item => item.key === key);
    if (index < 0) throw new Error(`there is no child which key is ${key}`);
    return index;
  }

  onChildInsertSibling(key: string, siblings: DefaultComponent[], replace: boolean) {
    if (!this.mounted) throw new Error('unmounted component cannot use this function');
    const index = this.findChildIndex(key);
    if (replace) {
      const newList = this.childList.slice();
      newList.splice(index, 1, ...siblings);
      this.setChildList(newList);
    } else {
      const newList = this.childList.slice();
      newList.splice(index + 1, 0, ...siblings);
      this.setChildList(newList);
    }

  }

  setChildList(childList: DefaultComponent[]) {
    throw new Error('do not use this function');
    this.childList = childList;
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }

  public getDataList() {
    this.childList.forEach(child => {
      // eslint-disable-next-line
      child.childList = child.getDataList();
    });
    return this.childList;
  }

  abstract component: Element;

  abstract destroy(): void;

  abstract mountChild(child: DefaultComponent): void;

  abstract appendChild(child: DefaultComponent): void;

  abstract destroyChild(key: string): void;

  abstract clone(childList: DefaultComponent[], content?: string): DefaultComponent; // 包括亲族关系一同复制

  abstract getMarkdown(): string;
}