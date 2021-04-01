import React, { Ref, RefObject } from 'react';
import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import InlineComponent from 'component/Inline/InlineComponent';
import PlainText from 'component/Inline/PlainText';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { componentsToDataList } from 'utils/componentToData';
import { dataListToComponents, dataToComponent } from 'utils/dataToComponent';
import { getDataList } from 'utils/markdown';
import { BusEventTypes } from 'component/EventBus';
import Wbr from 'component/Inline/Wbr';
import BlockComponent, { BlockMountProps } from '../BlockComponent';
import EventManager from './EventManager';

interface ParagraphMountProps extends BlockMountProps {
  handleEnter: (next: DefaultDataItem) => void;
}

export class ParagraphComponent extends BlockComponent {
  public component: Element;

  constructor(props: DefaultComponentProps) {
    super(props);
    this.component = document.createElement('p');
    this.component.setAttribute('contenteditable', 'true');
    this.InitEventManager();
    this.refresh();
  }

  // component -> childList, 也是原子操作
  private format() {
    const childNodes = this.component.childNodes;
    let childIndex = 0;
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if (child instanceof Text) {
        const newChild = new PlainText({ type: InlineStyleTypes.plainText, childList: [], content: child.textContent || '' });
        this.mountChild(newChild);
        this.component.insertBefore(newChild.component, child);
        this.component.removeChild(child);
        this.childList.splice(childIndex, 0, newChild);
      }
      childIndex += 1;
    }
  }

  // childList -> component
  public setChildList(childList: DefaultComponent[] | DefaultDataItem[]) {
    diff(this, childList);
  }

  private InitEventManager() {
    const handleEnter = () => {
      this.eventBus.dispatch(BusEventTypes.findEnterAnchor);
    };
    // TODO finish it
    const handleDelete = () => {
      const selection = document.getSelection();
      this.eventBus.dispatch(BusEventTypes.recordAnchor, {}, true);
      this.eventBus.dispatch(BusEventTypes.deleteEmpty);
      this.parseAnchor();
    };

    // TODO 为了优化性能，可以使用diff 算法
    const handleReParse = () => {
      this.eventBus.dispatch(BusEventTypes.recordAnchor, {}, true, () => {
        const wbr = new Wbr({ type: InlineStyleTypes.wbr, childList: [] });
        this.mountChild(wbr);
        this.childList.push(wbr);
        this.component.appendChild(wbr.component);
      });
      this.format();
      const md = this.getMarkdown();
      const dataList = getDataList(md);
      console.log('dataList: ', dataList);
      // console.log('component: ', this.childList);
      // console.log(this.eventBus.getKeysOnType(BusEventTypes.parseAnchor));
      this.setChildList(dataList);
      this.parseAnchor();
    };
    const em = new EventManager({ target: this.component, handleEnter, handleDelete, handleReParse });
  }

  // 原子操作，不涉及setChildList
  public destroyChild(key: string) {
    console.log('destroy: ', key);
    const index = this.findChildIndex(key);
    console.log(key, this.childList[index]);
    this.childList.splice(index, 1);
    this.eventBus.remove(key);
    const childNode = this.component.childNodes[index];
    if (childNode && this.component.contains(childNode))
      this.component.removeChild(this.component.childNodes[index]);
  }

  private parseAnchor() {
    this.eventBus.dispatch(BusEventTypes.parseAnchor, {}, true);

  }

  public getMarkdown() {
    return this.childList.reduce((pre, cur) => {
      return pre + cur.getMarkdown();
    }, '');
  }

  private refresh() {
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }

  private onChildEnter(key: string, _cur?: DefaultDataItem, _next?: DefaultDataItem) {
    if (!this.mounted) throw new Error('unmounted component cannot use this function');
    const index = this.findChildIndex(key);
    const curDataList = componentsToDataList(this.childList.slice(0, index) as InlineComponent[]);
    const nextDataList = componentsToDataList(this.childList.slice(index + 1) as InlineComponent[]);
    (_cur?.childList.length || _cur?.content?.length) && curDataList.push(_cur);
    (_next?.childList.length || _next?.content?.length) && nextDataList.unshift(_next);
    const cur = curDataList.length ? { type: BlockStyleTypes.paragragh, childList: curDataList } : undefined;
    const next = nextDataList.length ? { type: BlockStyleTypes.paragragh, childList: nextDataList } : undefined;
    this.blockMountProps!.handleEnter(this.key, cur, next);
  }

  private onChildDestroy(key: string) {
    const index = this.childList.findIndex(child => child.key === key);
    const newList = this.childList.slice();
    newList.splice(index, 1);
    if (!this.childList.length) {
      this.destroy();
      return;
    }
    this.setChildList(newList);
    // this.component.removeChild(this.component.childNodes[index]);
  }

  public mount(props: ParagraphMountProps) {
    this.mounted = true;
    this.blockMountProps = props;
    this.childList.forEach(child => {
      this.mountChild(child as InlineComponent);
    });
  }

  public mountChild(child: InlineComponent) {
    const that = this;
    child.mount({
      eventBus: this.eventBus,
      handleEnter: this.onChildEnter.bind(that),
      handleDestroy: this.onChildDestroy.bind(that),
      handleInsertSibling: this.onChildInsertSibling.bind(that)
    });
  }

  public appendChild(child: InlineComponent) {
    this.setChildList([...this.childList, child]);
  }

  static createDefault = () => {
    const plainText = new PlainText({ type: InlineStyleTypes.plainText, content: '' });
    const paragragh = new ParagraphComponent({ type: BlockStyleTypes.paragragh });
    paragragh.appendChild(plainText);
    return paragragh;
  };

  public clone(childList: DefaultComponent[] = []) {
    if (!this.mounted) throw new Error('unmounted component cannot use this function');
    const result = new ParagraphComponent({ type: BlockStyleTypes.paragragh, childList });
    result.mount({ handleInsertSiblings: this.blockMountProps!.handleInsertSiblings, handleEnter: this.blockMountProps!.handleEnter });
    return result;
  }

}

