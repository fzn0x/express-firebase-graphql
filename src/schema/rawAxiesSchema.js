const util = require("node:util");

const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

const schema = {
  typeDefs: /* GraphQL */ `
    type Axies {
      axie_account_address: String
      axie_id: String
    }

    type GetRawAxies {
      axies(source: String, from: Int, limit: Int): [Axies]
    }

    schema {
      query: GetRawAxies
    }
  `,
  resolvers: {
    GetRawAxies: {
      async axies(_, { source, limit, from }) {
        const query = util.format(
          "SELECT * FROM `master-bruin-344906.raw_data.raw_axies_%s` LIMIT %s OFFSET %s",
          source,
          String(limit),
          String(from)
        );

        const options = {
          query: query,
        };

        const [job] = await bigquery.createQueryJob(options);
        const [rows] = await job.getQueryResults();

        return rows;
      },
    },
  },
};

module.exports = schema;
