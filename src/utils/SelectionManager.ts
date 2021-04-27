export interface SelectionManagerProps {
  ref: React.RefObject<HTMLElement>;
}

export default class SelectionManager {
  target: Element;

  constructor(props: SelectionManagerProps) {
    const { ref } = props;
    if (!ref.current) throw new Error();
    this.target = ref.current;
  }

  private getSelection(): Selection | null {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode || !this.target.contains(selection.anchorNode)) {
      console.warn('no selection');
      return null;
    }
    return selection;
  }

  public getPosition(): number | null {
    const selection = getSelection();
    if (!selection) return null;
    if (!selection.isCollapsed) {
      console.warn('no collapsed');
    }

    const traverse = (node: Node): number => {
      if (node.nodeName === '#text') {
        return (node as Text).data.length;
      }
      const children = node.childNodes;
      let result = 0;
      children.forEach(item => {
        result += traverse(item);
      });
      return result;
    };

    const getOffset = (child: Node, curPosition: number, targetParent: Node): number => {
      if (child === targetParent) return curPosition;
      let curChild = child;
      let offset = curPosition;
      while (curChild.previousSibling) {
        offset += traverse(curChild.previousSibling);
        curChild = curChild.previousSibling;
      }
      if (!child.parentNode) {
        console.warn('no parent');
        return offset;
      }
      return getOffset(child.parentNode, offset, targetParent);
    };
    return getOffset(selection.anchorNode!, selection.anchorOffset, this.target);
  }

  private setPosition() {
    console.log(this.target);
  }


  public record() {
    const selection = this.getSelection();
    if (!selection) return;
    const anchor = selection.anchorNode;
    if (anchor!.nodeName !== '#text') {
      console.warn(`anchor is ${typeof anchor} ${anchor}instead of Text`);
    }
    const next = (anchor as Text).splitText(selection.anchorOffset);
    next.parentElement?.insertBefore(document.createElement('wbr'), next);
  }

  public parse() {
    const wbr = this.target.querySelector('wbr');
    if (!wbr) return;
    const selection = window.getSelection();
    selection?.collapse(wbr, 0);
    wbr.parentNode?.removeChild(wbr);
  }

}