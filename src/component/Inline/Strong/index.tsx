import { DefaultComponentProps } from 'component/DefaultComponent';
import { InlineStyleTypes } from 'types/ComponentTypes';
import InlineComponent from '../InlineComponent';

interface StrongProps extends DefaultComponentProps {

}

export default class Strong extends InlineComponent {
  public component: Element;

  constructor(props: StrongProps | DefaultComponentProps) {
    super(props);
    this.component = document.createElement('strong');
    this.refresh();
  }

  public getMarkdown() {
    return `**${this.getContent()}**`;
  }

  public getContent() {
    return this.childList.reduce((pre, cur) => {
      return pre + (cur as InlineComponent).getContent();
    }, '');
  }

  private refresh() {
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }

  public clone(childList: InlineComponent[]): Strong {
    return new Strong({ type: InlineStyleTypes.strong, childList });
  }
}