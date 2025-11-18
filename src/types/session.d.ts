import { ComponentType } from 'react';

declare module '../session/withAuthentication' {
  declare function withAuthentication<P>(Component: ComponentType<P>): ComponentType<P>;
  export default withAuthentication;
}

declare module '../session/withAuthorization' {
  declare function withAuthorization(needsAuthorization: boolean): <P>(Component: ComponentType<P>) => ComponentType<P>;
  export default withAuthorization;
}
