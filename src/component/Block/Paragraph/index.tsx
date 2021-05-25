import React, { RefObject } from 'react';
import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import PlainText from 'component/Inline/PlainText';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { dataListToComponents } from 'utils/editorTools/dataToComponent';
import EditableBlock from '../EditableBlock';
import dndWrapper from '../dndWrapper';
import './style.scss';
import { defaultBlockProps } from '../types';

export class ParagraphComponent extends EditableBlock {
  constructor(props: DefaultComponentProps) {
    super({ ...props, component: document.createElement('p') });
  }

  public refresh() {
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }

  public clone(childList: DefaultComponent[] = []) {
    if (!this.mounted) throw new Error('unmounted component cannot use this function');
    const result = new ParagraphComponent({ type: BlockStyleTypes.paragragh, childList });
    result.mount({
      handleInsertSiblings: this.blockMountProps!.handleInsertSiblings,
      handleEnter: this.blockMountProps!.handleEnter,
      handleTab: this.blockMountProps!.handleTab,
      handleDestroy: this.blockMountProps!.handleDestroy
    });
    return result;
  }

  static createDefault = () => {
    const plainText = new PlainText({ type: InlineStyleTypes.plainText, content: '' });
    const paragragh = new ParagraphComponent({ type: BlockStyleTypes.paragragh });
    paragragh.appendChild(plainText);
    return paragragh;
  };

}


export interface ParagraphProps extends defaultBlockProps {
  [propName: string]: any;
}

class Paragraph extends React.Component<ParagraphProps> {
  target: ParagraphComponent;

  ref: RefObject<HTMLDivElement>;

  key: string;

  constructor(props: ParagraphProps) {
    super(props);
    this.ref = React.createRef();
    const { id, mountValues } = props;
    const { childList, handleTab, handleInsertSiblings, handleDestroy, focusManager } = mountValues;
    this.key = id;
    const onParagraphInsertSibling = (sibling: DefaultDataItem, replace: boolean) => {
      handleInsertSiblings(this.key, [sibling], replace);
    };

    const onEnter = (key: string, nextChildren: DefaultDataItem[]) => {
      handleInsertSiblings(this.key, [{ type: BlockStyleTypes.paragragh, childList: nextChildren }], false);
    };

    const onTab = (key: string, isInside: boolean) => {
      handleTab(this.key, isInside);
    };

    const onDestroy = () => {
      console.log('destroy!!!!!!!!!!!!!!!!!!!!!');
      handleDestroy(this.key);
    };

    this.target = new ParagraphComponent({
      type: BlockStyleTypes.paragragh, childList: dataListToComponents(childList)
    });
    this.target.mount({ handleInsertSiblings: onParagraphInsertSibling, handleEnter: onEnter, handleTab: onTab, handleDestroy: onDestroy });
    focusManager.register(this.key, this.target.detectAnchor);
  }

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate() {
    this.refresh();
  }

  public getDataList() {
    return this.target.getDataList();
  }

  public getMarkdown() {
    return this.target.getMarkdown();
  }

  private refresh() {
    this.ref.current!.appendChild(this.target.component);
  }

  render() {
    const {
      // 这些 props 由 React DnD注入，参考`collect`函数定义
      isDragging, connectDragSource, connectDragPreview, connectDropTarget
    } = this.props;
    return connectDropTarget(
      connectDragPreview(
        <div className='blockWrapper'>
          {connectDragSource(<div className='dragIcon'>::</div>)}
          <div className='paragraph' style={{ opacity: isDragging ? 0.5 : 1 }} ref={this.ref} dangerouslySetInnerHTML={{ __html: '' }} />
        </div>

      )
    );
  }
}

export default dndWrapper<ParagraphProps>(Paragraph);