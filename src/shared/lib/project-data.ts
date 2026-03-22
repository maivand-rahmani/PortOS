import maivandInfo from "../../../docs/maivand/info.json";

export const maivandProfile = maivandInfo;

export function getProfileProjects() {
  const rawProjects = (maivandProfile as Record<string, unknown>).projects;

  return Array.isArray(rawProjects) ? rawProjects : [];
}

export function getProfileBasics() {
  return maivandProfile as Record<string, unknown>;
}
