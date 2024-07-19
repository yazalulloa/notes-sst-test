import {Api, Config, StackContext, use} from "sst/constructs";
import {StorageStack} from "./StorageStack";

export function ApiStack({stack, app}: StackContext) {
  const {table} = use(StorageStack);
  const STRIPE_SECRET_KEY = new Config.Secret(stack, "STRIPE_SECRET_KEY");
  // Create the API
  const api = new Api(stack, "Api", {
    cors: true,
    // customDomain: app.stage === "prod" ? "<api.yourdomainhere.com>" : undefined,
    defaults: {
      authorizer: "iam",
      function: {
        bind: [table, STRIPE_SECRET_KEY],
      },
    },
    routes: {
      "POST /notes": "packages/functions/src/create.main",
      "PUT /notes/{id}": "packages/functions/src/update.main",
      "GET /notes/{id}": "packages/functions/src/get.main",
      "GET /notes": "packages/functions/src/list.main",
      "DELETE /notes/{id}": "packages/functions/src/delete.main",
      "POST /billing": "packages/functions/src/billing.main",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
  });

  // Return the API resource
  return {
    api,
  };
}
