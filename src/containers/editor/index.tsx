import React, { useEffect, useRef } from 'react';
import './style.scss';
import Intendentation, { IndentationDataItem } from 'component/Stable/Indentation';
import FocusManager from 'utils/editorTools/FocusManager';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import api from 'utils/api';
import store from 'store';
import notify, { notifyType } from 'utils/notify';
import { DefaultDataItem } from 'types/ComponentTypes';

export interface EditorProps {

}
const Editor: React.FC<EditorProps> = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const indentationRef = useRef<HTMLDivElement>(null);
  const focusManager = new FocusManager({ rootRef: editorRef });

  useEffect(() => {
    focusManager.init();
    const root = (indentationRef as any).current.decoratedRef.current;

    const getDataList = () => {
      const dataList = root.getDataList();
      const parse = (node: DefaultDataItem): DefaultDataItem => {
        const { type, childList, content, listData, headerLevel } = node;
        return {
          type,
          childList: childList?.map(child => parse(child)) || [],
          content,
          listData,
          headerLevel
        };
      };
      return dataList.map((data: any) => parse(data));
    };

    const saveContent = () => {
      const { curTitle, userName } = store.getState();
      if (curTitle && userName) {
        const content = JSON.stringify(getDataList()).replace(/"/g, '\\"');
        const res = api.saveArticle(curTitle, content);
        if (res.status === 200) {
          notify(notifyType.updateArticleSuccessful);
        }
      }
    };

    (window as any).activeEditor = {
      getMarkdown: () => {
        const md = root.getMarkdown();
        console.log(md);
        return md;
      },
      getDataList,
      loadContent: (content: string) => {
        root.loadContent(content);
      },
      saveContent
    };

    setInterval(saveContent, 1000 * 60 * 5);
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