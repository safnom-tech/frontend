import type { ComposedNode, ComposedSectionDefinition } from "@/types/composed-section";

export function cloneNode(node: ComposedNode): ComposedNode {
  return JSON.parse(JSON.stringify(node)) as ComposedNode;
}

export function cloneSection(section: ComposedSectionDefinition): ComposedSectionDefinition {
  return JSON.parse(JSON.stringify(section)) as ComposedSectionDefinition;
}

export function getNodeAtPath(root: ComposedNode, path: number[]): ComposedNode | null {
  let current: ComposedNode = root;
  for (const index of path) {
    const children = current.children;
    if (!children || index < 0 || index >= children.length) return null;
    current = children[index]!;
  }
  return current;
}

export function updateNodeAtPath(
  root: ComposedNode,
  path: number[],
  updater: (node: ComposedNode) => ComposedNode
): ComposedNode {
  if (path.length === 0) {
    return updater(cloneNode(root));
  }
  const [head, ...rest] = path;
  const nextRoot = cloneNode(root);
  const children = [...(nextRoot.children ?? [])];
  const child = children[head];
  if (!child) return root;
  children[head] = updateNodeAtPath(child, rest, updater);
  nextRoot.children = children;
  return nextRoot;
}

export function updateNodeProp(
  root: ComposedNode,
  path: number[],
  prop: string,
  value: unknown
): ComposedNode {
  return updateNodeAtPath(root, path, (node) => ({
    ...node,
    props: { ...(node.props ?? {}), [prop]: value },
  }));
}

export function removeNodeAtPath(root: ComposedNode, path: number[]): ComposedNode {
  if (path.length === 0) return root;
  if (path.length === 1) {
    const nextRoot = cloneNode(root);
    const children = [...(nextRoot.children ?? [])];
    children.splice(path[0]!, 1);
    nextRoot.children = children.length ? children : undefined;
    return nextRoot;
  }
  const [head, ...rest] = path;
  const nextRoot = cloneNode(root);
  const children = [...(nextRoot.children ?? [])];
  const child = children[head];
  if (!child) return root;
  children[head] = removeNodeAtPath(child, rest);
  nextRoot.children = children;
  return nextRoot;
}

export function pathKey(path: number[]): string {
  return path.length ? path.join(".") : "root";
}
