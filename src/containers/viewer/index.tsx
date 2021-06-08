import * as React from 'react';
import Editor from 'containers/editor';
import Header from 'containers/header';
import Sider from 'containers/sider';
import './style.scss';

export interface ViewerProps {

}
const Viewer: React.FC<ViewerProps> = () => {
  return (
    <div className='viewer'>
      <Header />
      <div className='body-wrapper'>
        <Sider />
        <Editor />
      </div>
    </div>);
};


export default Viewer;