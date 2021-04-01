import { DefaultComponentProps } from 'component/DefaultComponent';
import { BusEventTypes } from 'component/EventBus';
import InlineComponent, { InlineMountProps } from '../InlineComponent';

interface WbrProps extends DefaultComponentProps {

}

export default class Wbr extends InlineComponent {
  public component: Element;

  constructor(props: WbrProps | DefaultComponentProps) {
    super(props);
    this.component = document.createElement('wbr');
  }

  public mount(props: InlineMountProps) {
    if (this.mounted) return;
    this.mounted = true;
    this.inlineMountProps = props;
    const that = this;
    this.childList.forEach(child => {
      const { eventBus } = props;
      (child as InlineComponent).mount({
        eventBus,
        handleEnter: this.onChildEnter.bind(that),
        handleDestroy: this.onChildDestroy.bind(that),
        handleInsertSibling: this.onChildInsertSibling.bind(that)
      });
    });
    this.inlineMountProps.eventBus.subscribe(BusEventTypes.parseAnchor, this.key, () => {
      const selection = document.getSelection();
      selection!.collapse(this.component);
      this.destroy();
    });
  }

  public getMarkdown() {
    return '<wbr>';
  }

  public getContent() {
    return '<wbr>';
  }

  public clone(childList: InlineComponent[]): Wbr {
    return new Wbr({ type: this.type, childList });
  }
}