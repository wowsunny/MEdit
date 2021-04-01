import * as React from 'react';

type LevelType = 1 | 2 | 3 | 4 | 5 | 6;
export interface HeaderProps {
  level: LevelType;
  content?: string;
  handleInsertParagraph: (key: string) => void;
}

export interface HeaderState {
  level: LevelType;
}

class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props);
    const { level } = props;
    this.state = { level };
  }

  render() {
    return (
      <div>{this.state.level}</div>
    );
  }
}

export default Header;