enum Color {
    红色 = '红色',
    Blue = 'Blue',
}

const array = ['工作台', '驾驶舱', '红色', Color.红色, Color.Blue]

const intro = `${'介绍'}：一个帅气颜色: ${Color.红色}对吧！`;

const hasAuth = (k: string) => {
    console.log({array, k})
    return array.includes(k);
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
        </div>
        <div>
            {
                array.includes(Color.红色) && <input defaultValue={Color.红色}></input>
            }
        </div>

        <div>
            {array.map((item, index) => (<div key={index}>{item.length <= 5 && item}</div>))}
        </div>
    </>;
};