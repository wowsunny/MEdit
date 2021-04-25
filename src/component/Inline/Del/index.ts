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
    this.refresh();
  }

  public refresh() {
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }

  public getMarkdown() {
    return `~~${this.getContent()}~~`;
  }

  public getContent() {
    return this.childList.reduce((pre, cur) => {
      return pre + (cur as InlineComponent).getContent();
    }, '');
  }
}