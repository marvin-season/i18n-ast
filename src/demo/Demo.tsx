import { t } from 'i18next';
const menuData = ['驾驶舱'];
const hasMenu = (name: string) => {
  return !!menuData.find((item: any) => item === name);
};
export const Demo = () => {
  return <>
        {menuData.find(item => ['驾驶舱', '数据集'].includes(item)) && hasMenu('驾驶舱') && <div data-nav={t('ask-and-learn.IeTBGXx_Mlf-L4YdX02hM')}>{t('ask-and-learn.k19hPwg4bzcFkkpehbZv5')}</div>}
    </>;
};