export interface State {

}

export interface ParagraphProps {
  childList: DefaultDataItem[]
  handleInsertSiblings: (key: string, childList: DefaultDataItem[], replace: boolean) => void;
}

class Paragraph extends React.Component<ParagraphProps, State> {
  target: ParagraphComponent;

  ref: RefObject<HTMLDivElement>;

  constructor(props: ParagraphProps) {
    super(props);
    this.ref = React.createRef();
    const { handleInsertSiblings, childList } = props;

    const onParagraphInsertSibling = (sibling: DefaultDataItem, replace: boolean) => {
      handleInsertSiblings(this.getKey(), [sibling], replace);
    };

    const onEnter = (next: DefaultDataItem) => {
      handleInsertSiblings(this.getKey(), [{ type: BlockStyleTypes.paragragh, childList: [next] }], false);
    };

    this.target = new ParagraphComponent({
      type: BlockStyleTypes.paragragh, childList: dataListToComponents(childList)
    });
    this.target.mount({ handleInsertSiblings: onParagraphInsertSibling, handleEnter: onEnter });

  }


  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate() {
    this.refresh();
  }

  public getKey() {
    return this.target.key;
  }

  private refresh() {
    this.ref.current!.appendChild(this.target.component);
  }

  render() {
    return (
      <div className='paragraph' ref={this.ref} dangerouslySetInnerHTML={{ __html: '' }} />
    );
  }
}

export default Paragraph;

// 针对inlineComponent的diff算法
function diff(root: DefaultComponent, DataTree: (DefaultDataItem | DefaultComponent)[]): DefaultComponent {
  const componentTree = root.childList;
  let lastIndex = 0;
  const resultList: Array<number> = [];
  DataTree.forEach((item: DefaultDataItem | DefaultComponent) => {
    let flag = false;
    for (let i = lastIndex; i < componentTree.length; i++) {
      if (item.type === componentTree[i].type) {
        if (item.type === InlineStyleTypes.plainText) {
          (componentTree[i] as PlainText).setContent(item instanceof DefaultComponent ? (item as PlainText).content : item.content || '');
        } else {
          diff(componentTree[i], item.childList);
        }
        resultList.push(i);
        lastIndex = i + 1;
        flag = true;
        break;
      }
    }
    if (!flag) {
      if (item instanceof DefaultComponent) {
        root.mountChild(item);
        componentTree.splice(lastIndex, 0, item as DefaultComponent);
        root.component.insertBefore(item.component, root.component.childNodes[lastIndex]);
        resultList.push(lastIndex);
        lastIndex += 1;
      } else {
        const component: InlineComponent = dataListToComponents([item])[0];
        root.mountChild(component);
        componentTree.splice(lastIndex, 0, component);
        root.component.insertBefore(component.component, root.component.childNodes[lastIndex]);
        resultList.push(lastIndex);
        lastIndex += 1;
      }
    }
  });
  resultList.push(componentTree.length);
  console.log(resultList, root.childList);
  resultList.reduce((pre: number, cur: number): number => {
    if (cur - pre > 1) {
      for (let i = pre + 1; i < cur; i++) {
        root.destroyChild(componentTree[i].key);
      }
    }
    return cur;
  }, -1);
  return root;

}