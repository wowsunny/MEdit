import * as React from 'react';
import { DefaultDataItem } from 'types/ComponentTypes';

export interface TableProps {
  handleInsertParagraph: (key: string) => void;
  tableData?: Array<DefaultDataItem[]>;
}

export interface TableState {

}

class Table extends React.Component<TableProps, TableState> {
  constructor(props: TableProps) {
    super(props);
    console.log('here');
  }

  render() {
    return (
      <div>table</div>
    );
  }
}

export default Table;