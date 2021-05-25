import * as React from 'react';
import api from 'utils/api';
import { Button, Checkbox, Dropdown, Form, Input, Menu, Modal, Select } from 'antd';
import { MoreOutlined, LoginOutlined, DownloadOutlined, ConsoleSqlOutlined } from '@ant-design/icons';
import notify, { notifyType } from 'utils/notify';
import { fileDownload } from 'utils/download';
import fontFamilyIcon from 'asset/svg/font-family.svg';

const { Option } = Select;
const { SubMenu } = Menu;

export default () => {
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showExportModal, setShowExportModal] = React.useState(false);

  const [form] = Form.useForm();

  const handleLogin = async (values: any) => {
    setShowLoginModal(false);
    const p = await api.login(values.userName, values.password);
    if (p.status == 200) {
      notify(notifyType.loginSuccessful);
      const res = await api.getArticle('user2', 'title1');
      console.log(res);
    }
  };

  const hanldeExport = (values: any) => {
    setShowExportModal(false);
    if (values.format === 'pdf') {
      setTimeout(() => window.print(), 66.7);
      return;
    }
    const md = (window as any).activeEditor?.getMarkdown();
    console.log(md);
    fileDownload('file', md);
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

  const menu = React.useMemo(() => (
    <Menu>
      <Menu.Item icon={<LoginOutlined />} onClick={() => setShowLoginModal(true)}>
        登录
      </Menu.Item>
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
  ), []);

  return (
    <div className='headerMenu'>
      <Dropdown overlay={menu} trigger={['click']}>
        <MoreOutlined className='antd-icon' />
      </Dropdown>

      <Modal title='登录' visible={showLoginModal} onCancel={() => setShowLoginModal(false)} footer={null}>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
        >
          <Form.Item
            label="UserName"
            name="userName"
            rules={[{ required: true, message: 'Please input your userName!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
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
      </Modal>

      <Modal title='导出' visible={showExportModal} onCancel={() => setShowExportModal(false)} footer={null}>
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
    </div>
  );
};