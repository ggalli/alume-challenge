import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://lldev.thespacedevs.com/2.2.0',
  params: {
    include_suborbital: true,
    lsp__name: 'spacex',
    limit: 100
  },
});
