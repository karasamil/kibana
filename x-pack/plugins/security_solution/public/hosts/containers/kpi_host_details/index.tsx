/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getOr } from 'lodash/fp';
import React from 'react';
import { Query } from 'react-apollo';
import { connect, ConnectedProps } from 'react-redux';

import { KpiHostDetailsData, GetKpiHostDetailsQuery } from '../../../graphql/types';
import { inputsModel, inputsSelectors, State } from '../../../common/store';
import { createFilter, getDefaultFetchPolicy } from '../../../common/containers/helpers';
import { QueryTemplateProps } from '../../../common/containers/query_template';

import { kpiHostDetailsQuery } from './index.gql_query';

const ID = 'kpiHostDetailsQuery';

export interface KpiHostDetailsArgs {
  id: string;
  inspect: inputsModel.InspectQuery;
  kpiHostDetails: KpiHostDetailsData;
  loading: boolean;
  refetch: inputsModel.Refetch;
}

export interface QueryKpiHostDetailsProps extends QueryTemplateProps {
  children: (args: KpiHostDetailsArgs) => React.ReactNode;
}

const KpiHostDetailsComponentQuery = React.memo<QueryKpiHostDetailsProps & PropsFromRedux>(
  ({
    id = ID,
    children,
    endDate,
    filterQuery,
    indexNames,
    isInspected,
    skip,
    sourceId,
    startDate,
  }) => (
    <Query<GetKpiHostDetailsQuery.Query, GetKpiHostDetailsQuery.Variables>
      query={kpiHostDetailsQuery}
      fetchPolicy={getDefaultFetchPolicy()}
      notifyOnNetworkStatusChange
      skip={skip}
      variables={{
        sourceId,
        timerange: {
          interval: '12h',
          from: startDate!,
          to: endDate!,
        },
        filterQuery: createFilter(filterQuery),
        defaultIndex: indexNames ?? [],
        inspect: isInspected,
      }}
    >
      {({ data, loading, refetch }) => {
        const kpiHostDetails = getOr({}, `source.KpiHostDetails`, data);
        return children({
          id,
          inspect: getOr(null, 'source.KpiHostDetails.inspect', data),
          kpiHostDetails,
          loading,
          refetch,
        });
      }}
    </Query>
  )
);

KpiHostDetailsComponentQuery.displayName = 'KpiHostDetailsComponentQuery';

const makeMapStateToProps = () => {
  const getQuery = inputsSelectors.globalQueryByIdSelector();
  const mapStateToProps = (state: State, { id = ID }: QueryKpiHostDetailsProps) => {
    const { isInspected } = getQuery(state, id);
    return {
      isInspected,
    };
  };
  return mapStateToProps;
};

const connector = connect(makeMapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export const KpiHostDetailsQuery = connector(KpiHostDetailsComponentQuery);
