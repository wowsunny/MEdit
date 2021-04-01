import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import { DefaultDataItem } from 'types/ComponentTypes';
import EventBus, { BusEventTypes } from '../EventBus';

export interface BlockMountProps {
  handleInsertSiblings: (components: DefaultDataItem, replace: boolean) => void;
  [propName: string]: any;
}

export default abstract class BlockComponent extends DefaultComponent {

  public eventBus: EventBus;

  blockMountProps?: BlockMountProps;

  constructor(props: DefaultComponentProps) {
    super(props);
    this.eventBus = new EventBus();
  }

  public unmount() {
    this.blockMountProps = undefined;
    this.mounted = false;
  }

  public destroy() {
    this.childList = [];
  }

}
