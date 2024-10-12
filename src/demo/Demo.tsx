enum Color {
    红色 = '红色',
    Blue = 'Blue',
}

const intro = `一个帅气颜色 => ${Color.红色}`;

const hasAuth = (k: string) => {
    return true
}

export const Demo = () => {
    return <>
        <div>
            工作台
        </div>
        <div>
            {'驾驶舱'}
        </div>
        <div>
            {intro}
        </div>
        <input defaultValue={'驾驶舱'}></input>

        <div>
            {
                Color.红色
            }
        </div>
        <div>
            {
                hasAuth('工作台') ? '有权限' : '无权限'
            }
            {
                ['红色', Color.红色, Color.Blue].includes(Color.红色) && <input defaultValue={Color.红色}></input>
            }
        </div>


    </>;
};