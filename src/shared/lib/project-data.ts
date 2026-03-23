import maivandInfo from "../../../docs/maivand/info.json";

export function getProfileBasics() {
  return maivandInfo as Record<string, unknown>;
}
