import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import { DefaultDataItem } from 'types/ComponentTypes';
import EventBus, { BusEventTypes } from '../EventBus';

export interface BlockMountProps {
  handleInsertSiblings: (components: DefaultDataItem, replace: boolean) => void;
  handleEnter: (key: string, nextChildren: DefaultDataItem[]) => void;
  handleTab: (key: string, isInside: boolean) => void;
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

  // TODO to finish
  public destroy() {
    this.childList = [];
  }

  abstract oneStepToDelete: boolean;

}
