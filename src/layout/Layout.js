import React from 'react';
import './Layout.scss';
import { Outlet } from 'react-router-dom';
import Header from '../component/header/Header';
import Footer from '../component/footer/Footer';
import ErrorBoundary from './ErrorBoundary';

const Layout = () => {
  return (
    <div className='main'>       
        <div className='mainnav'>
          <Header/>
        </div>
        <div className='pageContainer'>
          <ErrorBoundary>
            <Outlet />
            <Footer/>
          </ErrorBoundary>
        </div>
    </div>
    
  )
}

export default Layout