import * as React from 'react';

export interface CodeBlockProps {
  content?: string;
  handleInsertParagraph: (key: string) => void;
}

export interface CodeBlockState {

}

class CodeBlock extends React.Component<CodeBlockProps, CodeBlockState> {
  constructor(props: CodeBlockProps) {
    super(props);
    console.log('here');
  }
  
  render() {
    return (
      <div>codeBlock</div>
    );
  }
}

export default CodeBlock;