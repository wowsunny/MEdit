import { DefaultComponentProps } from 'component/DefaultComponent';
import { InlineStyleTypes } from 'types/ComponentTypes';
import InlineComponent from '../InlineComponent';

interface HighlightProps extends DefaultComponentProps {

}

export default class Highlight extends InlineComponent {
  public component: Element;

  constructor(props: HighlightProps | DefaultComponentProps) {
    super(props);
    this.component = document.createElement('mark');
    this.refresh();
  }

  public refresh() {
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }

  public getMarkdown() {
    return `==${this.getContent()}==`;
  }

  public getContent() {
    return this.childList.reduce((pre, cur) => {
      return pre + (cur as InlineComponent).getContent();
    }, '');
  }

  public clone(childList: InlineComponent[]): Highlight {
    return new Highlight({ type: InlineStyleTypes.highlight, childList });
  }
}