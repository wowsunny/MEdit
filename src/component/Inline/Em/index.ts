import { DefaultComponentProps } from 'component/DefaultComponent';
import { InlineStyleTypes } from 'types/ComponentTypes';
import InlineComponent from '../InlineComponent';

interface EmProps extends DefaultComponentProps {

}

export default class Em extends InlineComponent {
  public component: Element;

  constructor(props: EmProps | DefaultComponentProps) {
    super(props);
    const em = document.createElement('em');
    em.setAttribute('class', 'em');
    this.component = em;

    this.refresh();
  }

  public getMarkdown() {
    return `*${this.getContent()}*`;
  }

  public getContent() {
    return this.childList.reduce((pre, cur) => {
      return pre + (cur as InlineComponent).getContent();
    }, '');
  }

  public refresh() {
    this.component.innerHTML = '';
    this.childList.forEach(child => {
      this.component.appendChild(child.component);
    });
  }
}