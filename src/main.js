import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';

import store from '@/store/index'; // short for @/store/index

import Index from '@/views/Index.vue';

const routes = [
	{
		path: '/',
		name: 'Index',
		component: Index
	}
];

const router = createRouter( {
	history: createWebHistory(),
	routes
} );

const app = createApp( App )
	.use( ElementPlus )
	.use( router )
	.use( store );
app.mount( '#app' );
