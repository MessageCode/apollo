import React from 'react';
import { connect } from 'react-redux';
import { Switch, Redirect, Route } from 'react-router-dom';
import { getServices, getServicesStack, getEnvironment, getEnvironmentsStack } from '../deploymentActions';
import SelectService from './SelectService';
import SelectEnv from './SelectEnv';
import SelectGrourp from './SelectGroup'; //temp placeholder

const NewDeploymentComponent = ({
  handleBreadcrumbs,
  getServices,
  services,
  getServicesStack,
  match,
  servicesStacks,
  getEnvironment,
  getEnvironmentsStack,
  environment,
  environmentsStacks,
}) => {
  return (
    <Switch>
      <Route
        path={`${match.url}/service`}
        render={({ match }) => (
          <SelectService
            handleBreadcrumbs={handleBreadcrumbs}
            match={match}
            getServices={getServices}
            services={services}
            getServicesStack={getServicesStack}
            servicesStacks={servicesStacks}
          />
        )}
      />
      <Route
        path={`${match.url}/environment`}
        render={({ match }) => (
          <SelectEnv
            handleBreadcrumbs={handleBreadcrumbs}
            match={match}
            getEnvironment={getEnvironment}
            getEnvironmentsStack={getEnvironmentsStack}
            environment={environment}
            environmentsStacks={environmentsStacks}
          />
        )}
      />
      <Route
        path={`${match.url}/group`}
        render={({ match }) => <SelectGrourp handleBreadcrumbs={handleBreadcrumbs} match={match} />}
      />
      <Redirect to={`${match.url}/service`} />
    </Switch>
  );
};

const mapStateToProps = state => {
  const {
    deploy: { services, isLoading, servicesStacks, selectedServices, environment, environmentsStacks },
  } = state;
  return {
    services,
    isLoading,
    servicesStacks,
    selectedServices,
    environment,
    environmentsStacks,
  };
};

const NewDeployment = connect(
  mapStateToProps,
  { getServices, getServicesStack, getEnvironment, getEnvironmentsStack },
)(NewDeploymentComponent);

export default NewDeployment;
