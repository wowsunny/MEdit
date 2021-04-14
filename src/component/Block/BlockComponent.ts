import DefaultComponent, { DefaultComponentProps } from 'component/DefaultComponent';
import { DefaultDataItem } from 'types/ComponentTypes';
import EventBus, { BusEventTypes } from '../EventBus';

export interface BlockMountProps {
  handleInsertSiblings: (components: DefaultDataItem, replace: boolean) => void;
  handleEnter: (key: string, nextChildren: DefaultDataItem[]) => void;
  handleTab: (key: string, isInside: boolean) => void;
  handleDestroy: () => void;
}

export default abstract class BlockComponent extends DefaultComponent {

  public eventBus: EventBus;

  public showMarkdown: boolean;

  blockMountProps?: BlockMountProps;

  constructor(props: DefaultComponentProps) {
    super(props);
    this.eventBus = new EventBus();
    this.showMarkdown = false;
  }

  public unmount() {
    this.blockMountProps = undefined;
    this.mounted = false;
  }

  public destroy() {
    this.blockMountProps?.handleDestroy();
  }

  abstract setAnchor(offset: number): void;

  abstract oneStepToDelete: boolean;

  abstract getPosition(): [number, number];

  abstract detectAnchor(): boolean;

}
