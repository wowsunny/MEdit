import React, { useEffect, useRef } from 'react';
import './style.scss';
import Intendentation from 'component/Stable/Indentation';
import FocusManager from 'utils/FocusManager';

export interface EditorProps {

}
const Editor: React.FC<EditorProps> = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focusManager = new FocusManager({ rootRef: ref });
  useEffect(() => {
    focusManager.init();
  }, []);
  return (
    <div className='editor-wrapper' ref={ref}>
      <Intendentation id='initIndentation' childList={[]} depth={0} handleInsertSiblings={() => { }} handleDestroy={() => { }} focusManager={focusManager} />
    </div>
  );
};

export default Editor;