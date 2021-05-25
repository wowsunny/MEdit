import * as React from 'react';
import Editor from 'containers/editor';
import Header from 'containers/header';
import './style.scss';

export interface ViewerProps {

}
const Viewer: React.FC<ViewerProps> = () => {
  return (
    <div className='viewer'>
      <div className='viewer-wrapper'>
        <Header />
        <Editor />
      </div>
    </div>);
};


export default Viewer;