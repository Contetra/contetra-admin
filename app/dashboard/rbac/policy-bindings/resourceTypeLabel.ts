const titleCase = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * "admin_tab:blog:all-blogs" -> { group: "Blog", label: "All Blogs" }
 * "admin_tab:rbac" (action "edit") -> { group: "RBAC", label: "RBAC tab (edit)" }
 */
export function describeResourceType(
  resourceType: string,
  action?: string,
): { group: string; label: string } {
  const [, tab, sub] = resourceType.split(":");
  const tabLabel = tab ? titleCase(tab) : resourceType;
  const actionSuffix = action && action !== "view" ? ` (${action})` : "";

  if (sub) {
    return { group: tabLabel, label: `${titleCase(sub)}${actionSuffix}` };
  }
  return { group: tabLabel, label: `${tabLabel} tab${actionSuffix}` };
}
