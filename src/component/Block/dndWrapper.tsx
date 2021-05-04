import * as React from 'react';
import { DefaultDataItem } from 'types/ComponentTypes';
import FocusManager from 'utils/FocusManager';
import { DragSourceMonitor, DropTargetMonitor, DropTargetConnector, DragSource, DropTarget } from 'react-dnd';
import './style.scss';

export interface DndWrapperProps {
  [propName: string]: any;
}

export interface ComponentPropsType {
  id: string;
  mountValues: {
    childList: DefaultDataItem[];
    focusManager: FocusManager;
    handleTab: (key: string, isInside: boolean) => void,
    handleInsertSiblings: (key: string, childList: DefaultDataItem[], replace: boolean) => void;
    handleDestroy: (key: string) => void;
  };
  dndValues: {
    findIndex: (key: string) => number;
    dndMove: (sourceKey: string, targetIndex: number) => void;
  }
}

const dragSpec = {
  // 拖动开始时，返回描述 source 数据。后续通过 monitor.getItem() 获得
  beginDrag: (props: ComponentPropsType) => ({
    id: props.id,
    originalIndex: props.dndValues.findIndex(props.id)
  }),
  // 拖动停止时，处理 source 数据
  endDrag(props: ComponentPropsType, monitor: DragSourceMonitor) {
    const { id: droppedId, originalIndex } = monitor.getItem();
    const didDrop = monitor.didDrop();
    // source 是否已经放置在 target
    if (!didDrop) {
      return props.dndValues.dndMove(droppedId, originalIndex);
    }
  }
};
const dragCollect = (connect: any, monitor: DragSourceMonitor) => ({
  connectDragSource: connect.dragSource(), // 用于包装需要拖动的组件
  connectDragPreview: connect.dragPreview(), // 用于包装需要拖动跟随预览的组件
  isDragging: monitor.isDragging() // 用于判断是否处于拖动状态
});
const dropSpec = {
  canDrop: () => false, // item 不处理 drop
  hover(props: ComponentPropsType, monitor: DropTargetMonitor) {
    const { id: draggedId } = monitor.getItem();
    const { id: overId } = props;
    // 如果 source item 与 target item 不同，则交换位置并重新排序
    if (draggedId !== overId) {
      const overIndex = props.dndValues.findIndex(overId);
      props.dndValues.dndMove(draggedId, overIndex);
    }
  }
};
const dropCollect = (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
  connectDropTarget: connect.dropTarget() // 用于包装需接收拖拽的组件
});

const dndWrapper = <ComponentProps extends ComponentPropsType>(Component: React.ComponentType<ComponentProps>) =>
  DropTarget('test', dropSpec, dropCollect)(
    DragSource('test', dragSpec, dragCollect)(
      class DndWrapper extends React.Component<ComponentPropsType & DndWrapperProps> {
        decoratedRef: React.RefObject<any>;

        constructor(props: ComponentPropsType & DndWrapperProps){
          super(props);
          this.decoratedRef = React.createRef();
        }

        render() {
          return (<Component ref={this.decoratedRef} {...this.props as ComponentProps} />);
        }
      }
    )
  );


export default dndWrapper;