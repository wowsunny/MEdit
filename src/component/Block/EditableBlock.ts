import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import InlineComponent from 'component/Inline/InlineComponent';
import PlainText from 'component/Inline/PlainText';
import Wbr from 'component/Inline/Wbr';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { componentsToDataList } from 'utils/componentToData';
import { dataListToComponents } from 'utils/dataToComponent';
import { getDataList } from 'utils/markdown';
import EventBus, { BusEventTypes } from '../EventBus';
import EventManager from './Paragraph/EventManager';

export interface BlockMountProps {
  handleInsertSiblings: (components: DefaultDataItem, replace: boolean) => void;
  handleEnter: (key: string, nextChildren: DefaultDataItem[]) => void;
  handleTab: (key: string, isInside: boolean) => void;
  handleDestroy: () => void;
}

export default abstract class EditableBlock extends DefaultComponent {
  public eventBus: EventBus;

  public component: Element;

  blockMountProps?: BlockMountProps;

  oneStepToDelete: boolean;

  constructor(props: DefaultComponentProps & { component: Element }) {
    super(props);
    const { component } = props;
    this.component = component;
    this.component.setAttribute('contenteditable', 'true');
    this.eventBus = new EventBus();
    this.oneStepToDelete = false;
    this.eventBus.subscribe(BusEventTypes.insertSibling, this.key, (values?: { dataList?: DefaultDataItem[] }) => {
      const { dataList = [] } = values || {};
      switch (this.type) {
        case BlockStyleTypes.paragragh:
          this.blockMountProps!.handleInsertSiblings({ type: BlockStyleTypes.paragragh, childList: dataList }, false);
          break;
        case BlockStyleTypes.li:
          this.blockMountProps!.handleEnter(this.key, []);
          break;

        default:
          break;
      }
    });
    this.InitEventManager();
    this.refresh();
  }

  public InitEventManager() {
    const handleEnter = () => {
      this.oneStepToDelete = false;
      this.eventBus.dispatch(BusEventTypes.findEnterAnchor);
    };

    const handleCtrlEnter = () => {
      this.oneStepToDelete = false;
      this.blockMountProps?.handleInsertSiblings({ type: BlockStyleTypes.paragragh, childList: [] }, false);
    };

    // component -> childList, 也是原子操作
    const format = () => {
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
      format();
      const md = this.getMarkdown().replace('\u200B', '');
      console.log('md: ', md);

      if (this.type === BlockStyleTypes.paragragh && BlockTrans(md)) return;

      const dataList = getDataList(md);
      // console.log('dataList: ', dataList);
      this.setChildList(dataList);
      this.eventBus.dispatch(BusEventTypes.parseAnchor, {}, true);
      // console.log('after parseAnchor , the component: ', this.component.innerHTML);
      this.eventBus.dispatch(BusEventTypes.showMarkdown, { show: true });
    };

    const handleTab = (isInside: boolean) => {
      if (!this.mounted) throw new Error('unmounted component cannot use this function');
      this.blockMountProps!.handleTab(this.key, isInside);
    };

    const em = new EventManager({ target: this.component, handleEnter, handleCtrlEnter, handleDelete, handleReParse, handleTab });
  }

  public getMarkdown() {
    return this.childList.reduce((pre, cur) => {
      return pre + cur.getMarkdown();
    }, '');
  }

  public getPosition = (): [number, number] => {
    return [this.component.clientTop, this.component.clientHeight + this.component.clientTop];
  };

  public onChildInsertSibling = (key: string, siblings: DefaultComponent[], replace: boolean) => {
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

  public appendChild(child: InlineComponent) {
    this.setChildList([...this.childList, child]);
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

  public destroy = () => {
    this.blockMountProps?.handleDestroy();
  };

  // childList -> component
  public setChildList(childList: DefaultComponent[] | DefaultDataItem[]) {
    diff(this, childList);
  }

  public setAnchor(offset: number) {
    const selection = document.getSelection();
    if (offset === 0) {
      selection?.collapse(this.component, 0);
    } else if (offset === -1) {
      selection?.collapse(this.component);
    }
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

  public mountChild(child: InlineComponent) {
    const that = this;
    child.mount({
      eventBus: this.eventBus,
      handleEnter: this.onChildEnter.bind(that),
      handleDestroy: this.onChildDestroy.bind(that),
      handleInsertSibling: this.onChildInsertSibling.bind(that)
    });
  }

  public mount(props: BlockMountProps) {
    this.mounted = true;
    this.blockMountProps = props;
    this.childList.forEach(child => {
      this.mountChild(child as InlineComponent);
    });
  }

  abstract refresh(): void;

}

// 针对inlineComponent的diff算法
export function diff(root: DefaultComponent, DataTree: (DefaultDataItem | DefaultComponent)[]): DefaultComponent {
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