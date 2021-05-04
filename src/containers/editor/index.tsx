import React, { useEffect, useRef } from 'react';
import './style.scss';
import Intendentation from 'component/Stable/Indentation';
import FocusManager from 'utils/FocusManager';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

export interface EditorProps {

}
const Editor: React.FC<EditorProps> = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focusManager = new FocusManager({ rootRef: ref });
  useEffect(() => {
    focusManager.init();
  }, []);
  const mountValues = { childList: [], focusManager, handleInsertSiblings: () => { }, handleDestroy: () => { } };
  const dndValues = { findIndex: (key: string) => { }, dndMove: (sourceKey: string, targetIndex: number) => { } };
  return (
    <div className='editor-wrapper' ref={ref}>
      <Intendentation id='initIndentation' depth={0} mountValues={mountValues} dndValues={dndValues} />
    </div>
  );
};

export default DragDropContext(HTML5Backend)(Editor);