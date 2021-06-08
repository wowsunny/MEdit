import * as React from 'react';
import List from 'component/Block/List';
import Paragraph from 'component/Block/Paragraph';
import DefaultComponent from 'component/DefaultComponent';
import { DropTarget } from 'react-dnd';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import FocusManager from 'utils/editorTools/FocusManager';
import getKey from 'utils/editorTools/getKey';
import './style.scss';
import { defaultBlockProps } from 'component/Block/types';
import Header from 'component/Block/Header';
import Quote from 'component/Block/Quote';
import { getDataList } from 'utils/markdown';

export interface IndentationProps extends defaultBlockProps {
  depth: number;
  [propName: string]: any;
}

export interface IndentationDataItem extends DefaultDataItem {
  key: string;
  ref?: React.RefObject<any>;
}

interface IndentationState {
  dataList: IndentationDataItem[],
  refresh: boolean
}

class Indentation extends React.Component<IndentationProps, IndentationState> {
  public type = BlockStyleTypes.indentation;

  depth: number;

  handleInsertSibling: (key: string, siblings: DefaultDataItem[], replace: boolean) => void;

  key: string;

  handleDestroy: (key: string) => void;

  focusManager: any;

  constructor(props: IndentationProps) {
    super(props);
    const { depth, id, mountValues } = props;
    const { childList, handleInsertSiblings, handleDestroy, focusManager } = mountValues;
    this.key = id;
    this.focusManager = focusManager;
    this.state = {
      dataList: childList.map(child => ({
        key: child.key || getKey(child.type),
        type: child.type,
        childList: child.childList
      })),
      refresh: true
    };
    this.depth = depth;
    this.handleInsertSibling = handleInsertSiblings;
    this.handleDestroy = handleDestroy;
    this.findChildIndex = this.findChildIndex.bind(this);
    this.dndMove = this.dndMove.bind(this);
    this.getDataList = this.getDataList.bind(this);
    this.loadContent = this.loadContent.bind(this);
    this.getChildDataItem = this.getChildDataItem.bind(this);
    this.onChildInsertSibling = this.onChildInsertSibling.bind(this);
    this.onChildDestroy = this.onChildDestroy.bind(this);
    this.onChildTab = this.onChildTab.bind(this);
    this.InsertChildren = this.InsertChildren.bind(this);
    this.findChildIndex = this.findChildIndex.bind(this);
  }

  static getDerivedStateFromProps(nextProps: IndentationProps, state: IndentationState) {
    if (state.refresh) {
      return { refresh: false };
    }
    const curDataList = state.dataList.length ? state.dataList :
      [{ key: getKey(BlockStyleTypes.paragragh), type: BlockStyleTypes.paragragh, childList: [] }];
    const nextDataList = nextProps.mountValues.childList;
    if (!nextDataList.length) return { dataList: curDataList };
    const func = (cur: DefaultDataItem[], next: DefaultDataItem[]): boolean => {
      if (cur.length !== next.length) return false;
      return cur.every((item, index) => {
        if (item.type === next[index]?.type) {
          if (item.type === InlineStyleTypes.plainText) {
            return item.content === next[index]?.content;
          }
          return item.childList.every((_item, _index) => {
            return _item.type === next[index]?.childList[_index]?.type && func(_item.childList, next[index]?.childList[_index]?.childList);
          });
        }
        return false;
      });
    };
    if (!func(curDataList, nextDataList)) {
      return { dataList: nextDataList as IndentationDataItem[] };
    }
    return null;
  }

  private onChildInsertSibling(key: string, childList: DefaultDataItem[] = [], replace: boolean) {
    const index = this.findChildIndex(key);
    // eslint-disable-next-line
    const prevDataList = this.state.dataList.slice();
    prevDataList.splice(replace ? index : index + 1, replace ? 1 : 0, ...childList.map(child => ({
      ...child,
      key: child.key || getKey(child.type)
    })));
    this.setState({ dataList: prevDataList, refresh: true });
  }

