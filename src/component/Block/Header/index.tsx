import * as React from 'react';
import { RefObject } from 'react';
import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import PlainText from 'component/Inline/PlainText';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { dataListToComponents } from 'utils/editorTools/dataToComponent';
import dndWrapper from '../dndWrapper';
import EditableBlock from '../EditableBlock';
import { defaultBlockProps } from '../types';
import './style.scss';

export class HeaderComponent extends EditableBlock {

  content: string;

  constructor(props: DefaultComponentProps & { level: number, content: string }) {
    super({ ...props, component: document.createElement(`h${props.level}`) });
    this.content = props.content;
    this.doMarkdownParse = false;
    this.refresh();
    console.log(props);
  }

  public getContent() {
    return this.component.textContent;
  }

  public refresh() {
    this.component.innerHTML = this.content || '';
  }

  public clone(childList: DefaultComponent[] = []) {
    throw new Error('unmounted component cannot use this function');
  }

  static createDefault = () => {
    throw new Error('unmounted component cannot use this function');
  };

}

export interface HeaderProps extends defaultBlockProps {
  content?: string;
  level: number;
  [propName: string]: any;
}

class Header extends React.Component<HeaderProps> {
  public key: string;

  ref: RefObject<HTMLDivElement>;

  content: string;

  target: HeaderComponent;

  constructor(props: HeaderProps) {
    super(props);
    const { id, level, mountValues } = props;
    const { content = '' } = mountValues;
    console.log(props);
    this.key = id;
    this.content = content;
    this.ref = React.createRef();
    const { childList, handleTab, handleInsertSiblings, handleDestroy, focusManager } = mountValues;
    const onHeaderInsertSibling = (sibling: DefaultDataItem, replace: boolean) => {
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
    this.target = new HeaderComponent({ type: BlockStyleTypes.header, childList: [], level, content });
    this.target.mount({ handleInsertSiblings: onHeaderInsertSibling, handleEnter: onEnter, handleTab: onTab, handleDestroy: onDestroy });
    focusManager.register(this.key, this.target.detectAnchor);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.refresh();
  }

  public getContent() {
    return this.ref.current!.innerHTML;
  }

  public getDataList() {
    return [{ type: InlineStyleTypes.plainText, childList: [], content: this.target.getContent() }];
  }

  public getMarkdown() {
    const arr = new Array(this.props.level).fill(1);
    return `${arr.reduce((pre, cur) => `${pre}#`, '')} ${this.target.getContent()}`;
  }

  public transToDataItem() {
    return {
      type: BlockStyleTypes.header,
      childList: [],
      content: this.target.getContent()
    };
  }

  // content -> DOM
  private refresh() {
    (this.ref.current as any).appendChild(this.target.component);
  }

  render() {
    const {
      isDragging, connectDragSource, connectDragPreview, connectDropTarget
    } = this.props;
    return connectDropTarget(
      connectDragPreview(
        <div className='blockWrapper'>
          {connectDragSource(<div className='dragIcon'>::</div>)}
          <div className='header' ref={this.ref} style={{ opacity: isDragging ? 0.5 : 1 }} dangerouslySetInnerHTML={{ __html: '' }} />
        </div>
      )
    );
  }
}

export default dndWrapper<HeaderProps>(Header);
