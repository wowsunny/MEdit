import { notification } from 'antd';

export enum notifyType {
  diy = '',
  loginSuccessful = '登录成功.修改将定期自动保存',
  loginFailed = '登录失败.请检查网络并重试',
  registerSuccessful = '注册成功.请重新登录',
  registerFailed = '注册失败.请检查网络并重试',
  addArticleSuccessful = '成功.成功添加新文件',
  addArticleFailed = '失败.添加新文件失败',
  updateArticleSuccessful = '成功.成功修改文章',
  updateArticleFailed = '失败.修改文章失败'
}

const notify = (type: notifyType, message?:string) => {
  if (type === notifyType.diy)
    return notification.open({
      message: '服务器错误',
      description: message,
      duration: 1.5
    });
  return notification.open({
    message: type.split('.')[0],
    description: type.split('.')[1],
    duration: 1.5
  });
};

export default notify;