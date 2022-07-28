const path = require("path");
const fs = require("fs");

const { makeExecutableSchema } = require("@graphql-tools/schema");
const { stitchSchemas } = require("@graphql-tools/stitch");

const subschemas = [];
const schemaDir = path.resolve(__dirname, "./schema");

fs.readdirSync(schemaDir).forEach((file) => {
  let schemaPath = path.join(schemaDir, file);
  let schema = require(schemaPath);
  subschemas.push({
    schema: makeExecutableSchema(schema),
  });
});

module.exports = stitchSchemas({
  subschemas,
});
