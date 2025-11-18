import { LayoutGuest, LayoutUser } from './base';
import Footer from './footer';
import Head from './head';
import MainMenu, { PublicMenu } from './menu';
import SimplePaginate from './paginate';
import { fromObjectToList, truncate, slugify, randomString, DisplayTimeAgo } from './utils';

export { Head, MainMenu, PublicMenu, LayoutGuest, LayoutUser, Footer, SimplePaginate,
fromObjectToList, truncate, slugify, randomString, DisplayTimeAgo }; 