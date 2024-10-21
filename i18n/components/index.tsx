import { languages } from "../utils";
import React from "react";
import i18n, { t } from "i18next";
export const I18nSwitcher = () => {
  return (
    <>
      <select
        defaultValue={i18n.resolvedLanguage}
        onChange={async (evt) => {
          await i18n.changeLanguage(evt.target.value);
        }}
      >
        {languages.map((lng) => (
          <option
            key={lng.value}
            value={lng.value}
            label={lng.name}
            style={{
              fontWeight:
                i18n.resolvedLanguage === lng.value ? "bolder" : "normal",
            }}
          />
        ))}
      </select>
    </>
  );
};
