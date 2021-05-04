import * as React from 'react';
import Editor from 'containers/editor';
import './style.scss';

export interface ViewerProps {

}
const Viewer: React.FC<ViewerProps> = () => {
  return (
    <div className='viewer'>
      <div className='viewer-wrapper'>
        <Editor />
      </div>
    </div>);
};


export default Viewer;