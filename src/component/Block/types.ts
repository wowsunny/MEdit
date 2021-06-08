import { DefaultDataItem } from "types/ComponentTypes";
import FocusManager from "utils/editorTools/FocusManager";

export interface defaultBlockProps {
  id: string;
  mountValues: {
    childList: DefaultDataItem[];
    focusManager: FocusManager;
    content?: string;
    handleTab: (key: string, isInside: boolean) => void,
    handleInsertSiblings: (key: string, childList: DefaultDataItem[], replace: boolean) => void;
    handleDestroy: (key: string) => void;
  };
  dndValues: {
    indentationKey: string;
    getDataItem: (key: string) => DefaultDataItem;
    findIndex: (key: string) => number;
    dndMove: (sourceKey: string, targetIndex: number) => void;
  };
}