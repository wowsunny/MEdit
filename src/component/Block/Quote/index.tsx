import React, { RefObject } from 'react';
import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import PlainText from 'component/Inline/PlainText';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { dataListToComponents } from 'utils/editorTools/dataToComponent';
import EditableBlock from '../EditableBlock';
import dndWrapper from '../dndWrapper';
import './style.scss';
import { defaultBlockProps } from '../types';

export class QuoteComponent extends EditableBlock {
  constructor(props: DefaultComponentProps) {
    super({ ...props, component: document.createElement('p') });
    this.doMarkdownParse = false;
  }

  public refresh() {
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }

  public clone(childList: DefaultComponent[] = []) {
    throw new Error('cannot use this function');

  }

  static createDefault = () => {
    throw new Error('cannot use this function');
  };

}


export interface QuoteProps extends defaultBlockProps {
  [propName: string]: any;
}

class Quote extends React.Component<QuoteProps> {
  target: QuoteComponent;

  ref: RefObject<HTMLDivElement>;

  key: string;

  constructor(props: QuoteProps) {
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

    this.target = new QuoteComponent({
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
    return `> ${this.target.getMarkdown()}`;
  }

  public transToDataItem(): DefaultDataItem {
    return {
      type: BlockStyleTypes.quote,
      childList: this.getDataList()
    };
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
          <div className='quote' style={{ opacity: isDragging ? 0.5 : 1 }} ref={this.ref} dangerouslySetInnerHTML={{ __html: '' }} />
        </div>

      )
    );
  }
}

export default dndWrapper<QuoteProps>(Quote);