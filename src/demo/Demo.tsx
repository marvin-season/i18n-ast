const menuData = ['驾驶舱']
const hasMenu = (name: string) => {
    return !!menuData.find((item: any) => item === name);
};
export const Demo = () => {
    return <>
        {
            menuData.find(
                (item) => ['驾驶舱', '数据集'].includes(item)
            ) && hasMenu('驾驶舱') && (<div data-nav={'驾驶舱data'}>驾驶舱menu</div>)
        }
    </>
}