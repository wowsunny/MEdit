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
import FocusManager from 'utils/FocusManager';
import BlockComponent, { BlockMountProps } from '../BlockComponent';
import EventManager from './EventManager';

export class ParagraphComponent extends BlockComponent {
  public component: Element;

  oneStepToDelete: boolean;

  constructor(props: DefaultComponentProps) {
    super(props);
    this.oneStepToDelete = false;
    this.component = document.createElement('p');
    this.component.setAttribute('contenteditable', 'true');
    this.InitEventManager();
    this.refresh();
    this.eventBus.subscribe(BusEventTypes.insertSiblingParagraph, this.key, (values?: { dataList?: DefaultDataItem[] }) => {
      const { dataList = [] } = values || {};
      this.blockMountProps!.handleInsertSiblings({ type: BlockStyleTypes.paragragh, childList: dataList }, false);
    });
  }

  // component -> childList, 也是原子操作
  private format() {
    const childNodes = this.component.childNodes;
    let childIndex = 0;

    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if (child !== this.childList[childIndex]?.component) {
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
      this.oneStepToDelete = false;
      this.eventBus.dispatch(BusEventTypes.findEnterAnchor);
    };

    // 为了在paragraph为空时监听delelte，设置了input和keydown两个监听器
    const handleDelete = (isKeyDown: boolean) => {
      if (isKeyDown) {
        if (this.oneStepToDelete) {
          this.destroy();
        }
        return;
      }
      this.eventBus.dispatch(BusEventTypes.deleteEmpty);
      // this.eventBus.dispatch(BusEventTypes.recordAnchor, {}, true);
      // this.parseAnchor();
      // console.log('after parseAnchor , the component: ', this.component.innerHTML);
      if (!this.childList.length) {
        console.log('handle empty paragraph~~');
        if (this.oneStepToDelete) {
          this.destroy();
        } else {
          this.oneStepToDelete = true;
        }
      }
    };

    // 消除零宽空格
    const removeNoWidthSpace = () => {
      const func = (node: Node) => {
        if (node instanceof Text && node.textContent?.match(/\u200B/u)) {
          const content = node.textContent;
          if (content === '\u200B') {
            node.remove();
          }
          return;
        }
        node.childNodes.forEach(child => func(child));
      };
      func(this.component);
    };

    const BlockTrans = (md: string) => {
      if (md.replace('<wbr>', '') === '-&nbsp;') {
        this.blockMountProps!.handleInsertSiblings({ type: BlockStyleTypes.list, childList: [] }, true);
        return true;
      }
      return false;
    };

    // 核心逻辑
    const handleReParse = () => {
      this.oneStepToDelete = false;
      removeNoWidthSpace();
      this.eventBus.dispatch(BusEventTypes.recordAnchor, {}, true, () => {
        const wbr = new Wbr({ type: InlineStyleTypes.wbr, childList: [] });
        this.mountChild(wbr);
        this.childList.push(wbr);
        this.component.appendChild(wbr.component);
      });
      this.format();
      const md = this.getMarkdown().replace('\u200B', '');
      console.log('md: ', md);

      if (BlockTrans(md)) return;

      const dataList = getDataList(md);
      // console.log('dataList: ', dataList);
      this.setChildList(dataList);
      this.parseAnchor();
      // console.log('after parseAnchor , the component: ', this.component.innerHTML);
      this.eventBus.dispatch(BusEventTypes.showMarkdown, { show: true });
    };

    const handleTab = (isInside: boolean) => {
      if (!this.mounted) throw new Error('unmounted component cannot use this function');
      this.blockMountProps!.handleTab(this.key, isInside);
    };

    const em = new EventManager({ target: this.component, handleEnter, handleDelete, handleReParse, handleTab });
  }

  // 原子操作，不涉及setChildList
  public destroyChild(key: string) {
    console.log('destroy: ', key);
    const index = this.findChildIndex(key);
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
    _cur && curDataList.push(_cur);
    _next && nextDataList.unshift(_next);
    this.setChildList(curDataList);
    this.blockMountProps!.handleEnter(this.key, nextDataList);
  }

  private onChildDestroy(key: string) {
    console.log('the key to destroy: ', key);
    const index = this.childList.findIndex(child => child.key === key);
    const newList = this.childList.slice();
    newList.splice(index, 1);
    this.setChildList(newList);

    // this.component.removeChild(this.component.childNodes[index]);
  }

