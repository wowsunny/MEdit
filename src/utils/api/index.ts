const axios = require('axios');

axios.defaults.withCredentials = true;
console.log(axios.defaults);
export default {
  register: async (userName: string, password: string) => {
    const api = `http://127.0.0.1:8888/register?userName=${userName}&password=${password}`;
    axios.get(api)
      .then((response: any) => {
        console.log(response);
      });
  },
  login: async (userName: string, password: string) => {
    const api = 'http://127.0.0.1:8888/login';
    const values = {
      userName,
      password
    };
    return axios.post(api, values);
  },
  getArticle: (user: string, title: string) => {
    const api = `http://127.0.0.1:8888/getArticleContentByTiTle?user=${user}&title=${title}`;
    axios.get(api)
      .then((response: any) => {
        console.log(response);
      });
  }
};