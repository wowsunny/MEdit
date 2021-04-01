import Paragraph from 'component/Block/Paragraph';
import * as React from 'react';
import { BlockStyleTypes, DefaultDataItem } from 'types/ComponentTypes';
import getKey from 'utils/getKey';

export interface IndentationProps {
  childList: DefaultDataItem[];
}

interface IndentationState {
  dataList: DefaultDataItem[],
}

class Indentation extends React.Component<IndentationProps, IndentationState> {
  public type = BlockStyleTypes.indentation;

  constructor(props: IndentationProps) {
    super(props);
    const { childList } = props;
    this.state = { dataList: childList.length ? childList : [{ type: BlockStyleTypes.paragragh, childList: [] }] };
  }

  private onChildInsertSibling(key: string, childList: DefaultDataItem[] = [], replace: boolean) {
    const index = this.findChildIndex(key);
    this.setState(prevState => {
      prevState.dataList.splice(index, replace ? 1 : 0, ...childList);
      return {
        dataList: prevState.dataList
      };
    });
  }

  private findChildIndex(key: string) {
    const index = this.state.dataList.findIndex(data => data.key === key);
    if (index < 0) throw new Error(`cannot find the child that the key is ${key}`);
    return index;
  }


  render() {
    return (
      <div className='indentation'>{this.state.dataList.map(data => {
        // switch (data.type) {
        // case BlockStyleTypes.paragragh:
        return <Paragraph key={getKey()} handleInsertSiblings={this.onChildInsertSibling} childList={data.childList} />;
        // case BlockStyleTypes.heading:
        //   return <Header level={data.headerLevel || 1} handleInsertParagraph={this.onChildInsertSibling} content={data.content} />;
        // case BlockStyleTypes.indentation:
        //   return <Indentation childList={data.childList} />;
        // case BlockStyleTypes.codeBlock:
        //   return <CodeBlock handleInsertParagraph={this.onChildInsertSibling} content={data.content} />;
        // case BlockStyleTypes.list:
        //   return <List handleInsertParagraph={this.onChildInsertSibling} listData={data.listData} />;
        // case BlockStyleTypes.table:
        //   return <Table handleInsertParagraph={this.onChildInsertSibling} tableData={data.tableData} />;
        // default:
        // break;
        // }
      })}
      </div>
    );
  }
}

export default Indentation;