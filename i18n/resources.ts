import translations from "./translations.json";
import lodash from "lodash";
import { getResources } from "./utils";
import { Resource } from "i18next";

type FlatResourceType = {
  [k in keyof typeof initResources]: string;
};
export const initResources: Resource = await getResources();

const handelReduceResources = (
  arr: (FlatResourceType & {
    id: string;
    spec: string;
  })[],
  init: Resource,
  {
    group,
  }: {
    group: string;
  },
) =>
  arr.reduce((prev, cur) => {
    Object.keys(cur).forEach((k) => {
      const key = k as keyof Resource;
      if (prev[key]) {
        const translation = prev[key].translation as any;

        if (!translation[group]) {
          translation[group] = {};
        }
        Object.assign(translation[group], { [cur.id]: cur[key] });
      }
    });

    return prev;
  }, init);

const translationsResources = translations.map((translation) =>
  handelReduceResources(translation.collections, initResources, {
    group: translation.group,
  }),
);
const mergeResources = lodash.merge({}, ...translationsResources);

export const resources = mergeResources;