  private onChildTab(key: string, isInside: boolean) {
    const dataList = this.getIndentationDataList();
    const index = this.findChildIndex(key);
    // 向内缩进
    if (isInside) {
      // 与前一个合并
      if (dataList[index - 1]?.type === BlockStyleTypes.indentation) {
        dataList[index - 1].childList.push(dataList[index]);
        // 与后一个合并
        if (dataList[index + 1]?.type === BlockStyleTypes.indentation) {
          dataList[index + 1].childList.forEach(child => {
            dataList[index - 1].childList.push(child);
          });
          dataList.splice(index + 1, 1);
        }
        dataList.splice(index, 1);
      }

      else {
        dataList.splice(index, 1, {
          key: getKey(BlockStyleTypes.indentation),
          type: BlockStyleTypes.indentation,
          childList: [dataList[index]]
        });

        // 只与后一个合并
        if (dataList[index + 1]?.type === BlockStyleTypes.indentation) {
          dataList[index + 1].childList.forEach(child => {
            dataList[index].childList.push(child);
          });
          dataList.splice(index + 1, 1);
        }
        // 都不合并
      }
      this.setState({ dataList, refresh: true });
    }
    // 向外缩进
    else {
      let siblings: DefaultDataItem[];
      // index之后的另起一个indentation
      if (dataList.length > index + 1) {
        const newDataList = dataList.slice(index + 1);
        siblings = [dataList[index], { type: BlockStyleTypes.indentation, childList: newDataList }];
      } else {
        siblings = [dataList[index]];
      }
      // index前面的更新内容
      if (index > 0) {
        this.handleInsertSibling(this.key, siblings, false);
        this.setState({ dataList: dataList.slice(0, index), refresh: true });
      }
      // index为头部则整体替换
      else {
        this.handleInsertSibling(this.key, siblings, true);
      }
    }
  }

  private onChildDestroy(key: string) {
    const index = this.findChildIndex(key);
    const dataList = this.getIndentationDataList();
    // 若多个子组件
    if (dataList.length > 1) {
      dataList.splice(index, 1);
      this.setState({ dataList, refresh: true });
    }
    // 单个子组件， 准备删除该indentation
    // 若是根indentation
    else if (this.depth === 0) {
      this.setState({ dataList: [{ key: getKey(BlockStyleTypes.paragragh), type: BlockStyleTypes.paragragh, childList: [] }], refresh: true });
    } else {
      this.destroy();
    }
  }

  private getCurrent(ref: React.RefObject<any>, type: BlockStyleTypes) {
    if (type === BlockStyleTypes.indentation) {
      return (ref!.current.decoratedRef.current as Indentation);
    }
    return ref?.current.decoratedRef.current.decoratedRef.current.decoratedRef.current;
  }

  private getChildChildList(index: number) {
    const child = this.state.dataList[index];
    if (child.type === BlockStyleTypes.indentation) {
      return (child.ref!.current.decoratedRef.current as Indentation).getDataList();
    }
    debugger;
    return child.ref?.current.decoratedRef.current.decoratedRef.current.decoratedRef.current.getDataList();
  }

  private getChildDataItem(key: string) {
    const child = this.state.dataList.find((item => item.key === key));
    if (!child) throw new Error('here');
    if (child.type === BlockStyleTypes.indentation) {
      return (child.ref!.current.decoratedRef.current as Indentation).transToDataItem();
    }
    return child.ref?.current.decoratedRef.current.decoratedRef.current.decoratedRef.current.transToDataItem();
  }

  public getDataList(): DefaultDataItem[] {
    return this.state.dataList.map((data, index) => {
      if (!data.ref) return;
      return this.getCurrent(data.ref, data.type as BlockStyleTypes).transToDataItem();
    });
  }

  public getIndentationDataList(): IndentationDataItem[] {
    const dataList = this.state.dataList.slice();
    dataList.forEach(data => {
      if (!data.ref) return;
      // eslint-disable-next-line
      data.childList = this.getCurrent(data.ref, data.type as BlockStyleTypes).transToDataItem().childList;
    });
    return dataList;
  }

