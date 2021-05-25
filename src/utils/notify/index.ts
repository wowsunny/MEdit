import { notification } from 'antd';

export enum notifyType {
  loginSuccessful = '登录成功.修改将定期自动保存',
  loginFailed = '登录失败.请检查网络并重试'
}

const notify = (type: notifyType) => {
  return notification.open({
    message: type.split('.')[0],
    description: type.split('.')[1],
    duration: 1.5
  });
};

export default notify;