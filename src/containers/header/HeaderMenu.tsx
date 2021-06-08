import * as React from 'react';
import api from 'utils/api';
import { Button, Checkbox, Dropdown, Form, Input, Menu, Modal, Select, Tabs } from 'antd';
import { MoreOutlined, LoginOutlined, DownloadOutlined, ConsoleSqlOutlined, LogoutOutlined } from '@ant-design/icons';
import notify, { notifyType } from 'utils/notify';
import { fileDownload } from 'utils/download';
import fontFamilyIcon from 'asset/svg/font-family.svg';
import store from 'store';
import { ActionTypes } from 'types/storeTypes';

const { Option } = Select;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

const LoginModal = (props: { visible: boolean, handleCancle: () => void }) => {
  const { visible, handleCancle } = props;
  const [signInForm] = Form.useForm();
  const handleLogin = async (values: any) => {
    handleCancle();
    const res = await api.login(values.userName, values.password);
    if (res.status === 200) {
      const { userName } = res.data;
      notify(notifyType.loginSuccessful);
      store.dispatch({ type: ActionTypes.login, userName });
    }
  };
  const handleRegister = async (values: any) => {
    handleCancle();
    const res = await api.register(values.userName, values.password);
    if (res.status === 200) {
      const message = res.data;
      notify(notifyType.registerSuccessful);
    }
  };

  return (
    <Modal visible={visible} onCancel={handleCancle} footer={null}>
      <Tabs defaultActiveKey='1'>
        <TabPane tab='登录' key='1'>
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
          >
            <Form.Item
              label="UserName"
              name="userName"
              rules={[{ required: true, message: '请输入你的用户名' }]}
            >
              <Input type='text' />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: '请输入你的密码' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }} name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 18, span: 16 }}>
              <Button type='primary' htmlType='submit'>submit</Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab='注册' key='2'>
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            name="basic"
            onFinish={handleRegister}
            form={signInForm}
          >
            <Form.Item
              label="UserName"
              name="userName"
              rules={[{ required: true, message: '请输入你的用户名' }, { min: 4, message: '用户名不能少于4个字符' }]}
            >
              <Input type='text' />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: '请输入你的密码' }, { min: 4, message: '密码不能少于4个字符' }, {
                pattern: /^(?:[0-9]|[a-z]|[A-Z])+$/, message: '密码只能由大小写字母和数字组成'
              }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Password Again"
              name="passwordAgain"
              rules={[{ required: true, message: 'Please input your password again!' }, {
                validator: (rule, value, callback) => {
                  const { getFieldValue } = signInForm;
                  if (value && value !== getFieldValue('password')) {
                    callback('两次输入不一致！');
                  }
                  callback();
                }
              }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 18, span: 16 }}>
              <Button type='primary' htmlType='submit'>submit</Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

const ExporModal = (props: { visible: boolean, handleCancle: () => void }) => {
  const { visible, handleCancle } = props;

  const hanldeExport = (values: any) => {
    handleCancle();
    if (values.format === 'pdf') {
      setTimeout(() => window.print(), 66.7);
      return;
    }
    const md = (window as any).activeEditor?.getMarkdown();
    console.log(md);
    fileDownload('file', md);
  };

  return (
    <Modal title='导出' visible={visible} onCancel={handleCancle} footer={null}>
      <Form
        onFinish={hanldeExport}
      >
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label='导出格式'
          name='format'
          initialValue='pdf'
        >
          <Select>
            <Option value='pdf'>pdf</Option>
            <Option value='markdown'>markdown</Option>
          </Select>
        </Form.Item>
        <Form.Item
          wrapperCol={{ offset: 18, span: 16 }}
        >
          <Button type='primary' htmlType='submit'>submit</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const handleChangeFont = (type: string) => {
  const body = document.getElementsByTagName('body')[0];
  switch (type) {
    case 'default':
      body.setAttribute('style', 'font-family: Times New Roman');
      break;
    case 'songti':
      body.setAttribute('style', 'font-family: 宋体');

      break;
    case 'kaiti':
      body.setAttribute('style', 'font-family: 楷体');

      break;
    case 'shoujin':
      // eslint-disable-next-line
      require('./fontFace/shoujin.scss');
      body.setAttribute('style', 'font-family: shoujin');
      break;
    case 'shouxie':
      // eslint-disable-next-line
      require('./fontFace/shouxie.scss');
      body.setAttribute('style', 'font-family: shouxie');
      break;

    default:
      break;
  }
};
export default () => {
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [userName, setUserName] = React.useState(store.getState().userName);
  const [form] = Form.useForm();

  store.subscribe(() => {
    const { userName: user } = store.getState();
    if (userName !== user) {
      setUserName(user);
    }
  });

  const menu = React.useMemo(() => (
    <Menu>
      {userName ?
        <Menu.Item icon={<LogoutOutlined />} onClick={() => store.dispatch({ type: ActionTypes.login, userName: undefined })}>
          {`登出${userName}`}
        </Menu.Item> :
        <Menu.Item icon={<LoginOutlined />} onClick={() => setShowLoginModal(true)}>
          登录
        </Menu.Item>}
      <Menu.Item icon={<DownloadOutlined />} onClick={() => setShowExportModal(true)}>
        导出
      </Menu.Item>
      <SubMenu icon={(<img className='icon-svg' src={fontFamilyIcon} alt='icon' />)} title='更换字体'>
        <Menu.Item onClick={() => handleChangeFont('default')}>
          默认
        </Menu.Item>
        <Menu.Item onClick={() => handleChangeFont('kaiti')}>
          楷体
        </Menu.Item>
        <Menu.Item onClick={() => handleChangeFont('songti')}>
          宋体
        </Menu.Item>
        <Menu.Item onClick={() => handleChangeFont('shoujin')}>
          瘦金体
        </Menu.Item>
        <Menu.Item onClick={() => handleChangeFont('shouxie')}>
          手写体
        </Menu.Item>
      </SubMenu>
    </Menu>
  ), [userName]);

  return (
    <div className='headerMenu'>
      <Dropdown overlay={menu} trigger={['click']}>
        <MoreOutlined className='antd-icon' />
      </Dropdown>
      <LoginModal visible={showLoginModal} handleCancle={() => setShowLoginModal(false)} />
      <ExporModal visible={showExportModal} handleCancle={() => setShowExportModal(false)} />
    </div>
  );
};