  public getMarkdown(): string {
    const arr = this.state.dataList.map(child => {
      if (child.type === BlockStyleTypes.indentation) {
        return (child.ref!.current.decoratedRef.current as Indentation).getMarkdown();
      }
      console.log(child.type);
      return child.ref!.current.decoratedRef.current.decoratedRef.current.decoratedRef.current.getMarkdown();
    });
    return arr.join('\n');
  }

  public transToDataItem() {
    return {
      type: BlockStyleTypes.indentation,
      childList: this.getDataList()
    };
  }

  public loadContent(content: string) {
    // const dataList = getDataList(md);
    // const indentationDataList = dataList.map(item => {
    //   return { ...item, key: getKey(item.type) };
    // });
    let mdList: DefaultDataItem[] = [];
    try {
      mdList = JSON.parse(content || '[]');
    } catch (error) {
      console.log(error);
    }
    mdList.forEach(item => {
      // eslint-disable-next-line
      item.key = getKey(item.type);
    });
    console.log(mdList);
    if (!mdList.length) mdList.push({ type: BlockStyleTypes.paragragh, childList: [] });
    this.setState({ dataList: mdList as IndentationDataItem[], refresh: true });
  }

  public InsertChildren(children: DefaultComponent[], offset: number = 0) {
    const prevDataList = this.state.dataList.slice();
    if (offset === -1) {
      prevDataList.splice(prevDataList.length, 0, ...children);
    } else {
      prevDataList.splice(offset, 0, ...children);
    }
    this.setState({ dataList: prevDataList, refresh: true });
  }

  private findChildIndex(key: string) {
    const index = this.state.dataList.findIndex(data => data.key === key);
    if (index < 0) throw new Error(`cannot find the child that the key is ${key}`);
    return index;
  }

  public destroy() {
    this.handleDestroy(this.key);
  }

  private dndMove(key: string, toIndex: number) {
    const dataList = this.getIndentationDataList();
    dataList.splice(toIndex + 1, 0, dataList[this.findChildIndex(key)]);
    const index = this.findChildIndex(key);
    dataList.splice(index < toIndex ? index : index + 1, 1);
    console.log(dataList);
    this.setState({ dataList, refresh: true });
  }

  render() {
    const { connectDropTarget } = this.props;
    console.log(this.state.dataList);
    return connectDropTarget(
      <div className='indentation'>{
        this.state.dataList
          .map(data => {
            if (!data.ref)
              // eslint-disable-next-line
              data.ref = React.createRef();
            const mountValues = {
              childList: data.childList,
              focusManager: this.focusManager,
              content: data.content,
              handleInsertSiblings: this.onChildInsertSibling,
              handleTab: this.onChildTab,
              handleDestroy: this.onChildDestroy,
            };
            const dndValues = {
              indentationKey: this.key,
              getDataItem: this.getChildDataItem,
              findIndex: this.findChildIndex,
              dndMove: this.dndMove
            };

            switch (data.type) {
              case BlockStyleTypes.paragragh:
                return <Paragraph ref={data.ref} key={data.key} id={data.key} mountValues={mountValues} dndValues={dndValues} />;
              case BlockStyleTypes.indentation:
                return <DndIndentation ref={data.ref} key={data.key} id={data.key} depth={this.depth + 1} mountValues={mountValues} dndValues={dndValues} />;
              case BlockStyleTypes.list: {
                const listData = data.listData?.length ? data.listData : data.childList;
                return <List ref={data.ref} key={data.key} id={data.key} listData={listData as any} mountValues={mountValues} dndValues={dndValues} />;
              }
              case BlockStyleTypes.header:
                return <Header ref={data.ref} key={data.key} id={data.key} level={data.headerLevel || 1} mountValues={mountValues} dndValues={dndValues} />;
              case BlockStyleTypes.quote:
                return <Quote ref={data.ref} key={data.key} id={data.key} mountValues={mountValues} dndValues={dndValues} />;
              default:
                throw new Error('unexpected case');
            }
          })
      }
      </div>
    );
  }
}

const DndIndentation = DropTarget('drag', {}, connect => ({
  connectDropTarget: connect.dropTarget()
}))(Indentation);

export default DndIndentation;