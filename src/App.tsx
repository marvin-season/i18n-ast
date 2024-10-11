import {Demo} from "./demo/Demo.tsx";
import i18n from "i18next";

const languages = ['en', 'zh']

function App() {

    return (
        <>
            <select defaultValue={i18n.resolvedLanguage} onChange={async (evt) => {
                await i18n.changeLanguage(evt.target.value)
                window.location.reload()
            }}>
                {languages.map((lng) => (
                    <option key={lng} value={lng} label={lng}
                            style={{fontWeight: i18n.resolvedLanguage === lng ? 'bolder' : 'normal'}}/>
                ))}
            </select>
            <Demo/>
        </>
    )
}

export default App
