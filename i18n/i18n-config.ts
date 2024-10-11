import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import {resources} from "./resources";

i18n
    // 注入 react-i18next 实例
    .use(initReactI18next)
    // 初始化 i18next
    // 配置参数的文档: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: "zh",
        interpolation: {
            escapeValue: false
        },
        lng: localStorage.getItem('i18Lng') || 'zh',
        resources
    });

export default i18n;
