import EventBus from 'component/EventBus';
import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { componentsToDataList } from 'utils/componentToData';

export interface InlineMountProps {
  eventBus: EventBus;
  handleEnter: (key: string, cur?: DefaultDataItem, next?: DefaultDataItem) => void;
  handleDestroy: (key: string) => void;
  handleInsertSibling: (key: string, components: DefaultComponent[], replace: boolean) => void;
}
export default abstract class InlineComponent extends DefaultComponent {
  public inlineMountProps?: InlineMountProps;

  constructor(props: DefaultComponentProps) {
    super(props);
  }

  onChildInsertSibling(key: string, siblings: DefaultComponent[], replace: boolean) {
    if (!this.mounted) throw new Error('unmounted component cannot use this function');
    const index = this.findChildIndex(key);
    siblings.forEach(sibling => {
      (this.component.childNodes[index] as Element).insertAdjacentElement('afterend', sibling.component);
      this.mountChild(sibling as InlineComponent);
    });
    if (replace) {
      this.childList.splice(index, 1, ...siblings);
      this.component.removeChild(this.component.childNodes[index]);
    } else {
      this.childList.splice(index + 1, 0, ...siblings);
    }

  }

  onChildEnter(key: string, _cur?: DefaultDataItem, _next?: DefaultDataItem) {
    if (!this.mounted) throw new Error('unmounted component cannot use this function');
    const index = this.findChildIndex(key);
    const curDataList = componentsToDataList(this.childList.slice(0, index) as InlineComponent[]);
    const nextDataList = componentsToDataList(this.childList.slice(index + 1) as InlineComponent[]);
    (_cur?.childList.length || _cur?.content?.length) && curDataList.push(_cur);
    (_next?.childList.length || _next?.content?.length) && nextDataList.unshift(_next);
    const cur = curDataList.length ? { type: BlockStyleTypes.paragragh, childList: curDataList } : undefined;
    const next = nextDataList.length ? { type: BlockStyleTypes.paragragh, childList: nextDataList } : undefined;
    this.inlineMountProps!.handleEnter(this.key, cur, next);
  }

  onChildDestroy(key: string) {
    const index = this.findChildIndex(key);
    this.childList.splice(index, 1);
    if (!this.childList.length) {
      this.destroy();
      return;
    }
    this.component.removeChild(this.component.childNodes[index]);
  }

  // mount but not contains
  public destroy() {
    if (!this.mounted) throw new Error('unmounted component cannot use this function');
    this.childList.forEach(child => child.destroy());
    this.inlineMountProps!.eventBus.remove(this.key);
    this.inlineMountProps!.handleDestroy(this.key);
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
  }

  public unmount() {
    this.inlineMountProps = undefined;
    this.mounted = false;
  }

  public mountChild(child: InlineComponent) {
    if (!this.mounted) throw new Error('unmounted component cannot use this function');
    const that = this;
    child.mount({
      eventBus: this.inlineMountProps!.eventBus,
      handleEnter: this.onChildEnter.bind(that),
      handleDestroy: this.onChildDestroy.bind(that),
      handleInsertSibling: this.onChildInsertSibling.bind(that)
    });
  }

  public appendChild(child: InlineComponent) {
    this.setChildList([...this.childList, child]);
    if (this.mounted) {
      this.mountChild(child);
    }
  }

  public destroyChild(key: string) {
    console.log('remove: ', key);
    const index = this.findChildIndex(key);
    this.childList.splice(index, 1);
    this.component.removeChild(this.component.childNodes[index]);
    this.inlineMountProps?.eventBus.remove(key);
  }

  abstract getContent(): string;
}
