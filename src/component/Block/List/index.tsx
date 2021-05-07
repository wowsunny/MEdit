import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import PlainText from 'component/Inline/PlainText';
import * as React from 'react';
import { RefObject } from 'react';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { dataListToComponents } from 'utils/dataToComponent';
import FocusManager from 'utils/FocusManager';
import dndWrapper from '../dndWrapper';
import EditableBlock from '../EditableBlock';
import { defaultBlockProps } from '../types';
import './style.scss';

export class LiComponent extends EditableBlock {
  constructor(props: DefaultComponentProps) {
    super({ ...props, component: document.createElement('p') });
    this.refresh();
  }

  public refresh() {
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }

  public clone(childList: DefaultComponent[] = []) {
    throw new Error('unmounted component cannot use this function');
    const result = new LiComponent({ type: BlockStyleTypes.li, childList });
    result.mount({
      handleInsertSiblings: this.blockMountProps!.handleInsertSiblings,
      handleEnter: this.blockMountProps!.handleEnter,
      handleTab: this.blockMountProps!.handleTab,
      handleDestroy: this.blockMountProps!.handleDestroy
    });
    return result;
  }

  static createDefault = () => {
    const plainText = new PlainText({ type: InlineStyleTypes.plainText, content: '' });
    const li = new LiComponent({ type: BlockStyleTypes.li });
    li.appendChild(plainText);
    return li;
  };

}

export interface ListProps extends defaultBlockProps {
  listData?: Array<DefaultDataItem[]>;
  [propName: string]: any;
}

class List extends React.Component<ListProps> {
  public key: string;

  ref: RefObject<HTMLUListElement> | RefObject<HTMLOListElement>;

  listData: Array<DefaultDataItem[]>;

  childList: LiComponent[];

  constructor(props: ListProps) {
    super(props);
    console.log(props);
    const { id, listData } = props;
    this.key = id;
    this.ref = React.createRef();
    this.listData = listData || [];
    this.childList = [];
    this.constructChildList = this.constructChildList.bind(this);
  }

  componentDidMount() {
    console.log(this.listData, this.childList);
    this.constructChildList();
  }

  componentDidUpdate() {
  }


  public getDataList() {
    return this.childList.map(child => {
      return child.getDataList();
    });
  }

  // DOM -> listData
  private getListData() {
    this.listData = this.childList.map(child => {
      return child.getDataList();
    });
    return this.listData;
  }

  findChildIndex(key: string): number {
    if (!this.childList.length)
      throw new Error('this component has no child, but use findChildIndex');
    const index = this.childList.findIndex(item => item.key === key);
    if (index < 0) throw new Error(`there is no child which key is ${key}`);
    return index;
  }

  // listData -> childList -> DOM
  private constructChildList() {
    this.listData = this.listData.length ? this.listData : [[{ type: InlineStyleTypes.plainText, content: '', childList: [] }]];
    const { mountValues } = this.props;
    const { focusManager, handleTab, handleInsertSiblings, handleDestroy } = mountValues;

    const onChildAddListItem = (key: string, data: DefaultDataItem[]) => {
      const index = this.findChildIndex(key);
      this.getListData();
      this.listData.splice(index + 1, 0, data);
      this.constructChildList();
    };

    const onEnter = (key: string, nextChildren: DefaultDataItem[]) => {
      onChildAddListItem(key, nextChildren);
    };

    const onTab = (key: string, isInside: boolean) => {
      handleTab(this.key, isInside);
    };

    const onDestroy = (index: number) => {
      this.listData.splice(index, 1);
      if (!this.listData.length) {
        handleDestroy(this.key);
        return;
      }
      this.constructChildList();
      this.refresh();
    };

    const onInsertSibling = (sibling: DefaultDataItem, replace: boolean) => {
      handleInsertSiblings(this.key, [sibling], replace);
    };

    this.childList = [];
    this.listData.forEach((data, index) => {
      const childTarget = new LiComponent({ type: BlockStyleTypes.li, childList: dataListToComponents(data) });
      this.childList.push(childTarget);
      childTarget.mount({ handleInsertSiblings: onInsertSibling, handleEnter: onEnter, handleTab: onTab, handleDestroy: () => onDestroy(index) });
      focusManager.register(this.key, childTarget.detectAnchor);
      this.refresh();
    });
  }

  // childList -> DOM
  private refresh() {
    (this.ref.current as any).innerHTML = '';
    this.childList.forEach(child => {
      const li = document.createElement('li');
      li.appendChild(child.component);
      this.ref.current?.appendChild(li);
    });
  }

  render() {
    const {
      isDragging, connectDragSource, connectDragPreview, connectDropTarget
    } = this.props;
    return connectDropTarget(
      connectDragPreview(
        <div className='blockWrapper'>
          {connectDragSource(<div className='dragIcon'>::</div>)}
          <div className='list'>
            <ul ref={this.ref} style={{ opacity: isDragging ? 0.5 : 1 }} dangerouslySetInnerHTML={{ __html: '' }} />
          </div>
        </div>
      )
    );
  }
}

export default dndWrapper<ListProps>(List);
