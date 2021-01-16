import * as React from 'react';
import Editor from 'containers/Editor';
// import Sider from 'containers/sider';
import './style.scss';

export interface ViewerProps {

}

const Viewer: React.FC<ViewerProps> = () =>
  <div className='viewer'>
    <div className='viewer-wrapper'>
      {/* <Sider /> */}
      <Editor />
    </div>
  </div>;

export default Viewer;