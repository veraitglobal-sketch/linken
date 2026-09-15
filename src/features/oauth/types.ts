export type ConsentCompany = {
  id: string;
  name: string;
  agentApi: boolean;
};

export type AuthorizeQuery = {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string | null;
  scope: string;
  resource: string | null;
  rawSearch: string;
};
