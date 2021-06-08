import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Menu, Modal as AntdModal } from 'antd';
import store from 'store';
import api from 'utils/api';
import './style.scss';
import { SyncOutlined, FileAddOutlined } from '@ant-design/icons';
import notify, { notifyType } from 'utils/notify';
import { ActionTypes } from 'types/storeTypes';

const AddFileModal = (props: { showModal: boolean, handleCancle: () => void }) => {
  const { showModal, handleCancle } = props;
  const inputRef = React.useRef<any>(null);
  const handleOk = () => {
    const value = inputRef.current.state.value;
    api.addArticle(value).then((res: any) => {
      if (res.status === 200) {
        notify(notifyType.addArticleSuccessful);
      }
      else notify(notifyType.addArticleFailed);
    });
    handleCancle();
  };

  return (
    <AntdModal title='添加新文件' visible={showModal} onOk={handleOk} onCancel={handleCancle}>
      <Input addonBefore='文件名' ref={inputRef} />
    </AntdModal>
  );
};


const Sider: React.FC = () => {
  const [articleList, setArticleList] = useState([]);
  const [curTitle, setCurTitle] = useState<string>();
  const [userName, setUserName] = useState(store.getState().userName);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showLoadComfirmModal, setShowLoadComfirmModal] = useState(false);
  let promise: Promise<any>;

  store.subscribe(() => {
    const { userName: user } = store.getState();
    if (user !== userName) {
      setUserName(user);
      console.log(user);
    }
  });

  useEffect(() => {
    refreshMenu();
  }, [userName]);

  const refreshMenu = async () => {
    console.log(userName);
    if (userName) {
      const res = await api.getArticleTitles();
      console.log(res);
      setArticleList(res.data);
      console.log('+++++++++++++++++++++++', userName);
    }
    else {
      setArticleList([]);
      console.log('========================', userName);
    }
  };

  async function* loadArticle(title: string) {
    const res = await api.getArticle(title);
    store.dispatch({ type: ActionTypes.changeArticle, curTitle: title });
    yield setShowLoadComfirmModal(true);
    const { content } = res.data;
    (window as any).activeEditor.loadContent(content);
  }

  const loadInterator = useMemo(() => {
    const interator = curTitle ? loadArticle(curTitle) : undefined;
    interator?.next();
    return interator;
  }, [curTitle]);

  const addNewFile = () => {
    if (!userName) {
      notify(notifyType.diy, '该操作需要登录');
      return;
    }
    setShowAddFileModal(true);
  };

  const notifyWords = userName ? '云端存档为空' : '查看云端存档，请先登录';

  return (
    <div className='siderContainer'>
      <div className='siderContent'>
        <div className='siderHeader'>
          <Button type='text' onClick={refreshMenu}><SyncOutlined /></Button>
          <Button type='text' onClick={addNewFile}><FileAddOutlined /></Button>
        </div>
        {articleList.length ?
          <Menu mode='inline' style={{ width: '100%' }}>
            {articleList.map(article => {
              return <Menu.Item key={article} onClick={() => setCurTitle(article)}>{article}</Menu.Item>;
            })}
          </Menu>
          : notifyWords}
      </div>
      <AddFileModal showModal={showAddFileModal} handleCancle={() => setShowAddFileModal((false))} />
      <AntdModal
        title='提示'
        visible={showLoadComfirmModal}
        onCancel={() => setShowLoadComfirmModal(false)}
        onOk={() => {
          loadInterator?.next();
          setShowLoadComfirmModal(false);
        }}
      >
        是否覆盖当前文件？
      </AntdModal>
    </div>
  );
};

export default Sider;