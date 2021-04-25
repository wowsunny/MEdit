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
  const stableValues = { childList: [], focusManager, handleInsertSiblings: () => { }, handleDestroy: () => { } };
  return (
    <div className='editor-wrapper' ref={ref}>
      <Intendentation id='initIndentation' depth={0} stableValues={stableValues} />
    </div>
  );
};

export default Editor;