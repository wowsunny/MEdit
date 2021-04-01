import { DefaultComponentProps } from 'component/DefaultComponent';
import { InlineStyleTypes } from 'types/ComponentTypes';
import InlineComponent from '../InlineComponent';

interface DelProps extends DefaultComponentProps {

}

export default class Del extends InlineComponent {
  public component: Element;

  constructor(props: DelProps) {
    super(props);
    this.component = document.createElement('del');
  }

  public getMarkdown() {
    return `~~${this.getContent()}~~`;
  }

  public getContent() {
    return this.childList.reduce((pre, cur) => {
      return pre + (cur as InlineComponent).getContent();
    }, '');
  }

  public clone(childList: InlineComponent[]): Del {
    return new Del({ type: InlineStyleTypes.del, childList });
  }
}