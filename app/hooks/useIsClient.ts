import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

const useIsClient = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

export default useIsClient;
