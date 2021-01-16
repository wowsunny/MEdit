/*接收content和styleList，维护rendererList*/
export class InlineStyleManager {
  public rendererList: componentStyle.inlineRenderer[];
  constructor(content: string, styleList: componentStyle.inlineStyleList){
    this.rendererList = [];
  }
  public getHTML(): Element|void {
    
  }
}