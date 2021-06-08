const axios = require('axios');

axios.defaults.withCredentials = true;
const path = 'http://127.0.0.1:8888';
// const path = 'http://39.96.29.41:8888';
console.log(axios.defaults);
export default {
  register: async (userName: string, password: string) => {
    const api = `${path}/register?userName=${userName}&password=${password}`;
    return axios.get(api);
  },
  login: async (userName: string, password: string) => {
    const api = `${path}/login`;
    const values = {
      userName,
      password
    };
    return axios.post(api, values);
  },
  getArticle: (title: string) => {
    const api = `${path}/getArticleContentByTiTle?title=${title}`;
    return axios.get(api);
  },
  getArticleTitles: () => {
    const api = `${path}/getArticleTitles`;
    return axios.get(api);
  },
  addArticle: (title: string) => {
    const api = `${path}/addArticle?title=${title}`;
    return axios.get(api);
  },
  saveArticle: (title: string, content: string) => {
    const api = `${path}/saveArticle?title=${title}&content=${content}`;
    return axios.get(api);
  }
};