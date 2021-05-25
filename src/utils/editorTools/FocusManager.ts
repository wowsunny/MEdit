/**
 * FocusManager是用来根据全局光标位置控制showmarkdown变量的
 * 同时还兼顾选中一个或多个块状组件时的逻辑
 */
export interface FocusManagerProps {
  rootRef: React.RefObject<HTMLDivElement>;
}
export default class FocusManager {
  public rootRef: React.RefObject<HTMLDivElement>;

  private inited: boolean = false;

  public componentList: { key: string, detectAnchor: () => boolean }[];

  constructor(props: FocusManagerProps) {
    const { rootRef } = props;
    this.rootRef = rootRef;
    // just EditableBlock
    this.componentList = [];
    this.init();
  }

  public init() {
    if (!this.rootRef.current) return;
    if (this.inited) return;
    this.rootRef.current!.addEventListener('click', e => {
      let flag = false;
      this.componentList.forEach(component => {
        if (component.detectAnchor()) flag = true;
      });
      if (!flag) console.error('cannot find anchor');
    });

    this.rootRef.current!.addEventListener('keydown', e => {
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        let flag = false;
        this.componentList.forEach(component => {
          if (component.detectAnchor()) flag = true;
        });
        if (!flag) console.error('cannot find anchor');
      }
    });
  }

  public reRank() {

  }

  public register(key: string, detectAnchor: () => boolean) {
    this.componentList.push({ key, detectAnchor });
    this.reRank();
  }

  public remove() {

  }





}