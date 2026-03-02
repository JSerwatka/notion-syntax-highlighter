export type LanguageInfo = {
  language: string;
  canEdit: unknown;
  store: unknown;
  component?: string;
};

type FiberNodeProps = {
  language?: string;
  canEdit?: unknown;
  store?: unknown;
};

export type FiberNode = {
  memoizedProps?: FiberNodeProps;
  pendingProps?: FiberNodeProps;
  child?: FiberNode | null;
  sibling?: FiberNode | null;
  return?: FiberNode | null;
  type?: { name?: string } | null;
  elementType?: { name?: string } | null;
};
