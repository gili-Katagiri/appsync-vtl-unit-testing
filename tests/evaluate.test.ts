import {
  AppSyncClient,
  EvaluateMappingTemplateCommand,
} from '@aws-sdk/client-appsync';

import { readFileSync } from 'fs';

const template = readFileSync('./tests/template.vtl', 'utf8');
const context = readFileSync('./tests/context.json', 'utf8');
const contextJson = JSON.parse(context);

const client = new AppSyncClient({});

test('Evaluate the Resolvers', async () => {
  const command = new EvaluateMappingTemplateCommand({ template, context });

  const response = await client.send(command);

  // Error would be NOT thrown
  response.error != null && console.error(response.error);
  expect(response.error == null).toBe(true);

  // Detect remaining "references": `$util` | `$context` | ...
  expect(response.evaluationResult).not.toMatch(/\$util|\$context/);

  const result = JSON.parse(response.evaluationResult);
  expect(result.attributeValues.description.S).toEqual(
    `${contextJson.arguments.title} for ${contextJson.arguments.department} department with status ${contextJson.arguments.taskStatus}`,
  );
});
