export interface EventManagerProps {
  target: Element;
  handleEnter: () => void;
  handleDelete: () => void;
  handleReParse: () => void;
}
export default class EventManager {
  target: Element;

  isComposing: boolean;

  onEnter: () => void;

  onDelete: () => void;

  reParse: () => void;

  isInputing: boolean;

  constructor(props: EventManagerProps) {
    const { target, handleEnter, handleDelete, handleReParse } = props;
    this.target = target;
    this.onEnter = handleEnter;
    this.onDelete = handleDelete;
    this.reParse = handleReParse;
    this.isComposing = false;
    this.isInputing = false;
    this.init();
  }

  init() {
    this.target.addEventListener('keydown', (e: any) => {
      if (this.isComposing) return;
      if (e.code === 'Backspace' || e.code === 'Delete') {
        // console.log('delete trigger');
        // this.onDelete();
        // e.preventDefault();
      } else if (e.code === 'Enter') {
        this.onEnter();
        e.preventDefault();
      }
    });
    this.target.addEventListener('input', (e: InputEventInit) => {
      if (e.inputType?.match(/insert/)) {
        this.isInputing = true;
      }
      if (e.inputType === 'deleteContentForward' || e.inputType === 'deleteContentBackward') {
        console.log('delete trigger');
        this.onDelete();
      }
    });
    this.target.addEventListener('compositionstart', (e: InputEventInit) => {
      this.isComposing = true;
    });
    this.target.addEventListener('compositionend', (e: InputEventInit) => {
      this.isComposing = false;
    });
    this.target.addEventListener('keyup', (e: any) => {
      if (this.isComposing || !this.isInputing) return;
      // 触发解析
      this.reParse();
      this.isInputing = false;
    });
  }
}