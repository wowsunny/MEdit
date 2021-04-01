import * as React from 'react';
import { DefaultDataItem } from 'types/ComponentTypes';

export interface ListProps {
  handleInsertParagraph: (key: string) => void;
  listData?: DefaultDataItem[];
}

export interface ListState {

}

class List extends React.Component<ListProps, ListState> {
  constructor(props: ListProps) {
    super(props);
    console.log('here');
  }
  
  render() {
    return (
      <div>list</div>
    );
  }
}

export default List;