export enum BusEventTypes {
  refresh = 'refresh',
  recordAnchor = 'recordAnchor',
  parseAnchor = 'parseAnchor',
  showMarkdown = 'showMarkdown',
  selectState = 'selectState',
  findEnterAnchor = 'findEnterAnchor',
  deleteEmpty = 'deleteEmpty',
  insertSibling = 'insertSibling'
}

export type TaskList = Array<{
  type: BusEventTypes,
  listeners: { key: string, func: Function }[]
}>;

export default class EventBus {
  taskList: TaskList;

  constructor() {
    this.taskList = [];
  }

  dispatch(type: BusEventTypes, values?: { [propName: string]: any }, once: boolean = false, inCase?: () => void) {
    const task = this.taskList.find(item => item.type === type);
    if (!task) {
      inCase && inCase();
      console.error('no task exist in type: ', type);
      return;
    }
    // task.listeners.forEach(listener => listener.func(values));
    for (let i = 0; i < task.listeners.length; i++) {
      const result = task.listeners[i].func(values);
      if (once && result) break;
    }
  }

  subscribe(type: BusEventTypes, key: string, func: Function) {
    const task = this.taskList.find(item => item.type === type);
    if (task) {
      if (task.listeners.find(item => item.key === key))
        console.error('repeat listener: ', key, type);
      task.listeners.push({ key, func });
    } else {
      this.taskList.push({ type, listeners: [{ key, func }] });
    }
  }

  remove(key: string) {
    this.taskList.forEach(task => {
      const index = task.listeners.findIndex(item => item.key === key);
      if (index < 0) return;
      task.listeners.splice(index, 1);
    });
  }

  clean() {
    this.taskList = [];
  }

  getKeysOnType(type: BusEventTypes) {
    return this.taskList.find(task => task.type === type)?.listeners.map(item => item.key);
  }
}