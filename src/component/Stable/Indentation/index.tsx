import BlockComponent, { BlockMountProps } from 'component/Block/BlockComponent';
import Paragraph from 'component/Block/Paragraph';
import * as React from 'react';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import FocusManager from 'utils/FocusManager';
import getKey from 'utils/getKey';
import './style.scss';

export interface IndentationProps {
  id: string;
  depth: number;
  childList: DefaultDataItem[];
  focusManager: FocusManager;
  handleInsertSiblings: (key: string, siblings: DefaultDataItem[], replace: boolean) => void;
  handleDestroy: (key: string) => void;
}

interface IndentationDataItem extends DefaultDataItem {
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

  constructor(props: IndentationProps) {
    super(props);
    const { childList, depth, handleInsertSiblings, handleDestroy,  id } = props;
    this.key = id;
    this.state = {
      dataList: childList.length ? childList.map(child => ({
        key: child.key || getKey(child.type),
        type: child.type,
        childList: child.childList
      })) : [{ key: getKey(BlockStyleTypes.paragragh), type: BlockStyleTypes.paragragh, childList: [] }],
      refresh: true
    };
    this.depth = depth;
    this.handleInsertSibling = handleInsertSiblings;
    this.handleDestroy = handleDestroy;
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
    const curDataList = state.dataList;
    const nextDataList = nextProps.childList;
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
    const dataList = this.getDataList();
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
      // TODO
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
    const dataList = this.getDataList();
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

  public getDataList() {
    const dataList = this.state.dataList.slice();
    dataList.forEach(data => {
      // eslint-disable-next-line
      data.childList = data.ref?.current.getDataList();
    });
    return dataList;
  }

  public InsertChildren(children: BlockComponent[], offset: number = 0) {
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

  render() {
    return (
      <div className='indentation'>{this.state.dataList.map(data => {
        if (!data.ref)
          // eslint-disable-next-line
          data.ref = React.createRef();

        switch (data.type) {
          case BlockStyleTypes.paragragh:
            return <Paragraph ref={data.ref} key={data.key} id={data.key} handleInsertSiblings={this.onChildInsertSibling} handleTab={this.onChildTab} childList={data.childList} handleDestroy={this.onChildDestroy} focusManager={this.props.focusManager} />;
          // case BlockStyleTypes.heading:
          //   return <Header level={data.headerLevel || 1} handleInsertParagraph={this.onChildInsertSibling} content={data.content} />;
          case BlockStyleTypes.indentation:
            return <Indentation ref={data.ref} key={data.key} id={data.key} childList={data.childList} handleInsertSiblings={this.onChildInsertSibling} depth={this.depth + 1} handleDestroy={this.onChildDestroy} focusManager={this.props.focusManager} />;
          // case BlockStyleTypes.codeBlock:
          //   return <CodeBlock handleInsertParagraph={this.onChildInsertSibling} content={data.content} />;
          // case BlockStyleTypes.list:
          //   return <List handleInsertParagraph={this.onChildInsertSibling} listData={data.listData} />;
          // case BlockStyleTypes.table:
          //   return <Table handleInsertParagraph={this.onChildInsertSibling} tableData={data.tableData} />;
          default:
            debugger;
            throw new Error('unexpected case');
            break;
        }
      })}
      </div>
    );
  }
}

export default Indentation;