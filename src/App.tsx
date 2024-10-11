import {Demo} from "./demo/Demo.tsx";

function App() {

    return (
        <>
            <div onClick={(e: any) => {
                localStorage.setItem('i18Lng', e.target.value);
                window.location.reload()
            }}>
                <input name={'lang'} checked={localStorage.getItem('i18Lng') === 'zh'} type="radio" value={'zh'}/>
                <input name={'lang'} checked={localStorage.getItem('i18Lng') === 'en'} type="radio" value={'en'}/>
            </div>
            <Demo/>
        </>
    )
}

export default App
