import React, { useEffect, useRef } from 'react';
import './style.scss';
import Intendentation, { IndentationDataItem } from 'component/Stable/Indentation';
import FocusManager from 'utils/editorTools/FocusManager';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

export interface EditorProps {

}
const Editor: React.FC<EditorProps> = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const indentationRef = useRef<HTMLDivElement>(null);
  const focusManager = new FocusManager({ rootRef: editorRef });
  useEffect(() => {
    focusManager.init();
    const root = (indentationRef as any).current.decoratedRef.current;
    (window as any).activeEditor = {
      getMarkdown: () => {
        return root.getMarkdown();
      },
      getDataList: () => {
        return root.getDataList();
      },
      loadDataList: (dataList: IndentationDataItem[]) => {
        root.setDataList(dataList);
      }
    };
  }, []);
  const mountValues = { childList: [], focusManager, handleInsertSiblings: () => { }, handleDestroy: () => { } };
  const dndValues = { findIndex: (key: string) => { }, dndMove: (sourceKey: string, targetIndex: number) => { } };


  return (
    <div className='editor-wrapper' ref={editorRef}>
      <Intendentation id='initIndentation' depth={0} ref={indentationRef as any} mountValues={mountValues} dndValues={dndValues} />
    </div>
  );
};

export default DragDropContext(HTML5Backend)(Editor);