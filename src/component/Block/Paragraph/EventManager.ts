export interface EventManagerProps {
  target: Element;
  handleEnter: () => void;
  handleCtrlEnter: () => void;
  handleDelete: (isKeyDown: boolean) => void;
  handleReParse: () => void;
  handleTab: (isInside: boolean) => void;

}
export default class EventManager {
  target: Element;

  isCtrlPress: boolean;

  isShiftPress: boolean;

  isComposing: boolean;

  onEnter: () => void;

  onCtrlEnter: () => void;

  onDelete: (isKeyDown: boolean) => void;

  reParse: () => void;

  isInputing: boolean;

  onTab: (isInside: boolean) => void;

  constructor(props: EventManagerProps) {
    const { target, handleEnter, handleCtrlEnter, handleDelete, handleReParse, handleTab } = props;
    this.target = target;
    this.onEnter = handleEnter;
    this.onCtrlEnter = handleCtrlEnter;
    this.onDelete = handleDelete;
    this.reParse = handleReParse;
    this.onTab = handleTab;
    this.isComposing = false;
    this.isInputing = false;
    this.isCtrlPress = false;
    this.isShiftPress = false;
    this.init();
  }

  init() {
    this.target.addEventListener('keydown', (e: any) => {
      if (e.code === 'ControlLeft') {
        this.isCtrlPress = true;
      } else if (e.code === 'ShiftLeft') {
        this.isShiftPress = true;
      }

      if (this.isComposing) return;
      if (e.code === 'Backspace' || e.code === 'Delete') {
        // something
        this.onDelete(true);

      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (this.isCtrlPress) this.onCtrlEnter();
        else this.onEnter();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        this.onTab(!this.isShiftPress);
      }
    });

    this.target.addEventListener('input', (e: InputEventInit) => {
      if (e.inputType?.match(/insert/)) {
        this.isInputing = true;
      }
      if (e.inputType === 'deleteContentForward' || e.inputType === 'deleteContentBackward') {
        console.log('delete trigger');
        this.onDelete(false);
      }
    });
    this.target.addEventListener('compositionstart', (e: InputEventInit) => {
      this.isComposing = true;
    });
    this.target.addEventListener('compositionend', (e: InputEventInit) => {
      this.isComposing = false;
    });
    this.target.addEventListener('keyup', (e: any) => {
      if (e.code === 'ControlLeft') {
        this.isCtrlPress = false;
      } else if (e.code === 'ShiftLeft') {
        this.isShiftPress = false;
      }

      if (this.isComposing || !this.isInputing) return;
      // 触发解析
      this.reParse();
      this.isInputing = false;
    });
  }
}