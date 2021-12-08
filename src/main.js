import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';

import store from '@/store/index'; // short for @/store/index

const app = createApp( App );

app.use( ElementPlus );
app.use( store );
app.mount( '#app' );
