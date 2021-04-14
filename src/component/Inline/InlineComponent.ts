import EventBus, { BusEventTypes } from 'component/EventBus';
import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import { BlockStyleTypes, DefaultDataItem, InlineStyleTypes } from 'types/ComponentTypes';
import { componentsToDataList } from 'utils/componentToData';
import './style.scss';

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
    let temp = index;
    siblings.forEach(sibling => {
      console.log(this.component.childNodes[temp], this.component.innerHTML);
      (this.component.childNodes[temp] as Element).insertAdjacentElement('afterend', sibling.component);
      this.mountChild(sibling as InlineComponent);
      temp += 1;
    });
    if (replace) {
      console.log('replace child: ', this.childList[index].key);
      this.inlineMountProps?.eventBus.remove(this.childList[index].key);
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
    const cur = curDataList.length ? { type: this.type, childList: curDataList } : undefined;
    const next = nextDataList.length ? { type: this.type, childList: nextDataList } : undefined;
    this.inlineMountProps!.handleEnter(this.key, cur, next);
  }

  onChildDestroy(key: string) {
    console.log('destroy:', key);
    const index = this.findChildIndex(key);
    if (document.contains(this.childList[index].component))
      this.component.removeChild(this.component.childNodes[index]);
    this.childList.splice(index, 1);
    if (!this.childList.length) {
      this.destroy();
    }

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
    this.inlineMountProps.eventBus.subscribe(BusEventTypes.showMarkdown, this.key, (values: { show: boolean }) => {
      const { show } = values;
      if (this.component.getAttribute('class') && (!!this.component.getAttribute('class')!.match(/mark/) === show)) return;
      this.component.setAttribute('class', `${this.type}-${show ? 'mark' : ''}`);
    });
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
    this.inlineMountProps?.eventBus.remove(key);
    const childNode = this.component.childNodes[index];
    if (childNode && this.component.contains(childNode))
      this.component.removeChild(this.component.childNodes[index]);
  }

  abstract getContent(): string;
}
