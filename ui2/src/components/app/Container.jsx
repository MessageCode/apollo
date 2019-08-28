import React, { useState } from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import './Container.css';

export const Container = ({ title, component: Component, match, location, ...props }) => {
  const breadcrumbHomePath = [{ path: '/home', title: 'Home' }];
  const [breadcrumbs, setBreadcrumbs] = useState(breadcrumbHomePath);

  const parseSearchUrl = searchUrl =>
    searchUrl
      .split('?')
      .pop()
      .split('&')
      .map(searchParam => searchParam.split('=').shift());

  const handleBreadcrumbs = (path, title) => {
    // debugger
    let prevBreadcrumbs = null;
    if (location.search.length) {
      const queryKeys = parseSearchUrl(path);
      prevBreadcrumbs = queryKeys.map((queryKey, index) => {
        const currentPath = `${match.url}/${queryKey}`;
        const prevSearchParamas = location.search.split(`&${queryKey}`).shift();
        return {
          path: queryKeys[index - 1] ? `${currentPath}${prevSearchParamas}` : `${currentPath}`,
          title: queryKey,
        };
      });
      prevBreadcrumbs.map(prevBreadcrumb => {
        return breadcrumbs.map(({ path }) => {
          if (path === prevBreadcrumb.path) {
            prevBreadcrumbs = null;
          }
        });
      });
    }

    const breadcrumbIndex = breadcrumbs.findIndex(breadcrumb => breadcrumb.path === path);
    if (~breadcrumbIndex) {
      setBreadcrumbs(breadcrumbs.slice(0, breadcrumbIndex + 1));
    } else {
      const currentBreadcrumb = { path, title };
      prevBreadcrumbs
        ? setBreadcrumbs([...breadcrumbs, ...prevBreadcrumbs, currentBreadcrumb])
        : setBreadcrumbs([...breadcrumbs, currentBreadcrumb]);
    }
  };

  const resetBreadcrumbs = () => {
    // debugger
    setBreadcrumbs(breadcrumbHomePath);
  };

  return (
    <div className="container">
      <div className="container-title large-title">{title}</div>
      <div className="container-breadcrumbs">
        <Breadcrumb>
          {breadcrumbs.map(({ path, title }, index) => (
            <Breadcrumb.Item key={index} className="container-breadcrumb">
              <Link to={path}>{title}</Link>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
      <div className="container-content">
        <Component
          handleBreadcrumbs={handleBreadcrumbs}
          resetBreadcrumbs={resetBreadcrumbs}
          match={match}
          location={location}
          {...props}
        />
      </div>
    </div>
  );
};
