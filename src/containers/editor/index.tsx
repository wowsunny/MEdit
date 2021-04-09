import React, { useEffect, useRef } from 'react';
import './style.scss';
import Intendentation from 'component/Stable/Indentation';
import { BlockStyleTypes, InlineStyleTypes } from 'types/ComponentTypes';
import Strong from 'component/Inline/Strong';

export interface EditorProps {

}
const Editor: React.FC<EditorProps> = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const editor = ref.current;
  }, []);
  return (
    <div className='editor-wrapper' ref={ref}>
      <Intendentation id='initIndentation' childList={[]} depth={0} handleInsertSiblings={() => { }}  />
    </div>
  );
};

export default Editor;