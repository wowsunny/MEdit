import React, { RefObject } from 'react';
import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import PlainText from 'component/Inline/PlainText';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { dataListToComponents, dataToComponent } from 'utils/dataToComponent';
import FocusManager from 'utils/FocusManager';
import EditableBlock, { BlockMountProps } from '../EditableBlock';

export class ParagraphComponent extends EditableBlock {
  constructor(props: DefaultComponentProps) {
    super({...props, component: document.createElement('p')});
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


export interface ParagraphProps {
  id: string;
  stableValues: {
    childList: DefaultDataItem[];
    focusManager: FocusManager;
    handleTab: (key: string, isInside: boolean) => void,
    handleInsertSiblings: (key: string, childList: DefaultDataItem[], replace: boolean) => void;
    handleDestroy: (key: string) => void;
  }
}

class Paragraph extends React.Component<ParagraphProps> {
  target: ParagraphComponent;

  ref: RefObject<HTMLDivElement>;

  key: string;

  constructor(props: ParagraphProps) {
    super(props);
    this.ref = React.createRef();
    const { id, stableValues } = props;
    const { childList, handleTab, handleInsertSiblings, handleDestroy, focusManager } = stableValues;
    this.key = id;
    const onParagraphInsertSibling = (sibling: DefaultDataItem, replace: boolean) => {
      handleInsertSiblings(this.key, [sibling], replace);
    };

    const onEnter = (key: string, nextChildren: DefaultDataItem[]) => {
      handleInsertSiblings(this.key, [{ type: BlockStyleTypes.paragragh, childList: nextChildren }], false);
    };

    const onTab = (key: string, isInside: boolean) => {
      console.log('&&&&&&&&&&&&&&&&&&&&', this.key);
      handleTab(this.key, isInside);
    };

    const onDestroy = () => {
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

  private refresh() {
    this.ref.current!.appendChild(this.target.component);
  }

  render() {
    return (
      <div className='paragraph' ref={this.ref} dangerouslySetInnerHTML={{ __html: '' }} />
    );
  }
}

export default Paragraph;

