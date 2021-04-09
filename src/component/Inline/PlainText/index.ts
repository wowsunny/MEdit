import { DefaultComponentProps } from 'component/DefaultComponent';
import EventBus, { BusEventTypes } from 'component/EventBus';
import { InlineStyleTypes } from 'types/ComponentTypes';
import InlineComponent, { InlineMountProps } from '../InlineComponent';
import Wbr from '../Wbr';

interface MountedPlainTextProps extends DefaultComponentProps {
  content: string;
}
interface UnMountedPlainTextProps extends DefaultComponentProps {
  content: string;
}

export default class PlainText extends InlineComponent {
  content: string;

  component: Element;

  constructor(props: MountedPlainTextProps | UnMountedPlainTextProps) {
    super(props);
    const { content } = props;
    this.content = content;
    this.component = document.createElement('span');
    this.component.appendChild(document.createTextNode(this.content));
  }

  public getMarkdown() {
    return this.component.innerHTML;
  }

  public getContent() {
    this.content = this.component.innerHTML;
    return this.content;
  }

  public getComponent() {
    return this.component;
  }

  public refresh() {
    this.component.innerHTML = this.content;
  }

  public setContent(content: string) {
    this.content = content;
    // this.refresh();
    if (content === this.component.innerHTML) {
      return;
    }
    this.refresh();
  }

  private mountEventBus(eventBus: EventBus) {
    eventBus.subscribe(BusEventTypes.recordAnchor, this.key, () => {
      const selection = document.getSelection();
      if (selection?.anchorNode && this.component.contains(selection.anchorNode)) {
        this.recordAnchor();
      }
      return false;
    });
    eventBus.subscribe(BusEventTypes.deleteEmpty, this.key, () => {
      if (document.contains(this.component)) return;
      this.destroy();
    });
    eventBus.subscribe(BusEventTypes.findEnterAnchor, this.key, () => {
      const selection = document.getSelection();
      if (selection?.anchorNode && this.component.contains(selection?.anchorNode)) {
        const offset = selection.anchorOffset;
        const content = this.getContent();
        const curContent = content.slice(0, offset);
        const nextContent = content.slice(offset);
        // this.setContent(curContent);
        this.inlineMountProps?.handleEnter(this.key,
          curContent.length === 0 ? undefined : {
            type: InlineStyleTypes.plainText,
            childList: [],
            content: curContent
          }, nextContent.length === 0 ? undefined : {
            type: InlineStyleTypes.plainText,
            childList: [],
            content: this.getContent().slice(offset)
          });
      }
    });

  }

  public mount(props: InlineMountProps) {
    this.mounted = true;
    this.inlineMountProps = props;
    this.mountEventBus(this.inlineMountProps.eventBus);
  }

  private recordAnchor() {
    if (!this.mounted) throw new Error('unmount component cannot use this function');
    const selection = document.getSelection();
    if (!selection) throw new Error('selection is null');
    if (!this.component.contains(selection.anchorNode)) {
      console.error(`active node is ${selection.anchorNode} instead of ${this.component}`);
    }

    this.content = this.component.innerHTML.replace(/&nbsp;/g, ' ');
    const offset = selection.anchorOffset;
    const curContent = this.content.slice(0, offset);
    const nextContent = this.content.slice(offset);
    this.setContent(curContent.replace(/\s/g, '&nbsp;'));
    const wbr = new Wbr({ type: InlineStyleTypes.wbr, childList: [] });
    if (nextContent.length) {
      const sibling = this.clone([], nextContent.replace(/\s/g, '&nbsp;'));
      this.inlineMountProps!.handleInsertSibling(this.key, [wbr, sibling], !(curContent.length));
    } else {
      this.inlineMountProps!.handleInsertSibling(this.key, [wbr], !(curContent.length));
    }
  }

  public setAnchor(offset: number = 0) {
    if (!this.mounted) throw new Error('no mount component cannot setAnchor');
    const selection = document.getSelection();
    if (offset === -1) {
      selection?.collapse(this.component, this.getContent.length + 1);
      return;
    }
    selection?.collapse(this.component, offset);
  }

  public clone(childList: InlineComponent[], content: string): PlainText {
    return new PlainText({ type: this.type, childList: [], content });
  }
}