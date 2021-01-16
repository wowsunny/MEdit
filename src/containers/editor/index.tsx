import React, { useEffect, useRef } from 'react';
import './style.scss';

export interface EditorProps {

}

const Editor: React.FC<EditorProps> = () => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const editor = ref.current;
    if (editor !== null) {
      editor.addEventListener('input', ((e: InputEvent) => {
        console.log('input: ', e.data, e.isComposing);
      }) as EventListener, true);
      editor.addEventListener('keydown', (e: KeyboardEvent) => {
        console.log('keydown: ', e.code, e.isComposing);
      }, true);
      editor.addEventListener('textinput', ((e: InputEvent) => {
        console.log('textInput: ', e);
      }) as EventListener, true);
    }

  }, []);
  return (
    /* eslint-disable-next-line */
    <div className='editor-wrapper' contentEditable={true} suppressContentEditableWarning={true} ref={ref} >
      <div>
        <table>
          <tbody>
            <tr><th>1</th></tr>
            <tr><td>2</td></tr>
            <tr><td>3</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Editor;