  public mount(props: BlockMountProps) {
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
    result.mount({
      handleInsertSiblings: this.blockMountProps!.handleInsertSiblings,
      handleEnter: this.blockMountProps!.handleEnter,
      handleTab: this.blockMountProps!.handleTab,
      handleDestroy: this.blockMountProps!.handleDestroy
    });
    return result;
  }

  public setAnchor(offset: number) {
    const selection = document.getSelection();
    if (offset === 0) {
      selection?.collapse(this.component, 0);
    } else if (offset === -1) {
      selection?.collapse(this.component);
    }
  }

  public getPosition = (): [number, number] => {
    return [this.component.clientTop, this.component.clientHeight + this.component.clientTop];
  };

  public detectAnchor = (): boolean => {
    const selection = document.getSelection();
    if (this.component.contains(selection?.anchorNode || null)) {
      if (!this.showMarkdown) {
        this.showMarkdown = true;
        this.eventBus.dispatch(BusEventTypes.showMarkdown, { show: true });
      }
      return true;
    }
    // eslint-disable-next-line
    else {
      if (this.showMarkdown) {
        this.showMarkdown = false;
        this.eventBus.dispatch(BusEventTypes.showMarkdown, { show: false });
      }
      return false;
    }
  };

}

export interface State {

}

export interface ParagraphProps {
  id: string;
  childList: DefaultDataItem[];
  focusManager: FocusManager;
  handleTab: (key: string, isInside: boolean) => void,
  handleInsertSiblings: (key: string, childList: DefaultDataItem[], replace: boolean) => void;
  handleDestroy: (key: string) => void;
}

class Paragraph extends React.Component<ParagraphProps, State> {
  target: ParagraphComponent;

  ref: RefObject<HTMLDivElement>;

  key: string;

  constructor(props: ParagraphProps) {
    super(props);
    this.ref = React.createRef();
    const { handleTab, handleInsertSiblings, handleDestroy, focusManager, childList, id } = props;
    this.key = id;
    const onParagraphInsertSibling = (sibling: DefaultDataItem, replace: boolean) => {
      handleInsertSiblings(this.key, [sibling], replace);
    };

    const onEnter = (key: string, nextChildren: DefaultDataItem[]) => {
      handleInsertSiblings(this.key, [{ type: BlockStyleTypes.paragragh, childList: nextChildren }], false);
    };

    const onTab = (key: string, isInside: boolean) => {
      handleTab(this.key, isInside);
    };

    const onDestroy = () => {
      handleDestroy(this.key);
    };

    this.target = new ParagraphComponent({
      type: BlockStyleTypes.paragragh, childList: dataListToComponents(childList)
    });
    this.target.mount({ handleInsertSiblings: onParagraphInsertSibling, handleEnter: onEnter, handleTab: onTab, handleDestroy: onDestroy });
    focusManager.register(this.key, this.target.getPosition, this.target.detectAnchor);
  }

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate() {
    this.refresh();
  }

  public getDataList() {
    return this.target.getDataList();
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
  console.log('==========diff start');
  console.log(' -- root.innerHTML: ', root.component.innerHTML);
  console.log(' -- root.childList: ');
  root.childList.forEach(child => {
    console.log(child.type, (child as PlainText).content);
    if (child.childList.length) {
      child.childList.forEach(c => console.log(c.type, (c as PlainText).content));
    }
  });
  console.log(' -- DataTree: ', DataTree.length, DataTree);
  const componentTree = root.childList;
  let lastIndex = 0;
  let resultList: Array<number> = [];
  DataTree.forEach((item: DefaultDataItem | DefaultComponent) => {
    let flag = false;
    for (let i = lastIndex; i < componentTree.length; i++) {
      if (item.type === componentTree[i].type) {
        if (item.type === InlineStyleTypes.plainText) {
          (componentTree[i] as PlainText).setContent(item instanceof DefaultComponent ? (item as PlainText).content : item.content || '');
        } else if (componentTree[i].childList.length || item.childList.length) {
          diff(componentTree[i], item.childList);
        }
        resultList.push(i);
        lastIndex = i + 1;
        flag = true;
        break;
      }
    }
    if (!flag) {
      console.log('insert new component: ', item);
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
  resultList.push(Math.max(componentTree.length, DataTree.length));
  resultList = resultList.reverse();
  resultList.push(-1);
  resultList.reduce((pre: number, cur: number): number => {
    if (pre - cur > 1) {
      for (let i = pre - 1; i > cur; i--) {
        console.log('destroy: ', i, componentTree[i]);
        if (componentTree[i]) {
          root.destroyChild(componentTree[i].key);
        }
      }
    }
    return cur;
  });
  console.log('==========diff end');
  return root;

}