import { BlockStyleTypes, InlineStyleTypes } from 'types/ComponentTypes';
import getKey from 'utils/editorTools/getKey';

export interface DefaultComponentProps {
  type: InlineStyleTypes | BlockStyleTypes;
  childList?: DefaultComponent[];
}
// 行内组件、块状组件、mounted、unmounted通用模板
export default abstract class DefaultComponent {
  public key: string;

  public type: InlineStyleTypes | BlockStyleTypes;

  public mounted: boolean;

  childList: DefaultComponent[];

  showMarkdown: boolean = false;

  constructor(props: DefaultComponentProps) {
    const { type, childList = [] } = props;
    this.type = type;
    this.key = getKey(this.type);
    this.mounted = false;
    this.childList = childList;
    this.showMarkdown = false;
  }

  findChildIndex(key: string): number {
    if (!this.childList.length)
      throw new Error(`this ${this.type} has no child, but use findChildIndex`);
    const index = this.childList.findIndex(item => item.key === key);
    if (index < 0) throw new Error(`there is no child which key is ${key}`);
    return index;
  }


  public getDataList() {
    this.childList.forEach(child => {
      // eslint-disable-next-line
      child.childList = child.getDataList();
    });
    return this.childList;
  }

  abstract component: Element;

  abstract getMarkdown(): string;

  abstract mountChild(child: DefaultComponent): void;
  
  abstract destroyChild(key: string): void;
  
  abstract destroy(): void;

}