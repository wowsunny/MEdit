import React, { useState, createRef, useEffect } from 'react';
import { throttle } from 'lodash';
import './style.scss';

export interface SiderProps {

}

const Sider: React.FC<SiderProps> = () => {
  const [siderWidth, setSiderWidth] = useState(200);
  const ref = createRef<HTMLDivElement>();
  let isDragStart = false;
  const handleDrag = throttle((e) => {
    if (e.clientX === 0) return;
    if (isDragStart) {
      isDragStart = false;
      return;
    }
    setSiderWidth(e.clientX);
  }, 17);
  useEffect(() => {
    const border = ref.current;
    if (border) {
      border.addEventListener('drag', handleDrag);
      border.addEventListener('dragstart', (e) => {
        // eslint-disable-next-line
        isDragStart = true;
        e.dataTransfer && e.dataTransfer.setDragImage(new Image(), 0, 0);
      }
      );
    }
  }, []);
  return (
    <div className='sider-wrapper' style={{ 'flexBasis': siderWidth }}>
      <div className='content'>sider</div>
      <div className='sider-border' ref={ref} draggable='true' />
    </div>
  );
};

export default Sider;