/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { UsageCollectionSetup } from 'src/plugins/usage_collection/server';
import { LegacyAPICaller } from 'kibana/server';
import { TelemetryCollector } from '../../types';

import { workpadCollector } from './workpad_collector';
import { customElementCollector } from './custom_element_collector';

const collectors: TelemetryCollector[] = [workpadCollector, customElementCollector];

/*
  Register the canvas usage collector function

  This will call all of the defined collectors and combine the individual results into a single object
  to be returned to the caller.

  A usage collector function returns an object derived from current data in the ES Cluster.
*/
export function registerCanvasUsageCollector(
  usageCollection: UsageCollectionSetup | undefined,
  kibanaIndex: string
) {
  if (!usageCollection) {
    return;
  }

  const canvasCollector = usageCollection.makeUsageCollector({
    type: 'canvas',
    isReady: () => true,
    fetch: async (callCluster: LegacyAPICaller) => {
      const collectorResults = await Promise.all(
        collectors.map((collector) => collector(kibanaIndex, callCluster))
      );

      return collectorResults.reduce((reduction, usage) => {
        return { ...reduction, ...usage };
      }, {});
    },
  });

  usageCollection.registerCollector(canvasCollector);
}
